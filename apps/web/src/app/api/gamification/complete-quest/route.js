import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { userId, questId, questType } = await request.json();

    if (!userId || !questId || !questType) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    let quest;
    let table = questType === "daily" ? "daily_quests" : "weekly_quests";

    // Mark quest as completed
    if (questType === "daily") {
      const result = await sql`
        UPDATE daily_quests
        SET is_completed = true, completed_at = NOW()
        WHERE id = ${questId} AND user_id = ${userId} AND is_completed = false
        RETURNING *
      `;
      quest = result[0];
    } else {
      const result = await sql`
        UPDATE weekly_quests
        SET is_completed = true, completed_at = NOW()
        WHERE id = ${questId} AND user_id = ${userId} AND is_completed = false
        RETURNING *
      `;
      quest = result[0];
    }

    if (!quest) {
      return Response.json(
        { error: "Quest not found or already completed" },
        { status: 404 },
      );
    }

    // Award XP
    const xpReward = quest.xp_reward;
    const addXPResponse = await fetch(
      `${process.env.APP_URL}/api/gamification/add-xp`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          actionType: `quest_${questType}`,
          xpAmount: xpReward,
        }),
      },
    );

    if (!addXPResponse.ok) {
      throw new Error("Failed to add XP");
    }

    const xpData = await addXPResponse.json();

    return Response.json({
      success: true,
      questCompleted: quest,
      xpAwarded: xpReward,
      leveledUp: xpData.leveledUp,
      newLevel: xpData.newLevel,
      levelTitle: xpData.levelTitle,
    });
  } catch (error) {
    console.error("Error completing quest:", error);
    return Response.json(
      { error: "Failed to complete quest", details: error.message },
      { status: 500 },
    );
  }
}
