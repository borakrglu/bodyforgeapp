import sql from "@/app/api/utils/sql";

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return Response.json({ error: "id is required" }, { status: 400 });
    }

    await sql`
      DELETE FROM progress_entries
      WHERE id = ${id}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting progress entry:", error);
    return Response.json(
      { error: "Failed to delete progress entry" },
      { status: 500 },
    );
  }
}
