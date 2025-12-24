import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const event = await request.json();

    // Verify webhook (RevenueCat doesn't require signature verification)
    const { event: eventType } = event;

    if (!eventType) {
      return Response.json({ error: "Invalid webhook" }, { status: 400 });
    }

    // Extract user ID from app_user_id
    const appUserId = event.event.app_user_id;
    const userId = parseInt(appUserId);

    if (!userId) {
      console.error("Invalid user ID in webhook:", appUserId);
      return Response.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Handle different event types
    switch (eventType.type) {
      case "INITIAL_PURCHASE":
      case "RENEWAL":
      case "UNCANCELLATION":
        await handlePurchaseEvent(event, userId);
        break;

      case "CANCELLATION":
      case "EXPIRATION":
        await handleCancellationEvent(event, userId);
        break;

      case "BILLING_ISSUE":
        await handleBillingIssue(event, userId);
        break;

      default:
        console.log("Unhandled event type:", eventType.type);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("RevenueCat webhook error:", error);
    return Response.json(
      { error: "Webhook processing failed", details: error.message },
      { status: 500 },
    );
  }
}

async function handlePurchaseEvent(event, userId) {
  const productId = event.event.product_id;
  const expiresDate = event.event.expiration_at_ms
    ? new Date(event.event.expiration_at_ms)
    : null;

  // Determine plan type from product ID
  let planType = "monthly";
  if (productId.includes("yearly") || productId.includes("year")) {
    planType = "yearly";
  }

  await sql`
    UPDATE users
    SET 
      premium_active = true,
      premium_expiry = ${expiresDate?.toISOString()},
      premium_plan = ${planType},
      revenuecat_user_id = ${event.event.app_user_id}
    WHERE id = ${userId}
  `;

  console.log(`Premium activated for user ${userId}, plan: ${planType}`);
}

async function handleCancellationEvent(event, userId) {
  await sql`
    UPDATE users
    SET 
      premium_active = false
    WHERE id = ${userId}
  `;

  console.log(`Premium cancelled for user ${userId}`);
}

async function handleBillingIssue(event, userId) {
  // You might want to send a notification to the user
  console.log(`Billing issue for user ${userId}`);
}
