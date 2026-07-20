import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Teacher from "@/models/Teacher";

export const dynamic = "force-dynamic";

const defaultDemoTeachers = [
  {
    name: "Prasenjit Pal",
    subject: "English",
    qualification: "B.Ed.",
    experience: "20+ Years of Teaching Experience",
    photoURL: "",
    photoPath: "",
    order: 0,
  },
  {
    name: "Lalan Mandal",
    subject: "Science",
    qualification: "B.Sc. (Physics Hons.)",
    experience: "15+ Years of Teaching Experience",
    photoURL: "",
    photoPath: "",
    order: 1,
  },
  {
    name: "Makhan Maji",
    subject: "Bengali, Geography & History",
    qualification: "M.A. (Geography)",
    experience: "18+ Years of Teaching Experience",
    photoURL: "",
    photoPath: "",
    order: 2,
  },
];

export async function GET() {
  try {
    await connectToDatabase();
    let list = await Teacher.find().sort({ order: 1 });

    if (list.length === 0) {
      list = await Teacher.insertMany(defaultDemoTeachers);
    }

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
