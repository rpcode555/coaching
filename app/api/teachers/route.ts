import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Teacher from "@/models/Teacher";

export async function GET() {
  try {
    await connectToDatabase();
    const list = await Teacher.find().sort({ order: 1 });
    return NextResponse.json(list);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to fetch teachers" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const newTeacher = await Teacher.create(body);
    return NextResponse.json({ id: newTeacher._id, ...newTeacher.toObject() }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to create teacher" },
      { status: 500 }
    );
  }
}
