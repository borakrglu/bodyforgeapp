import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    let query = "SELECT * FROM featured_programs WHERE is_active = true";
    const params = [];

    if (type) {
      query += " AND program_type = $1";
      params.push(type);
    }

    query += " ORDER BY created_at DESC";

    const programs =
      params.length > 0
        ? await sql(query, params)
        : await sql`SELECT * FROM featured_programs WHERE is_active = true ORDER BY created_at DESC`;

    return Response.json({ programs });
  } catch (error) {
    console.error("Error fetching featured programs:", error);
    return Response.json(
      { error: "Failed to fetch programs" },
      { status: 500 },
    );
  }
}
