import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const users = await sql`SELECT * FROM users WHERE id = ${id}`;

    if (users.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({ user: users[0] });
  } catch (error) {
    console.error("Error fetching user:", error);
    return Response.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 0;

    const allowedFields = [
      "email",
      "gender",
      "age",
      "height_cm",
      "weight_kg",
      "body_fat_percentage",
      "experience_level",
      "training_frequency",
      "preferred_training_style",
      "injuries_limitations",
      "primary_goal",
      "diet_restrictions",
      "supplement_history",
      "subscription_tier",
      "subscription_expires_at",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        paramCount++;
        updates.push(`${field} = $${paramCount}`);
        values.push(body[field]);
      }
    }

    if (updates.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    // Add updated_at
    paramCount++;
    updates.push(`updated_at = $${paramCount}`);
    values.push(new Date().toISOString());

    // Add id for WHERE clause
    paramCount++;
    values.push(id);

    const query = `
      UPDATE users 
      SET ${updates.join(", ")} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const users = await sql(query, values);

    if (users.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({
      success: true,
      user: users[0],
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return Response.json(
      {
        error: "Failed to update user",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
