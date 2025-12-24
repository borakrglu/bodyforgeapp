import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tier = searchParams.get("tier");

    let coaches;
    if (tier) {
      coaches = await sql`
        SELECT * FROM coaches
        WHERE tier = ${tier} AND is_available = true
        ORDER BY rating DESC
      `;
    } else {
      coaches = await sql`
        SELECT * FROM coaches
        WHERE is_available = true
        ORDER BY rating DESC
      `;
    }

    return Response.json({ coaches });
  } catch (error) {
    console.error("Error fetching coaches:", error);
    return Response.json({ error: "Failed to fetch coaches" }, { status: 500 });
  }
}
