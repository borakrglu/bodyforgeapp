import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    const logs = await sql`
      SELECT * FROM workout_logs
      WHERE user_id = ${userId}
      ORDER BY workout_date DESC
      LIMIT 30
    `;

    return Response.json({ logs });
  } catch (error) {
    console.error("Error fetching workout logs:", error);
    return Response.json(
      { error: "Failed to fetch workout logs" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId,
      workoutDate,
      workoutName,
      exercises,
      durationMinutes,
      notes,
    } = body;

    if (!userId || !workoutName) {
      return Response.json(
        { error: "userId and workoutName are required" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO workout_logs (
        user_id, workout_date, workout_name, exercises, duration_minutes, notes
      )
      VALUES (
        ${userId}, 
        ${workoutDate || new Date().toISOString().split("T")[0]}, 
        ${workoutName}, 
        ${JSON.stringify(exercises)}, 
        ${durationMinutes}, 
        ${notes}
      )
      RETURNING *
    `;

    return Response.json({ log: result[0] });
  } catch (error) {
    console.error("Error creating workout log:", error);
    return Response.json(
      { error: "Failed to create workout log" },
      { status: 500 },
    );
  }
}
