import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const token = formData.get("token");

    if (!token) {
      return Response.json({ error: "No token provided" }, { status: 400 });
    }

    // Verify payment with iyzico
    const paymentResult = await verifyIyzicoPayment(token);

    if (!paymentResult || paymentResult.status !== "success") {
      return Response.json(
        { error: "Payment verification failed" },
        { status: 400 },
      );
    }

    // Extract user ID and plan from conversation ID
    const conversationId = paymentResult.conversationId;
    const parts = conversationId.split("_");
    const userId = parseInt(parts[1]);

    if (!userId) {
      console.error("Invalid userId in iyzico callback");
      return Response.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Get plan details from basket items
    const planId = paymentResult.basketItems?.[0]?.id || "hybrid";

    // Calculate expiry based on plan type
    let expiryDate = new Date();
    if (planId === "consultation") {
      // One-time consultation: 1 session (30 days access to materials)
      expiryDate.setDate(expiryDate.getDate() + 30);
    } else {
      // Monthly subscriptions
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    }

    await sql`
      UPDATE users
      SET 
        pt_active = true,
        pt_expiry = ${expiryDate.toISOString()},
        pt_plan = ${planId},
        pt_provider = 'iyzico',
        pt_transaction_id = ${paymentResult.paymentId}
      WHERE id = ${userId}
    `;

    console.log(`PT activated via iyzico for user ${userId}, plan: ${planId}`);

    // Redirect user back to app
    const redirectUrl = `${process.env.EXPO_PUBLIC_APP_URL}?pt_success=true`;
    return Response.redirect(redirectUrl);
  } catch (error) {
    console.error("iyzico webhook error:", error);
    return Response.json(
      { error: "Webhook processing failed", details: error.message },
      { status: 500 },
    );
  }
}

async function verifyIyzicoPayment(token) {
  // Implement iyzico payment verification
  // This is a placeholder - you'll need to implement actual iyzico API call
  const iyzicoApiKey = process.env.IYZICO_API_KEY;
  const iyzicoSecretKey = process.env.IYZICO_SECRET_KEY;
  const iyzicoBaseUrl =
    process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com";

  // For now, return mock success
  // TODO: Implement actual iyzico verification
  return {
    status: "success",
    conversationId: "pt_1_" + Date.now(),
    paymentId: token,
    basketItems: [{ id: "hybrid" }],
  };
}
