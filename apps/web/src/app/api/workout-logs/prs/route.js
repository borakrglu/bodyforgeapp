import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const muscleGroup = searchParams.get("muscleGroup");

    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    // Fetch all workout logs for user
    const logs = await sql`
      SELECT * FROM workout_logs
      WHERE user_id = ${userId}
      ORDER BY workout_date DESC
    `;

    // Calculate PRs from exercises
    const prMap = new Map();
    const recentPRs = [];

    logs.forEach((log) => {
      const exercises = log.exercises || [];
      const logDate = log.workout_date;

      exercises.forEach((exercise) => {
        if (!exercise.name || !exercise.sets) return;

        const exerciseName = exercise.name;
        const sets = exercise.sets || [];

        sets.forEach((set) => {
          if (!set.weight || !set.reps || set.weight <= 0 || set.reps <= 0)
            return;

          const weight = parseFloat(set.weight);
          const reps = parseInt(set.reps);

          // Calculate 1RM using Epley formula: weight × (1 + reps / 30)
          const estimatedOneRM = weight * (1 + reps / 30);

          const currentPR = prMap.get(exerciseName);

          if (!currentPR || estimatedOneRM > currentPR.estimatedOneRM) {
            const previousBest = currentPR
              ? {
                  weight: currentPR.weight,
                  reps: currentPR.reps,
                  estimatedOneRM: currentPR.estimatedOneRM,
                  date: currentPR.date,
                }
              : null;

            prMap.set(exerciseName, {
              exercise: exerciseName,
              weight,
              reps,
              estimatedOneRM,
              date: logDate,
              muscleGroup: exercise.muscleGroup || "Other",
              previousBest,
            });

            // Track recent PRs (within last 30 days)
            const daysSincePR =
              (new Date() - new Date(logDate)) / (1000 * 60 * 60 * 24);
            if (daysSincePR <= 30) {
              recentPRs.push({
                exercise: exerciseName,
                weight,
                reps,
                estimatedOneRM,
                date: logDate,
                muscleGroup: exercise.muscleGroup || "Other",
                previousBest,
              });
            }
          }
        });
      });
    });

    let prs = Array.from(prMap.values());

    // Filter by muscle group if provided
    if (muscleGroup && muscleGroup !== "all") {
      prs = prs.filter(
        (pr) => pr.muscleGroup.toLowerCase() === muscleGroup.toLowerCase(),
      );
    }

    // Sort by estimated 1RM (strongest first)
    prs.sort((a, b) => b.estimatedOneRM - a.estimatedOneRM);

    // Sort recent PRs by date (newest first)
    recentPRs.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Get unique muscle groups
    const muscleGroups = [
      ...new Set(Array.from(prMap.values()).map((pr) => pr.muscleGroup)),
    ].sort();

    return Response.json({
      prs,
      recentPRs: recentPRs.slice(0, 10), // Top 10 recent PRs
      muscleGroups,
      totalPRs: prMap.size,
    });
  } catch (error) {
    console.error("Error fetching PRs:", error);
    return Response.json({ error: "Failed to fetch PRs" }, { status: 500 });
  }
}
