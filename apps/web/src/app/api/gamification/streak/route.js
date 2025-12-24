import sql from "@/app/api/utils/sql";

function dateDiffInDays(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return Response.json({ error: "Missing userId" }, { status: 400 });
    }

    const today = new Date().toISOString().split("T")[0];

    // Get user streak data
    const users = await sql`
      SELECT current_streak, longest_streak, last_activity_date
      FROM users
      WHERE id = ${userId}
    `;

    if (users.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[0];
    let currentStreak = user.current_streak || 0;
    let longestStreak = user.longest_streak || 0;
    const lastActivityDate = user.last_activity_date;

    // Check if activity is today
    if (lastActivityDate === today) {
      return Response.json({
        success: true,
        alreadyLogged: true,
        currentStreak,
        longestStreak,
      });
    }

    // Calculate new streak
    if (!lastActivityDate) {
      currentStreak = 1;
    } else {
      const daysDiff = dateDiffInDays(lastActivityDate, today);

      if (daysDiff === 1) {
        currentStreak += 1;
      } else if (daysDiff > 1) {
        currentStreak = 1;
      }
    }

    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    // Update user
    await sql`
      UPDATE users
      SET current_streak = ${currentStreak},
          longest_streak = ${longestStreak},
          last_activity_date = ${today}
      WHERE id = ${userId}
    `;

    // Update leaderboard
    await sql`
      INSERT INTO leaderboard_streak (user_id, longest_streak)
      VALUES (${userId}, ${longestStreak})
      ON CONFLICT (user_id)
      DO UPDATE SET longest_streak = ${longestStreak}, updated_at = NOW()
    `;

    // Award streak badges
    if (currentStreak === 7) {
      await fetch(`${process.env.APP_URL}/api/gamification/badges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, badgeId: "week_streak" }),
      });
    }

    if (currentStreak === 30) {
      await fetch(`${process.env.APP_URL}/api/gamification/badges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, badgeId: "month_streak" }),
      });
    }

    // Award XP for streak
    let streakXP = 10;
    if (currentStreak >= 7) streakXP = 50;
    if (currentStreak >= 30) streakXP = 200;

    await fetch(`${process.env.APP_URL}/api/gamification/add-xp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        actionType: "daily_streak",
        xpAmount: streakXP,
      }),
    });

    return Response.json({
      success: true,
      currentStreak,
      longestStreak,
      xpAwarded: streakXP,
    });
  } catch (error) {
    console.error("Error updating streak:", error);
    return Response.json(
      { error: "Failed to update streak", details: error.message },
      { status: 500 },
    );
  }
}
