import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const {
      userId,
      coachId,
      planId,
      country,
      provider,
      amount,
      currency,
      type,
    } = await request.json();

    if (!userId || !planId || !provider) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const redirectURL =
      process.env.EXPO_PUBLIC_APP_URL || "https://ironmindai.com";

    if (provider === "iyzico") {
      // iyzico checkout for Turkey
      const checkoutUrl = await createIyzicoCheckout({
        userId,
        coachId,
        planId,
        amount,
        currency,
        type,
        redirectURL,
      });

      return Response.json({ checkoutUrl });
    } else if (provider === "paddle") {
      // Paddle checkout for global
      const checkoutUrl = await createPaddleCheckout({
        userId,
        coachId,
        planId,
        amount,
        currency,
        type,
        redirectURL,
      });

      return Response.json({ checkoutUrl });
    } else {
      return Response.json(
        { error: "Invalid payment provider" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("PT checkout creation error:", error);
    return Response.json(
      { error: "Failed to create checkout", details: error.message },
      { status: 500 },
    );
  }
}

async function createIyzicoCheckout({
  userId,
  coachId,
  planId,
  amount,
  currency,
  type,
  redirectURL,
}) {
  // Get user details
  const users = await sql`SELECT email, gender FROM users WHERE id = ${userId}`;
  if (users.length === 0) {
    throw new Error("User not found");
  }

  const user = users[0];

  // iyzico implementation
  // Note: You'll need to add iyzico credentials to env variables
  const iyzicoApiKey = process.env.IYZICO_API_KEY;
  const iyzicoSecretKey = process.env.IYZICO_SECRET_KEY;
  const iyzicoBaseUrl =
    process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com";

  // Create iyzico checkout page
  const checkoutFormData = {
    locale: "tr",
    conversationId: `pt_${userId}_${Date.now()}`,
    price: (amount / 100).toFixed(2),
    paidPrice: (amount / 100).toFixed(2),
    currency: "TRY",
    basketId: `basket_${userId}`,
    paymentGroup: "SUBSCRIPTION",
    callbackUrl: `${redirectURL}/api/pt/iyzico/callback`,
    enabledInstallments: [1],
    buyer: {
      id: userId.toString(),
      name: user.gender === "male" ? "User" : "User",
      surname: userId.toString(),
      email: user.email,
      identityNumber: "11111111111",
      registrationAddress: "Turkey",
      city: "Istanbul",
      country: "Turkey",
    },
    shippingAddress: {
      contactName: `User ${userId}`,
      city: "Istanbul",
      country: "Turkey",
      address: "Turkey",
    },
    billingAddress: {
      contactName: `User ${userId}`,
      city: "Istanbul",
      country: "Turkey",
      address: "Turkey",
    },
    basketItems: [
      {
        id: planId,
        name: `PT Coaching - ${planId}`,
        category1: "PT Coaching",
        itemType: "VIRTUAL",
        price: (amount / 100).toFixed(2),
      },
    ],
  };

  // For now, return a placeholder URL
  // You'll need to implement actual iyzico API calls
  const checkoutUrl = `${iyzicoBaseUrl}/checkout/form?data=${encodeURIComponent(JSON.stringify(checkoutFormData))}`;

  return checkoutUrl;
}

async function createPaddleCheckout({
  userId,
  coachId,
  planId,
  amount,
  currency,
  type,
  redirectURL,
}) {
  // Paddle implementation
  // Note: You'll need to add Paddle credentials to env variables
  const paddleVendorId = process.env.PADDLE_VENDOR_ID;
  const paddleApiKey = process.env.PADDLE_API_KEY;
  const paddleProductId = getPaddleProductId(planId);

  // Create Paddle checkout URL
  const paddleParams = new URLSearchParams({
    vendor: paddleVendorId || "0",
    product: paddleProductId,
    email: "", // User email if available
    passthrough: JSON.stringify({ userId, coachId, planId }),
    success_url: `${redirectURL}?pt_success=true`,
    cancel_url: redirectURL,
  });

  const checkoutUrl = `https://buy.paddle.com/checkout?${paddleParams.toString()}`;

  return checkoutUrl;
}

function getPaddleProductId(planId) {
  const productMap = {
    hybrid: process.env.PADDLE_HYBRID_PRODUCT_ID || "0",
    full: process.env.PADDLE_FULL_PRODUCT_ID || "0",
    transformation: process.env.PADDLE_TRANSFORMATION_PRODUCT_ID || "0",
  };

  return productMap[planId] || "0";
}
