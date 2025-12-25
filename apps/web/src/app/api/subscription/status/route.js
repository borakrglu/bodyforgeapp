import { sql } from "../../utils/sql";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "User ID required" }, { status: 400 });
    }

    // Get user's subscription status
    const userResult = await sql`
      SELECT 
        id,
        email,
        premium_active,
        subscription_id,
        subscription_provider,
        subscription_plan,
        subscription_expires_at,
        total_xp,
        current_level
      FROM users 
      WHERE id = ${userId}
    `;

    if (userResult.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const user = userResult[0];
    
    // Check if subscription is still valid
    const now = new Date();
    const expiresAt = user.subscription_expires_at ? new Date(user.subscription_expires_at) : null;
    const isExpired = expiresAt && expiresAt < now;

    // If expired, update user record
    if (isExpired && user.premium_active) {
      await sql`
        UPDATE users 
        SET premium_active = false 
        WHERE id = ${userId}
      `;
      user.premium_active = false;
    }

    return Response.json({
      isPremium: user.premium_active || false,
      subscription: user.subscription_id ? {
        id: user.subscription_id,
        provider: user.subscription_provider,
        plan: user.subscription_plan,
        expiresAt: user.subscription_expires_at,
        isExpired,
      } : null,
    });
  } catch (error) {
    console.error("Subscription status error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, subscriptionId, provider, plan, expiresAt } = body;

    if (!userId) {
      return Response.json({ error: "User ID required" }, { status: 400 });
    }

    // Update subscription status
    await sql`
      UPDATE users 
      SET 
        premium_active = true,
        subscription_id = ${subscriptionId || null},
        subscription_provider = ${provider || null},
        subscription_plan = ${plan || null},
        subscription_expires_at = ${expiresAt || null},
        updated_at = NOW()
      WHERE id = ${userId}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Update subscription error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Cancel subscription
export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "User ID required" }, { status: 400 });
    }

    // Update subscription status
    await sql`
      UPDATE users 
      SET 
        premium_active = false,
        subscription_id = null,
        subscription_provider = null,
        subscription_plan = null,
        subscription_expires_at = null,
        updated_at = NOW()
      WHERE id = ${userId}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
