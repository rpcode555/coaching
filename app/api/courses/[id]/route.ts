import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Course from "@/models/Course";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const body = await req.json();
    if (typeof body.subjects === "string") {
      body.subjects = body.subjects.split(",").map((s: string) => s.trim()).filter(Boolean);
    }
    const updated = await Course.findByIdAndUpdate(id, body, { new: true });
    if (!updated) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to update course" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const deleted = await Course.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to delete course" },
      { status: 500 }
    );
  }
}
