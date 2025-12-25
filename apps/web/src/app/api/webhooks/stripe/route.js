import Stripe from "stripe";
import { sql } from "../../../utils/sql";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    let event;

    // Verify webhook signature
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return Response.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        await handleCheckoutComplete(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return Response.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

async function handleCheckoutComplete(session) {
  const userId = session.metadata?.userId;
  const plan = session.metadata?.plan;

  if (!userId) {
    console.error("No userId in checkout session metadata");
    return;
  }

  // Update user subscription status
  await sql`
    UPDATE users 
    SET 
      premium_active = true,
      subscription_id = ${session.subscription},
      subscription_provider = 'stripe',
      subscription_plan = ${plan || 'monthly'},
      stripe_customer_id = ${session.customer},
      updated_at = NOW()
    WHERE id = ${userId}
  `;

  console.log(`User ${userId} subscription activated via checkout`);
}

async function handleSubscriptionUpdate(subscription) {
  const userId = subscription.metadata?.userId;
  
  // Find user by customer ID if no userId in metadata
  let targetUserId = userId;
  if (!targetUserId) {
    const userResult = await sql`
      SELECT id FROM users WHERE stripe_customer_id = ${subscription.customer}
    `;
    if (userResult.length > 0) {
      targetUserId = userResult[0].id;
    }
  }

  if (!targetUserId) {
    console.error("Could not find user for subscription:", subscription.id);
    return;
  }

  const isActive = subscription.status === "active" || subscription.status === "trialing";
  const expiresAt = new Date(subscription.current_period_end * 1000);
  const plan = subscription.metadata?.plan || "monthly";

  await sql`
    UPDATE users 
    SET 
      premium_active = ${isActive},
      subscription_id = ${subscription.id},
      subscription_provider = 'stripe',
      subscription_plan = ${plan},
      subscription_expires_at = ${expiresAt.toISOString()},
      updated_at = NOW()
    WHERE id = ${targetUserId}
  `;

  console.log(`User ${targetUserId} subscription updated: ${subscription.status}`);
}

async function handleSubscriptionCanceled(subscription) {
  const userResult = await sql`
    SELECT id FROM users WHERE subscription_id = ${subscription.id}
  `;

  if (userResult.length === 0) {
    console.error("Could not find user for canceled subscription:", subscription.id);
    return;
  }

  const userId = userResult[0].id;

  await sql`
    UPDATE users 
    SET 
      premium_active = false,
      subscription_id = null,
      subscription_plan = null,
      subscription_expires_at = null,
      updated_at = NOW()
    WHERE id = ${userId}
  `;

  console.log(`User ${userId} subscription canceled`);
}

async function handlePaymentSucceeded(invoice) {
  if (!invoice.subscription) return;

  const userResult = await sql`
    SELECT id FROM users WHERE stripe_customer_id = ${invoice.customer}
  `;

  if (userResult.length === 0) return;

  const userId = userResult[0].id;

  // Ensure premium is active after successful payment
  await sql`
    UPDATE users 
    SET 
      premium_active = true,
      updated_at = NOW()
    WHERE id = ${userId}
  `;

  console.log(`Payment succeeded for user ${userId}`);
}

async function handlePaymentFailed(invoice) {
  if (!invoice.subscription) return;

  const userResult = await sql`
    SELECT id, email FROM users WHERE stripe_customer_id = ${invoice.customer}
  `;

  if (userResult.length === 0) return;

  const user = userResult[0];

  // Log failed payment - could send email notification here
  console.log(`Payment failed for user ${user.id} (${user.email})`);

  // Don't immediately cancel - Stripe will retry
  // After final failure, subscription.deleted event will fire
}
