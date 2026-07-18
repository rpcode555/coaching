import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import AdminUser from "@/models/AdminUser";

export async function GET() {
  try {
    await connectToDatabase();
    const list = await AdminUser.find().sort({ createdAt: -1 });
    return NextResponse.json(list);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to fetch admin users" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();
    if (!email) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    const existing = await AdminUser.findOne({ email });
    if (existing) {
      return NextResponse.json({ id: existing._id, ...existing.toObject() });
    }

    const newAdmin = await AdminUser.create({
      email,
      name: body.name || "",
      createdBy: body.createdBy || "admin",
    });
    return NextResponse.json(
      { id: newAdmin._id, ...newAdmin.toObject() },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to create admin user" },
      { status: 500 }
    );
  }
}
