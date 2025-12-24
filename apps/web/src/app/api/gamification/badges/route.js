import sql from "@/app/api/utils/sql";

// Badge definitions
const BADGE_DEFINITIONS = {
  first_workout: {
    name: "First Workout",
    tier: "bronze",
    description: "Complete your first workout",
  },
  first_meal_log: {
    name: "Meal Logger",
    tier: "bronze",
    description: "Log your first meal",
  },
  week_streak: {
    name: "Week Warrior",
    tier: "silver",
    description: "Maintain a 7-day streak",
  },
  month_streak: {
    name: "Monthly Champion",
    tier: "gold",
    description: "Maintain a 30-day streak",
  },
  bench_100kg: {
    name: "Bench 100kg Club",
    tier: "gold",
    description: "Bench press 100kg",
  },
  plan_designer: {
    name: "Plan Designer",
    tier: "silver",
    description: "Generate 5 AI plans",
  },
  transformation_starter: {
    name: "Transformation Starter",
    tier: "bronze",
    description: "Track progress for 7 days",
  },
  shredder_mode: {
    name: "Shredder Mode",
    tier: "gold",
    description: "Reach below 15% body fat",
  },
  level_10: {
    name: "Iron Warrior",
    tier: "silver",
    description: "Reach level 10",
  },
  level_20: { name: "Titan Mode", tier: "gold", description: "Reach level 20" },
  level_30: {
    name: "Apex Physique",
    tier: "platinum",
    description: "Reach level 30",
  },
  premium_member: {
    name: "Premium Elite",
    tier: "diamond",
    description: "Join Premium",
  },
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "Missing userId" }, { status: 400 });
    }

    // Get user's unlocked badges
    const unlockedBadges = await sql`
      SELECT * FROM user_badges
      WHERE user_id = ${userId}
      ORDER BY unlocked_at DESC
    `;

    // Return all badge definitions with unlock status
    const allBadges = Object.keys(BADGE_DEFINITIONS).map((badgeId) => {
      const definition = BADGE_DEFINITIONS[badgeId];
      const unlocked = unlockedBadges.find((b) => b.badge_id === badgeId);

      return {
        badgeId,
        name: definition.name,
        tier: definition.tier,
        description: definition.description,
        unlocked: !!unlocked,
        unlockedAt: unlocked?.unlocked_at || null,
      };
    });

    return Response.json({
      success: true,
      badges: allBadges,
      totalUnlocked: unlockedBadges.length,
      totalBadges: Object.keys(BADGE_DEFINITIONS).length,
    });
  } catch (error) {
    console.error("Error fetching badges:", error);
    return Response.json(
      { error: "Failed to fetch badges", details: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const { userId, badgeId } = await request.json();

    if (!userId || !badgeId) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const definition = BADGE_DEFINITIONS[badgeId];
    if (!definition) {
      return Response.json({ error: "Invalid badge ID" }, { status: 400 });
    }

    // Award badge
    await sql`
      INSERT INTO user_badges (user_id, badge_id, badge_name, badge_tier)
      VALUES (${userId}, ${badgeId}, ${definition.name}, ${definition.tier})
      ON CONFLICT (user_id, badge_id) DO NOTHING
    `;

    return Response.json({
      success: true,
      badge: {
        badgeId,
        ...definition,
      },
    });
  } catch (error) {
    console.error("Error awarding badge:", error);
    return Response.json(
      { error: "Failed to award badge", details: error.message },
      { status: 500 },
    );
  }
}
