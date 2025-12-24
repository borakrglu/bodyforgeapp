import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "xp";
    const limit = parseInt(searchParams.get("limit") || "50");

    if (type === "xp") {
      const leaderboard = await sql`
        SELECT 
          l.user_id,
          l.total_xp,
          l.current_level,
          u.email,
          u.premium_active
        FROM leaderboard_xp l
        JOIN users u ON l.user_id = u.id
        ORDER BY l.total_xp DESC
        LIMIT ${limit}
      `;

      return Response.json({
        success: true,
        type: "xp",
        leaderboard: leaderboard.map((entry, index) => ({
          rank: index + 1,
          userId: entry.user_id,
          email: entry.email,
          totalXP: entry.total_xp,
          level: entry.current_level,
          isPremium: entry.premium_active,
        })),
      });
    } else if (type === "streak") {
      const leaderboard = await sql`
        SELECT 
          l.user_id,
          l.longest_streak,
          u.email,
          u.current_streak,
          u.premium_active
        FROM leaderboard_streak l
        JOIN users u ON l.user_id = u.id
        ORDER BY l.longest_streak DESC
        LIMIT ${limit}
      `;

      return Response.json({
        success: true,
        type: "streak",
        leaderboard: leaderboard.map((entry, index) => ({
          rank: index + 1,
          userId: entry.user_id,
          email: entry.email,
          longestStreak: entry.longest_streak,
          currentStreak: entry.current_streak,
          isPremium: entry.premium_active,
        })),
      });
    }

    return Response.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return Response.json(
      { error: "Failed to fetch leaderboard", details: error.message },
      { status: 500 },
    );
  }
}
