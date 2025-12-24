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

    // Calculate TDEE and macros based on user data
    const prompt = `You are an expert nutritionist specializing in bodybuilding and fitness. Create a personalized meal plan based on this profile:

Gender: ${user.gender}
Age: ${user.age}
Height: ${user.height_cm}cm
Weight: ${user.weight_kg}kg
Body Fat: ${user.body_fat_percentage || "unknown"}%
Activity Level: Training ${user.training_frequency} days/week
Primary Goal: ${user.primary_goal}
Diet Restrictions: ${user.diet_restrictions?.join(", ") || "none"}
Training Style: ${user.preferred_training_style}

Create a complete meal plan with:
- Daily calorie target (calculate TDEE based on stats and goal)
- Macro breakdown (protein, carbs, fats in grams)
- 7-day meal plan with breakfast, lunch, dinner, snacks
- Each meal should include: name, ingredients with amounts, calories, macros, preparation time
- Weekly grocery shopping list organized by category
- Meal prep tips
- 3 alternative meals for each meal type that can be swapped

Consider the diet restrictions and make meals realistic and delicious.`;

    // Call Gemini 2.5 Pro
    const aiResponse = await fetch("/integrations/google-gemini-2-5-pro/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "You are an expert nutritionist and meal planning specialist.",
          },
          { role: "user", content: prompt },
        ],
        json_schema: {
          name: "meal_plan",
          schema: {
            type: "object",
            properties: {
              daily_calories: { type: "number" },
              macros: {
                type: "object",
                properties: {
                  protein_g: { type: "number" },
                  carbs_g: { type: "number" },
                  fats_g: { type: "number" },
                },
                required: ["protein_g", "carbs_g", "fats_g"],
                additionalProperties: false,
              },
              weekly_plan: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    day: { type: "string" },
                    meals: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          meal_type: { type: "string" },
                          name: { type: "string" },
                          ingredients: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                item: { type: "string" },
                                amount: { type: "string" },
                              },
                              required: ["item", "amount"],
                              additionalProperties: false,
                            },
                          },
                          calories: { type: "number" },
                          protein_g: { type: "number" },
                          carbs_g: { type: "number" },
                          fats_g: { type: "number" },
                          prep_time_minutes: { type: "number" },
                          instructions: { type: "string" },
                        },
                        required: [
                          "meal_type",
                          "name",
                          "ingredients",
                          "calories",
                          "protein_g",
                          "carbs_g",
                          "fats_g",
                          "prep_time_minutes",
                          "instructions",
                        ],
                        additionalProperties: false,
                      },
                    },
                  },
                  required: ["day", "meals"],
                  additionalProperties: false,
                },
              },
              grocery_list: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    category: { type: "string" },
                    items: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                  required: ["category", "items"],
                  additionalProperties: false,
                },
              },
              meal_prep_tips: { type: "string" },
              swap_options: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    meal_type: { type: "string" },
                    options: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                  required: ["meal_type", "options"],
                  additionalProperties: false,
                },
              },
            },
            required: [
              "daily_calories",
              "macros",
              "weekly_plan",
              "grocery_list",
              "meal_prep_tips",
              "swap_options",
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
    const mealPlan = JSON.parse(aiData.choices[0].message.content);

    // Save to database
    await sql`
      INSERT INTO user_programs (user_id, program_type, content, is_active)
      VALUES (${userId}, 'meal', ${JSON.stringify(mealPlan)}, true)
    `;

    return Response.json({
      success: true,
      mealPlan,
    });
  } catch (error) {
    console.error("Error generating meal plan:", error);
    return Response.json(
      {
        error: "Failed to generate meal plan",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
