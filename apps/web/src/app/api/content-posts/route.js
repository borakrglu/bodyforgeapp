import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "10");

    let query = "SELECT * FROM content_posts WHERE 1=1";
    const params = [];
    let paramCount = 0;

    if (type) {
      paramCount++;
      query += ` AND content_type = $${paramCount}`;
      params.push(type);
    }

    query += " ORDER BY created_at DESC";

    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);

    const posts = await sql(query, params);

    return Response.json({ posts });
  } catch (error) {
    console.error("Error fetching content posts:", error);
    return Response.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}
