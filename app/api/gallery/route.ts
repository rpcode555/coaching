import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import GalleryImage from "@/models/Gallery";

export const dynamic = "force-dynamic";

const defaultDemoGallery = [
  {
    url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80",
    caption: "Modern Interactive Smart Classroom",
    storagePath: "",
    order: 0,
  },
  {
    url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
    caption: "Group Study & Discussion Hall",
    storagePath: "",
    order: 1,
  },
  {
    url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80",
    caption: "Advanced Physics & Science Laboratory",
    storagePath: "",
    order: 2,
  },
];

export async function GET() {
  try {
    await connectToDatabase();
    let list = await GalleryImage.find().sort({ order: 1 });

    if (list.length === 0) {
      list = await GalleryImage.insertMany(defaultDemoGallery);
    }

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
