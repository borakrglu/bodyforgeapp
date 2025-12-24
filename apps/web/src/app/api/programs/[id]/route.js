import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const language = searchParams.get("language") || "en";

    const programs = await sql`SELECT * FROM programs WHERE id = ${id}`;

    if (programs.length === 0) {
      return Response.json({ error: "Program not found" }, { status: 404 });
    }

    const program = programs[0];

    // Format with localized fields
    const formattedProgram = {
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
      days: program.days.map((day) => ({
        dayIndex: day.day_index,
        dayName: language === "tr" ? day.day_name_tr : day.day_name_en,
        focus: language === "tr" ? day.focus_tr : day.focus_en,
        exercises: day.exercises || [],
      })),
    };

    return Response.json({
      success: true,
      program: formattedProgram,
    });
  } catch (error) {
    console.error("Error fetching program:", error);
    return Response.json(
      { error: "Failed to fetch program", details: error.message },
      { status: 500 },
    );
  }
}
