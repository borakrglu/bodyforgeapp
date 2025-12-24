import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    const sessions = await sql`
      SELECT 
        cs.*,
        c.name as coach_name,
        c.photo_url as coach_photo,
        c.specialization
      FROM coaching_sessions cs
      JOIN coaches c ON cs.coach_id = c.id
      WHERE cs.user_id = ${userId}
      ORDER BY cs.start_date DESC
    `;

    return Response.json({ sessions });
  } catch (error) {
    console.error("Error fetching coaching sessions:", error);
    return Response.json(
      { error: "Failed to fetch coaching sessions" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, coachId, tier, startDate, endDate } = body;

    if (!userId || !coachId || !tier) {
      return Response.json(
        { error: "userId, coachId, and tier are required" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO coaching_sessions (
        user_id, coach_id, tier, start_date, end_date, status
      )
      VALUES (
        ${userId}, ${coachId}, ${tier}, ${startDate}, ${endDate}, 'active'
      )
      RETURNING *
    `;

    return Response.json({ session: result[0] });
  } catch (error) {
    console.error("Error creating coaching session:", error);
    return Response.json(
      { error: "Failed to create coaching session" },
      { status: 500 },
    );
  }
}
