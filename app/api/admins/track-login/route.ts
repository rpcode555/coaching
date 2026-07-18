import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import AdminUser from "@/models/AdminUser";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const updated = await AdminUser.findOneAndUpdate(
      { email },
      {
        $inc: { loginCount: 1 },
        $set: { lastLoginAt: new Date() },
        $setOnInsert: { name: body.name || "Admin User", createdBy: "login-provision" },
      },
      { upsert: true, returnDocument: "after" }
    );

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to track admin login" },
      { status: 500 }
    );
  }
}
