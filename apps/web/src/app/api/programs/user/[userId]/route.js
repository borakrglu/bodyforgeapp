import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { userId } = params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    let query =
      "SELECT * FROM user_programs WHERE user_id = $1 AND is_active = true";
    const queryParams = [userId];

    if (type) {
      query += " AND program_type = $2";
      queryParams.push(type);
    }

    query += " ORDER BY created_at DESC";

    const programs = await sql(query, queryParams);

    return Response.json({ programs });
  } catch (error) {
    console.error("Error fetching user programs:", error);
    return Response.json(
      { error: "Failed to fetch programs" },
      { status: 500 },
    );
  }
}
