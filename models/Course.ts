import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICourse extends Document {
  title: string;
  classes: string;
  description: string;
  subjects: string[];
  color: string;
  accent: string;
  border: string;
  icon: string;
  order: number;
  createdAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    classes: { type: String, required: true },
    description: { type: String, required: true },
    subjects: { type: [String], default: [] },
    color: { type: String, default: "from-blue-500/20 to-indigo-500/10" },
    accent: { type: String, default: "text-blue-400" },
    border: { type: String, default: "border-blue-500/20" },
    icon: { type: String, default: "📚" },
    order: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Course: Model<ICourse> =
  mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema);

export default Course;
