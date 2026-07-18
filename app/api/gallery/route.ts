import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import GalleryImage from "@/models/Gallery";

export async function GET() {
  try {
    await connectToDatabase();
    const list = await GalleryImage.find().sort({ order: 1 });
    return NextResponse.json(list);
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to fetch gallery images" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const newImage = await GalleryImage.create(body);
    return NextResponse.json({ id: newImage._id, ...newImage.toObject() }, { status: 201 });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Failed to add gallery image" },
      { status: 500 }
    );
  }
}
