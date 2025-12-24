import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(req) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "all";
    const userId = session.user.id;

    // Build date filter based on the filter parameter
    let dateFilter = "";
    const now = new Date();

    if (filter === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      dateFilter = `AND workout_date >= '${weekAgo.toISOString().split("T")[0]}'`;
    } else if (filter === "month") {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      dateFilter = `AND workout_date >= '${monthAgo.toISOString().split("T")[0]}'`;
    }

    // Fetch workout logs
    const workouts = await sql`
      SELECT 
        id,
        workout_date,
        workout_name,
        exercises,
        duration_minutes,
        notes,
        created_at
      FROM workout_logs
      WHERE user_id = ${userId}
      ${sql.raw(dateFilter)}
      ORDER BY workout_date DESC, created_at DESC
      LIMIT 100
    `;

    // Calculate stats
    const totalWorkouts = workouts.length;
    const totalVolume = workouts.reduce((sum, w) => {
      if (!w.exercises) return sum;
      const exercises =
        typeof w.exercises === "string" ? JSON.parse(w.exercises) : w.exercises;
      const workoutVolume = exercises.reduce((exerciseSum, ex) => {
        if (ex.sets && Array.isArray(ex.sets)) {
          return (
            exerciseSum +
            ex.sets.reduce((setSum, set) => {
              return (
                setSum +
                (parseFloat(set.weight) || 0) * (parseFloat(set.reps) || 0)
              );
            }, 0)
          );
        }
        return exerciseSum;
      }, 0);
      return sum + workoutVolume;
    }, 0);

    const totalDuration = workouts.reduce(
      (sum, w) => sum + (w.duration_minutes || 0),
      0,
    );
    const avgDuration =
      totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

    return Response.json({
      workouts: workouts.map((w) => ({
        ...w,
        exercises:
          typeof w.exercises === "string"
            ? JSON.parse(w.exercises)
            : w.exercises,
      })),
      stats: {
        totalWorkouts,
        totalVolume: Math.round(totalVolume),
        avgDuration,
        totalDuration,
      },
    });
  } catch (error) {
    console.error("Error fetching workout history:", error);
    return Response.json(
      { error: "Failed to fetch workout history" },
      { status: 500 },
    );
  }
}
