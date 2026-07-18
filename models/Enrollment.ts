import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEnrollment extends Document {
  name: string;
  guardianName: string;
  phone: string;
  email: string;
  course: string;
  className: string;
  address: string;
  message: string;
  status: "new" | "contacted" | "enrolled";
  createdAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    name: { type: String, required: true },
    guardianName: { type: String, default: "" },
    phone: { type: String, required: true },
    email: { type: String, default: "" },
    course: { type: String, required: true },
    className: { type: String, default: "" },
    address: { type: String, default: "" },
    message: { type: String, default: "" },
    status: {
      type: String,
      enum: ["new", "contacted", "enrolled"],
      default: "new",
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Enrollment: Model<IEnrollment> =
  mongoose.models.Enrollment ||
  mongoose.model<IEnrollment>("Enrollment", EnrollmentSchema);

export default Enrollment;
