import sql from "@/app/api/utils/sql";

function getWeekStart(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split("T")[0];
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "Missing userId" }, { status: 400 });
    }

    const today = new Date().toISOString().split("T")[0];
    const weekStart = getWeekStart();

    // Get daily quests
    let dailyQuests = await sql`
      SELECT * FROM daily_quests
      WHERE user_id = ${userId} AND quest_date = ${today}
    `;

    // Generate daily quests if not exists
    if (dailyQuests.length === 0) {
      const questTemplates = [
        {
          type: "workout_complete",
          description: "Complete today's workout",
          xp: 100,
        },
        {
          type: "water_intake",
          description: "Drink 2 liters of water",
          xp: 50,
        },
        { type: "meal_log", description: "Log at least one meal", xp: 50 },
        {
          type: "ai_generation",
          description: "Generate or regenerate a plan",
          xp: 30,
        },
      ];

      for (const quest of questTemplates) {
        await sql`
          INSERT INTO daily_quests (user_id, quest_date, quest_type, quest_description, xp_reward)
          VALUES (${userId}, ${today}, ${quest.type}, ${quest.description}, ${quest.xp})
          ON CONFLICT DO NOTHING
        `;
      }

      dailyQuests = await sql`
        SELECT * FROM daily_quests
        WHERE user_id = ${userId} AND quest_date = ${today}
      `;
    }

    // Get weekly quests
    let weeklyQuests = await sql`
      SELECT * FROM weekly_quests
      WHERE user_id = ${userId} AND week_start = ${weekStart}
    `;

    // Generate weekly quests if not exists
    if (weeklyQuests.length === 0) {
      const weeklyTemplates = [
        {
          type: "workout_count",
          description: "Complete 4 workouts this week",
          target: 4,
          xp: 500,
        },
        {
          type: "pr_break",
          description: "Break 2 personal records",
          target: 2,
          xp: 300,
        },
        {
          type: "streak_maintain",
          description: "Maintain 7-day activity streak",
          target: 7,
          xp: 600,
        },
      ];

      for (const quest of weeklyTemplates) {
        await sql`
          INSERT INTO weekly_quests (user_id, week_start, quest_type, quest_description, target_value, xp_reward)
          VALUES (${userId}, ${weekStart}, ${quest.type}, ${quest.description}, ${quest.target}, ${quest.xp})
          ON CONFLICT DO NOTHING
        `;
      }

      weeklyQuests = await sql`
        SELECT * FROM weekly_quests
        WHERE user_id = ${userId} AND week_start = ${weekStart}
      `;
    }

    return Response.json({
      success: true,
      dailyQuests,
      weeklyQuests,
    });
  } catch (error) {
    console.error("Error fetching quests:", error);
    return Response.json(
      { error: "Failed to fetch quests", details: error.message },
      { status: 500 },
    );
  }
}
