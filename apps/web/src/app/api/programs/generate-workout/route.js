import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { userId } = await request.json();

    // Get user data
    const users = await sql`SELECT * FROM users WHERE id = ${userId}`;
    if (users.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[0];

    // Build AI prompt
    const prompt = `You are an expert bodybuilding coach. Create a personalized workout program based on this profile:

Gender: ${user.gender}
Age: ${user.age}
Height: ${user.height_cm}cm
Weight: ${user.weight_kg}kg
Body Fat: ${user.body_fat_percentage || "unknown"}%
Experience: ${user.experience_level}
Training Frequency: ${user.training_frequency} days/week
Training Style: ${user.preferred_training_style}
Primary Goal: ${user.primary_goal}
Injuries/Limitations: ${user.injuries_limitations || "none"}

Create a complete workout program with:
- Weekly training split (e.g., Push/Pull/Legs, Upper/Lower, Full Body)
- Specific workouts for each training day
- For each exercise: name, sets, reps, RPE/RIR, tempo (optional), rest time
- Progressive overload strategy
- Alternative exercises for common injuries
- Warm-up routine

Make it realistic, effective, and safe. Focus on compound movements with isolation work.`;

    // Call Gemini 2.5 Pro
    const aiResponse = await fetch("/integrations/google-gemini-2-5-pro/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "You are an expert bodybuilding and strength coach.",
          },
          { role: "user", content: prompt },
        ],
        json_schema: {
          name: "workout_program",
          schema: {
            type: "object",
            properties: {
              program_name: { type: "string" },
              split_type: { type: "string" },
              duration_weeks: { type: "number" },
              workouts: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    day_name: { type: "string" },
                    focus: { type: "string" },
                    warm_up: { type: "string" },
                    exercises: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          sets: { type: "number" },
                          reps: { type: "string" },
                          rpe: { type: "number" },
                          rest_seconds: { type: "number" },
                          tempo: { type: "string" },
                          notes: { type: "string" },
                          alternatives: {
                            type: "array",
                            items: { type: "string" },
                          },
                        },
                        required: [
                          "name",
                          "sets",
                          "reps",
                          "rpe",
                          "rest_seconds",
                          "tempo",
                          "notes",
                          "alternatives",
                        ],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["day_name", "focus", "warm_up", "exercises"],
                  additionalProperties: false,
                },
              },
              progressive_overload_strategy: { type: "string" },
              recovery_tips: { type: "string" },
            },
            required: [
              "program_name",
              "split_type",
              "duration_weeks",
              "workouts",
              "progressive_overload_strategy",
              "recovery_tips",
            ],
            additionalProperties: false,
          },
        },
      }),
    });

    if (!aiResponse.ok) {
      throw new Error("AI generation failed");
    }

    const aiData = await aiResponse.json();
    const program = JSON.parse(aiData.choices[0].message.content);

    // Save to database
    await sql`
      INSERT INTO user_programs (user_id, program_type, content, is_active)
      VALUES (${userId}, 'workout', ${JSON.stringify(program)}, true)
    `;

    return Response.json({
      success: true,
      program,
    });
  } catch (error) {
    console.error("Error generating workout:", error);
    return Response.json(
      {
        error: "Failed to generate workout",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
