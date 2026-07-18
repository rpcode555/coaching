import mongoose, { Schema, Document, Model } from "mongoose";

export interface IGalleryImage extends Document {
  url: string;
  storagePath: string;
  caption: string;
  order: number;
  createdAt: Date;
}

const GallerySchema = new Schema<IGalleryImage>(
  {
    url: { type: String, required: true },
    storagePath: { type: String, default: "" },
    caption: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const GalleryImage: Model<IGalleryImage> =
  mongoose.models.GalleryImage ||
  mongoose.model<IGalleryImage>("GalleryImage", GallerySchema);

export default GalleryImage;
