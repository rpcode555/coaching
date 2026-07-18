import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITeacher extends Document {
  name: string;
  subject: string;
  qualification: string;
  experience: string;
  photoURL: string;
  photoPath: string;
  order: number;
}

const TeacherSchema = new Schema<ITeacher>(
  {
    name: { type: String, required: true },
    subject: { type: String, required: true },
    qualification: { type: String, default: "" },
    experience: { type: String, default: "" },
    photoURL: { type: String, default: "" },
    photoPath: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Teacher: Model<ITeacher> =
  mongoose.models.Teacher ||
  mongoose.model<ITeacher>("Teacher", TeacherSchema);

export default Teacher;
