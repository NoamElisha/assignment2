import mongoose, { Schema, Types } from "mongoose";

export interface IUser {
  _id: Types.ObjectId;
  username: string;
  email: string;
  passwordHash: string;
  refreshTokenHashes: string[];
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    refreshTokenHashes: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
