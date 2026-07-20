import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExtraField {
  id: string;
  name: string;
  label: string;
  type: "text" | "select" | "number";
  options?: string[];
  required: boolean;
  enabled: boolean;
}

export interface IEnrollmentSetting extends Document {
  courseOptions: string[];
  extraFields: IExtraField[];
  updatedAt: Date;
}

const ExtraFieldSchema = new Schema<IExtraField>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, default: "text" },
    options: { type: [String], default: [] },
    required: { type: Boolean, default: false },
    enabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const EnrollmentSettingSchema = new Schema<IEnrollmentSetting>(
  {
    courseOptions: {
      type: [String],
      default: [
        "Foundation (Class 5-7)",
        "Madhyamik Prep (Class 8-10)",
        "Higher Secondary (Class 11-12)",
        "JEE Preparation",
        "NEET Preparation",
        "WBJEE Preparation",
        "Olympiad & Foundation",
        "Board Test Series",
      ],
    },
    extraFields: {
      type: [ExtraFieldSchema],
      default: [
        {
          id: "schoolName",
          name: "schoolName",
          label: "School Name",
          type: "text",
          options: [],
          required: false,
          enabled: true,
        },
        {
          id: "board",
          name: "board",
          label: "Board / Medium",
          type: "select",
          options: ["WBBSE", "WBCHSE", "CBSE", "ICSE / ISC"],
          required: false,
          enabled: true,
        },
        {
          id: "preferredBatch",
          name: "preferredBatch",
          label: "Preferred Batch Timing",
          type: "select",
          options: ["Morning Batch (7 AM - 10 AM)", "Afternoon Batch (12 PM - 3 PM)", "Evening Batch (4 PM - 7 PM)", "Weekend Batch (Sat & Sun)"],
          required: false,
          enabled: true,
        },
      ],
    },
  },
  { timestamps: true }
);

const EnrollmentSetting: Model<IEnrollmentSetting> =
  mongoose.models.EnrollmentSetting ||
  mongoose.model<IEnrollmentSetting>("EnrollmentSetting", EnrollmentSettingSchema);

export default EnrollmentSetting;
