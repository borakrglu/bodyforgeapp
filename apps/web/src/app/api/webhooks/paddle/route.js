import sql from "@/app/api/utils/sql";
import crypto from "crypto";

export async function POST(request) {
  try {
    const body = await request.text();
    const event = JSON.parse(body);

    // Verify Paddle webhook signature
    const signature = request.headers.get("paddle-signature");
    if (!verifyPaddleSignature(body, signature)) {
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }

    const eventType = event.event_type;

    // Handle different Paddle events
    switch (eventType) {
      case "subscription.created":
      case "subscription.updated":
        await handlePaddleSubscription(event);
        break;

      case "subscription.cancelled":
        await handlePaddleCancellation(event);
        break;

      case "transaction.completed":
        await handlePaddleTransaction(event);
        break;

      default:
        console.log("Unhandled Paddle event:", eventType);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Paddle webhook error:", error);
    return Response.json(
      { error: "Webhook processing failed", details: error.message },
      { status: 500 },
    );
  }
}

function verifyPaddleSignature(body, signature) {
  // Implement Paddle signature verification
  // For now, return true (implement proper verification in production)
  return true;
}

async function handlePaddleSubscription(event) {
  const passthrough = JSON.parse(event.passthrough || "{}");
  const userId = passthrough.userId;
  const planId = passthrough.planId;

  if (!userId) {
    console.error("No userId in Paddle passthrough");
    return;
  }

  // Calculate expiry date based on billing cycle
  const nextBillDate = event.next_bill_date
    ? new Date(event.next_bill_date)
    : null;

  await sql`
    UPDATE users
    SET 
      pt_active = true,
      pt_expiry = ${nextBillDate?.toISOString()},
      pt_plan = ${planId},
      pt_provider = 'paddle',
      pt_transaction_id = ${event.subscription_id}
    WHERE id = ${userId}
  `;

  console.log(`PT activated via Paddle for user ${userId}, plan: ${planId}`);
}

async function handlePaddleCancellation(event) {
  const subscriptionId = event.subscription_id;

  await sql`
    UPDATE users
    SET 
      pt_active = false
    WHERE pt_transaction_id = ${subscriptionId} AND pt_provider = 'paddle'
  `;

  console.log(`PT cancelled via Paddle: ${subscriptionId}`);
}

async function handlePaddleTransaction(event) {
  // Handle one-time PT purchases
  const passthrough = JSON.parse(event.passthrough || "{}");
  const userId = passthrough.userId;
  const planId = passthrough.planId;

  if (!userId || planId !== "transformation") {
    return;
  }

  // 12-week transformation = 84 days
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 84);

  await sql`
    UPDATE users
    SET 
      pt_active = true,
      pt_expiry = ${expiryDate.toISOString()},
      pt_plan = ${planId},
      pt_provider = 'paddle',
      pt_transaction_id = ${event.transaction_id}
    WHERE id = ${userId}
  `;

  console.log(`12-week transformation activated for user ${userId}`);
}
