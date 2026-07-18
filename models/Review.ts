import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReview extends Document {
  name: string;
  achievement: string;
  quote: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    name: { type: String, required: true },
    achievement: { type: String, required: true },
    quote: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Review: Model<IReview> =
  mongoose.models.Review ||
  mongoose.model<IReview>("Review", ReviewSchema);

export default Review;
