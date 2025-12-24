import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    const entries = await sql`
      SELECT * FROM progress_entries
      WHERE user_id = ${userId}
      ORDER BY entry_date DESC
    `;

    return Response.json({ entries });
  } catch (error) {
    console.error("Error fetching progress entries:", error);
    return Response.json(
      { error: "Failed to fetch progress entries" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId,
      entryDate,
      weightKg,
      bodyFatPercentage,
      measurementArmsCm,
      measurementChestCm,
      measurementWaistCm,
      measurementLegsCm,
      prBenchKg,
      prSquatKg,
      prDeadliftKg,
      waterIntakeLiters,
      sleepQuality,
      photoUrl,
      notes,
    } = body;

    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO progress_entries (
        user_id, entry_date, weight_kg, body_fat_percentage,
        measurement_arms_cm, measurement_chest_cm, measurement_waist_cm, measurement_legs_cm,
        pr_bench_kg, pr_squat_kg, pr_deadlift_kg,
        water_intake_liters, sleep_quality, photo_url, notes
      )
      VALUES (
        ${userId}, ${entryDate || new Date().toISOString().split("T")[0]}, 
        ${weightKg}, ${bodyFatPercentage},
        ${measurementArmsCm}, ${measurementChestCm}, ${measurementWaistCm}, ${measurementLegsCm},
        ${prBenchKg}, ${prSquatKg}, ${prDeadliftKg},
        ${waterIntakeLiters}, ${sleepQuality}, ${photoUrl}, ${notes}
      )
      RETURNING *
    `;

    return Response.json({ entry: result[0] });
  } catch (error) {
    console.error("Error creating progress entry:", error);
    return Response.json(
      { error: "Failed to create progress entry" },
      { status: 500 },
    );
  }
}
