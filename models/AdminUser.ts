import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAdminUser extends Document {
  email: string;
  name: string;
  createdBy: string;
  loginCount: number;
  lastLoginAt: Date;
  createdAt: Date;
}

const AdminUserSchema = new Schema<IAdminUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, default: "" },
    createdBy: { type: String, default: "system" },
    loginCount: { type: Number, default: 0 },
    lastLoginAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const AdminUser: Model<IAdminUser> =
  mongoose.models.AdminUser ||
  mongoose.model<IAdminUser>("AdminUser", AdminUserSchema);

export default AdminUser;
