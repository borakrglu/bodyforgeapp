import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      id,
      email,
      checkOnly,
      gender,
      age,
      height_cm,
      weight_kg,
      body_fat_percentage,
      experience_level,
      training_frequency,
      preferred_training_style,
      injuries_limitations,
      primary_goal,
      diet_restrictions,
      supplement_history,
      measurement_arms_cm,
      measurement_chest_cm,
      measurement_waist_cm,
      measurement_legs_cm,
    } = body;

    if (checkOnly) {
      const existing = await sql`SELECT * FROM users WHERE email = ${email}`;
      return Response.json({
        success: true,
        exists: existing.length > 0,
        user: existing[0],
      });
    }

    // Upsert user based on email or ID
    const users = await sql`
      INSERT INTO users (
        email,
        gender,
        age,
        height_cm,
        weight_kg,
        body_fat_percentage,
        experience_level,
        training_frequency,
        preferred_training_style,
        injuries_limitations,
        primary_goal,
        diet_restrictions,
        supplement_history,
        premium_active
      ) VALUES (
        ${email || null},
        ${gender || null},
        ${age ? parseInt(age) : null},
        ${height_cm ? parseFloat(height_cm) : null},
        ${weight_kg ? parseFloat(weight_kg) : null},
        ${body_fat_percentage ? parseFloat(body_fat_percentage) : null},
        ${experience_level || null},
        ${training_frequency ? parseInt(training_frequency) : null},
        ${preferred_training_style || null},
        ${injuries_limitations ? (Array.isArray(injuries_limitations) ? injuries_limitations.join(", ") : injuries_limitations) : null},
        ${primary_goal || null},
        ${diet_restrictions || []},
        ${supplement_history || null},
        false
      )
      ON CONFLICT (email) DO UPDATE SET
        gender = EXCLUDED.gender,
        age = EXCLUDED.age,
        height_cm = EXCLUDED.height_cm,
        weight_kg = EXCLUDED.weight_kg,
        body_fat_percentage = EXCLUDED.body_fat_percentage,
        experience_level = EXCLUDED.experience_level,
        training_frequency = EXCLUDED.training_frequency,
        preferred_training_style = EXCLUDED.preferred_training_style,
        injuries_limitations = EXCLUDED.injuries_limitations,
        primary_goal = EXCLUDED.primary_goal,
        diet_restrictions = EXCLUDED.diet_restrictions,
        supplement_history = EXCLUDED.supplement_history,
        updated_at = NOW()
      RETURNING *
    `;

    const user = users[0];

    // Also create an initial progress entry if measurements are provided
    if (
      weight_kg ||
      measurement_arms_cm ||
      measurement_chest_cm ||
      measurement_waist_cm ||
      measurement_legs_cm
    ) {
      await sql`
        INSERT INTO progress_entries (
          user_id,
          weight_kg,
          body_fat_percentage,
          measurement_arms_cm,
          measurement_chest_cm,
          measurement_waist_cm,
          measurement_legs_cm,
          entry_date
        ) VALUES (
          ${user.id},
          ${weight_kg ? parseFloat(weight_kg) : null},
          ${body_fat_percentage ? parseFloat(body_fat_percentage) : null},
          ${measurement_arms_cm ? parseFloat(measurement_arms_cm) : null},
          ${measurement_chest_cm ? parseFloat(measurement_chest_cm) : null},
          ${measurement_waist_cm ? parseFloat(measurement_waist_cm) : null},
          ${measurement_legs_cm ? parseFloat(measurement_legs_cm) : null},
          CURRENT_DATE
        )
      `;
    }

    return Response.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return Response.json(
      {
        error: "Failed to create user",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
