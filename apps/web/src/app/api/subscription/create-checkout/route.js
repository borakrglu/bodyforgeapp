import Stripe from "stripe";
import { sql } from "../../utils/sql";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Price IDs from Stripe Dashboard
const PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_MONTHLY || "price_monthly",
  yearly: process.env.STRIPE_PRICE_YEARLY || "price_yearly",
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, plan, successUrl, cancelUrl } = body;

    if (!userId || !plan) {
      return Response.json({ error: "User ID and plan required" }, { status: 400 });
    }

    if (!["monthly", "yearly"].includes(plan)) {
      return Response.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Get user email
    const userResult = await sql`
      SELECT email, stripe_customer_id FROM users WHERE id = ${userId}
    `;

    if (userResult.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const user = userResult[0];
    let customerId = user.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId },
      });
      customerId = customer.id;

      // Save customer ID
      await sql`
        UPDATE users SET stripe_customer_id = ${customerId} WHERE id = ${userId}
      `;
    }

    // Determine URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://bodyforge.app";
    const success = successUrl || `${baseUrl}/premium/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancel = cancelUrl || `${baseUrl}/premium`;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: PRICE_IDS[plan],
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: success,
      cancel_url: cancel,
      subscription_data: {
        metadata: {
          userId,
          plan,
        },
        trial_period_days: plan === "monthly" ? 7 : 0, // 7-day trial for monthly
      },
      metadata: {
        userId,
        plan,
      },
      allow_promotion_codes: true,
    });

    return Response.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error("Create checkout error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

// Get checkout session status
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("sessionId");

    if (!sessionId) {
      return Response.json({ error: "Session ID required" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return Response.json({
      status: session.status,
      paymentStatus: session.payment_status,
      customerId: session.customer,
      subscriptionId: session.subscription,
    });
  } catch (error) {
    console.error("Get session error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
