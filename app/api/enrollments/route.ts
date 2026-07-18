import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Enrollment from "@/models/Enrollment";

export async function GET() {
  try {
    await connectToDatabase();
    const list = await Enrollment.find().sort({ createdAt: -1 });
    return NextResponse.json(list);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to fetch enrollments" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const newEnrollment = await Enrollment.create({
      name: body.name || "",
      guardianName: body.guardianName || "",
      phone: body.phone || "",
      email: body.email || "",
      course: body.course || "",
      className: body.className || "",
      address: body.address || "",
      message: body.message || "",
      status: "new",
    });
    return NextResponse.json({ id: newEnrollment._id, ...newEnrollment.toObject() }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to create enrollment" },
      { status: 500 }
    );
  }
}
