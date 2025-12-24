import sql from "@/app/api/utils/sql";

// XP to Level mapping
function calculateLevel(totalXP) {
  if (totalXP < 500) return 1;
  if (totalXP < 1200) return 2;
  if (totalXP < 2000) return 3;
  if (totalXP < 3000) return 4;
  if (totalXP < 4500) return 5;
  if (totalXP < 6500) return 6;
  if (totalXP < 9000) return 7;
  if (totalXP < 12000) return 8;
  if (totalXP < 15500) return 9;
  if (totalXP < 20000) return 10;
  if (totalXP < 25000) return 11;
  if (totalXP < 30000) return 12;
  if (totalXP < 36000) return 13;
  if (totalXP < 43000) return 14;
  if (totalXP < 51000) return 15;
  if (totalXP < 60000) return 16;
  if (totalXP < 70000) return 17;
  if (totalXP < 81000) return 18;
  if (totalXP < 93000) return 19;
  if (totalXP < 106000) return 20;
  if (totalXP < 125000) return 25;
  if (totalXP < 150000) return 30;
  if (totalXP < 200000) return 40;
  return 50;
}

function getLevelTitle(level) {
  if (level <= 5) return "Beginner Iron";
  if (level <= 10) return "Steel Seeker";
  if (level <= 20) return "Iron Warrior";
  if (level <= 30) return "Titan Mode";
  if (level <= 50) return "Apex Physique";
  return "Legend Tier";
}

export async function POST(request) {
  try {
    const { userId, actionType, xpAmount } = await request.json();

    if (!userId || !actionType || !xpAmount) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get current user data
    const users =
      await sql`SELECT total_xp, current_level FROM users WHERE id = ${userId}`;
    if (users.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const currentXP = users[0].total_xp || 0;
    const currentLevel = users[0].current_level || 1;
    const newTotalXP = currentXP + xpAmount;
    const newLevel = calculateLevel(newTotalXP);
    const leveledUp = newLevel > currentLevel;

    // Update user XP and level
    await sql`
      UPDATE users
      SET total_xp = ${newTotalXP},
          current_level = ${newLevel}
      WHERE id = ${userId}
    `;

    // Log XP action
    await sql`
      INSERT INTO xp_actions (user_id, action_type, xp_gained)
      VALUES (${userId}, ${actionType}, ${xpAmount})
    `;

    // Update leaderboard
    await sql`
      INSERT INTO leaderboard_xp (user_id, total_xp, current_level)
      VALUES (${userId}, ${newTotalXP}, ${newLevel})
      ON CONFLICT (user_id)
      DO UPDATE SET total_xp = ${newTotalXP}, current_level = ${newLevel}, updated_at = NOW()
    `;

    return Response.json({
      success: true,
      xpGained: xpAmount,
      newTotalXP,
      newLevel,
      leveledUp,
      levelTitle: getLevelTitle(newLevel),
    });
  } catch (error) {
    console.error("Error adding XP:", error);
    return Response.json(
      { error: "Failed to add XP", details: error.message },
      { status: 500 },
    );
  }
}
