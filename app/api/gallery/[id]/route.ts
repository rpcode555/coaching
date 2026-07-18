import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import GalleryImage from "@/models/Gallery";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const deleted = await GalleryImage.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Gallery image not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to delete gallery image" },
      { status: 500 }
    );
  }
}
