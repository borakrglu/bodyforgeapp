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

    const prompt = `You are an expert supplement advisor for bodybuilding and fitness. Create a personalized supplement protocol based on this profile:

Gender: ${user.gender}
Age: ${user.age}
Experience Level: ${user.experience_level}
Primary Goal: ${user.primary_goal}
Current Supplement Use: ${user.supplement_history}
Training Frequency: ${user.training_frequency} days/week

Create a supplement stack with:
- Recommended supplements based on experience level and goals
- Daily schedule (when to take each supplement)
- Dosage recommendations
- Benefits of each supplement
- Safety warnings and contraindications
- Optional vs essential supplements
- Budget tiers (basic, intermediate, advanced)

Be conservative for beginners. Focus on evidence-based supplements. Include warnings about side effects.`;

    // Call Gemini 2.5 Pro
    const aiResponse = await fetch("/integrations/google-gemini-2-5-pro/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "You are an expert supplement advisor with deep knowledge of sports nutrition.",
          },
          { role: "user", content: prompt },
        ],
        json_schema: {
          name: "supplement_plan",
          schema: {
            type: "object",
            properties: {
              stack_name: { type: "string" },
              supplements: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    dosage: { type: "string" },
                    timing: { type: "string" },
                    benefits: { type: "string" },
                    priority: { type: "string" },
                    budget_tier: { type: "string" },
                    warnings: { type: "string" },
                  },
                  required: [
                    "name",
                    "dosage",
                    "timing",
                    "benefits",
                    "priority",
                    "budget_tier",
                    "warnings",
                  ],
                  additionalProperties: false,
                },
              },
              daily_schedule: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    time: { type: "string" },
                    supplements_to_take: {
                      type: "array",
                      items: { type: "string" },
                    },
                    notes: { type: "string" },
                  },
                  required: ["time", "supplements_to_take", "notes"],
                  additionalProperties: false,
                },
              },
              general_warnings: { type: "string" },
              cycling_recommendations: { type: "string" },
              estimated_monthly_cost: {
                type: "object",
                properties: {
                  basic: { type: "string" },
                  intermediate: { type: "string" },
                  advanced: { type: "string" },
                },
                required: ["basic", "intermediate", "advanced"],
                additionalProperties: false,
              },
            },
            required: [
              "stack_name",
              "supplements",
              "daily_schedule",
              "general_warnings",
              "cycling_recommendations",
              "estimated_monthly_cost",
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
    const supplementPlan = JSON.parse(aiData.choices[0].message.content);

    // Save to database
    await sql`
      INSERT INTO user_programs (user_id, program_type, content, is_active)
      VALUES (${userId}, 'supplement', ${JSON.stringify(supplementPlan)}, true)
    `;

    return Response.json({
      success: true,
      supplementPlan,
    });
  } catch (error) {
    console.error("Error generating supplement plan:", error);
    return Response.json(
      {
        error: "Failed to generate supplement plan",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
