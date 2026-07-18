import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Enrollment from "@/models/Enrollment";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const body = await req.json();
    const updated = await Enrollment.findByIdAndUpdate(
      id,
      { status: body.status },
      { new: true }
    );
    if (!updated) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to update enrollment" },
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
    const deleted = await Enrollment.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to delete enrollment" },
      { status: 500 }
    );
  }
}
