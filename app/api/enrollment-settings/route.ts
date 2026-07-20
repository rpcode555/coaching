import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import EnrollmentSetting from "@/models/EnrollmentSetting";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDatabase();
    let settings = await EnrollmentSetting.findOne();

    if (!settings) {
      settings = await EnrollmentSetting.create({});
    }

    return NextResponse.json(settings);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to fetch enrollment settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    let settings = await EnrollmentSetting.findOne();

    if (!settings) {
      settings = await EnrollmentSetting.create(body);
    } else {
      if (body.courseOptions) settings.courseOptions = body.courseOptions;
      if (body.extraFields) settings.extraFields = body.extraFields;
      await settings.save();
    }

    return NextResponse.json(settings);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to update enrollment settings" },
      { status: 500 }
    );
  }
}
