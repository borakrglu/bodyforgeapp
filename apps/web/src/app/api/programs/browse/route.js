import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get("level");
    const goal = searchParams.get("goal");
    const splitType = searchParams.get("split_type");
    const language = searchParams.get("language") || "en";

    let query = "SELECT * FROM programs WHERE 1=1";
    const params = [];
    let paramIndex = 1;

    if (level) {
      query += ` AND level = $${paramIndex}`;
      params.push(level);
      paramIndex++;
    }

    if (goal) {
      query += ` AND goal = $${paramIndex}`;
      params.push(goal);
      paramIndex++;
    }

    if (splitType) {
      query += ` AND split_type = $${paramIndex}`;
      params.push(splitType);
      paramIndex++;
    }

    query += " ORDER BY level, frequency_days";

    const programs = await sql(query, params);

    // Format programs with localized titles
    const formattedPrograms = programs.map((program) => ({
      id: program.id,
      title: language === "tr" ? program.title_tr : program.title_en,
      description:
        language === "tr" ? program.description_tr : program.description_en,
      level: program.level,
      goal: program.goal,
      frequencyDays: program.frequency_days,
      weeks: program.weeks,
      splitType: program.split_type,
      equipment: program.equipment,
    }));

    return Response.json({
      success: true,
      programs: formattedPrograms,
    });
  } catch (error) {
    console.error("Error fetching programs:", error);
    return Response.json(
      { error: "Failed to fetch programs", details: error.message },
      { status: 500 },
    );
  }
}
