import { sql } from "../../utils/sql";

// Get usage statistics for a user
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "User ID required" }, { status: 400 });
    }

    // Get or create usage record for current month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Check if usage_tracking table exists, if not return empty usage
    try {
      const usageResult = await sql`
        SELECT * FROM usage_tracking 
        WHERE user_id = ${userId} 
        AND period_start >= ${monthStart.toISOString()}
        AND period_end <= ${monthEnd.toISOString()}
      `;

      if (usageResult.length === 0) {
        // Return default usage (nothing used yet this month)
        return Response.json({
          usage: {
            workoutGenerations: 0,
            mealPlanGenerations: 0,
            supplementPlanGenerations: 0,
            programRegenerations: 0,
            savedPrograms: 0,
            progressPhotos: 0,
          },
          periodStart: monthStart.toISOString(),
          periodEnd: monthEnd.toISOString(),
        });
      }

      const usage = usageResult[0];
      return Response.json({
        usage: {
          workoutGenerations: usage.workout_generations || 0,
          mealPlanGenerations: usage.meal_plan_generations || 0,
          supplementPlanGenerations: usage.supplement_plan_generations || 0,
          programRegenerations: usage.program_regenerations || 0,
          savedPrograms: usage.saved_programs || 0,
          progressPhotos: usage.progress_photos || 0,
        },
        periodStart: usage.period_start,
        periodEnd: usage.period_end,
      });
    } catch (tableError) {
      // Table might not exist, return empty usage
      console.log("Usage tracking table may not exist:", tableError.message);
      return Response.json({
        usage: {
          workoutGenerations: 0,
          mealPlanGenerations: 0,
          supplementPlanGenerations: 0,
          programRegenerations: 0,
          savedPrograms: 0,
          progressPhotos: 0,
        },
        periodStart: monthStart.toISOString(),
        periodEnd: monthEnd.toISOString(),
      });
    }
  } catch (error) {
    console.error("Get usage error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Increment usage counter
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, type } = body;

    if (!userId || !type) {
      return Response.json({ error: "User ID and type required" }, { status: 400 });
    }

    const validTypes = [
      "workoutGenerations",
      "mealPlanGenerations",
      "supplementPlanGenerations",
      "programRegenerations",
      "savedPrograms",
      "progressPhotos",
    ];

    if (!validTypes.includes(type)) {
      return Response.json({ error: "Invalid usage type" }, { status: 400 });
    }

    // Map camelCase to snake_case column names
    const columnMap = {
      workoutGenerations: "workout_generations",
      mealPlanGenerations: "meal_plan_generations",
      supplementPlanGenerations: "supplement_plan_generations",
      programRegenerations: "program_regenerations",
      savedPrograms: "saved_programs",
      progressPhotos: "progress_photos",
    };

    const column = columnMap[type];
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    try {
      // Try to update existing record or insert new one
      await sql`
        INSERT INTO usage_tracking (user_id, period_start, period_end, ${sql(column)})
        VALUES (${userId}, ${monthStart.toISOString()}, ${monthEnd.toISOString()}, 1)
        ON CONFLICT (user_id, period_start) 
        DO UPDATE SET ${sql(column)} = usage_tracking.${sql(column)} + 1
      `;

      return Response.json({ success: true });
    } catch (tableError) {
      // If table doesn't exist, just return success (usage not tracked)
      console.log("Usage tracking not available:", tableError.message);
      return Response.json({ success: true, tracked: false });
    }
  } catch (error) {
    console.error("Increment usage error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
