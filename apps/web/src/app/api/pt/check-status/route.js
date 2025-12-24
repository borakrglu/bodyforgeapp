import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    const users = await sql`
      SELECT pt_active, pt_expiry, pt_plan, pt_provider
      FROM users
      WHERE id = ${userId}
    `;

    if (users.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[0];

    // Check if PT subscription is still active
    const isActive =
      user.pt_active &&
      (!user.pt_expiry || new Date(user.pt_expiry) > new Date());

    return Response.json({
      pt_active: isActive,
      pt_plan: user.pt_plan,
      pt_provider: user.pt_provider,
      pt_expiry: user.pt_expiry,
    });
  } catch (error) {
    console.error("PT status check error:", error);
    return Response.json(
      { error: "Failed to check PT status", details: error.message },
      { status: 500 },
    );
  }
}
