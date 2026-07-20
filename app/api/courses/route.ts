import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Course from "@/models/Course";

export const dynamic = "force-dynamic";

const defaultDemoCourses = [
  {
    title: "Foundation",
    classes: "Class 5 – 7",
    description: "Build strong fundamentals and develop a love for learning from an early age.",
    subjects: ["Mathematics", "Science", "English", "Bengali"],
    color: "from-emerald-500/20 to-teal-500/10",
    accent: "text-emerald-400",
    border: "border-emerald-500/20",
    icon: "🌱",
    order: 0,
  },
  {
    title: "Madhyamik Prep",
    classes: "Class 8 – 10",
    description: "Comprehensive preparation for board exams with focus on concept clarity.",
    subjects: ["Mathematics", "Physical Science", "Life Science", "English", "Bengali"],
    color: "from-blue-500/20 to-indigo-500/10",
    accent: "text-blue-400",
    border: "border-blue-500/20",
    icon: "📚",
    order: 1,
  },
  {
    title: "Higher Secondary",
    classes: "Class 11 – 12",
    description: "Master advanced concepts and excel in your HS examinations.",
    subjects: ["Physics", "Chemistry", "Mathematics", "Biology", "Computer Science"],
    color: "from-purple-500/20 to-violet-500/10",
    accent: "text-purple-400",
    border: "border-purple-500/20",
    icon: "🎓",
    order: 2,
  },
  {
    title: "Competitive Exams",
    classes: "JEE • NEET • WBJEE",
    description: "Crack India’s toughest entrance exams with expert guidance and strategies.",
    subjects: ["JEE Main & Advanced", "NEET UG", "WBJEE", "Olympiads"],
    color: "from-gold-500/20 to-amber-500/10",
    accent: "text-gold-400",
    border: "border-gold-500/20",
    icon: "🏆",
    order: 3,
  },
];

export async function GET() {
  try {
    await connectToDatabase();
    let list = await Course.find().sort({ order: 1 });
    
    // Auto-seed default demo courses if empty
    if (list.length === 0) {
      list = await Course.insertMany(defaultDemoCourses);
    }
    
    return NextResponse.json(list);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const newCourse = await Course.create({
      title: body.title || "New Course",
      classes: body.classes || "",
      description: body.description || "",
      subjects: Array.isArray(body.subjects)
        ? body.subjects
        : typeof body.subjects === "string"
        ? body.subjects.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [],
      color: body.color || "from-blue-500/20 to-indigo-500/10",
      accent: body.accent || "text-blue-400",
      border: body.border || "border-blue-500/20",
      icon: body.icon || "📚",
      order: body.order || 0,
    });
    return NextResponse.json({ id: String(newCourse._id), ...newCourse.toObject() }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to create course" },
      { status: 500 }
    );
  }
}
