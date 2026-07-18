import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Review from "@/models/Review";

export async function GET() {
  try {
    await connectToDatabase();
    const list = await Review.find().sort({ createdAt: -1 });
    return NextResponse.json(list);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const newReview = await Review.create(body);
    return NextResponse.json({ id: newReview._id, ...newReview.toObject() }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to create review" },
      { status: 500 }
    );
  }
}
