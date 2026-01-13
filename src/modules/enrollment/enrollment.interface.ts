import { Document, Types } from "mongoose";

export interface IEnrollment extends Document {
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  enrolledAt: Date;
  expiresAt?: Date;
  paymentStatus: "pending" | "completed" | "failed";
  paymentAmount: number;
  transactionId?: string;
  progress: number; // 0-100 percentage
  completedVideos: Types.ObjectId[]; // Array of video IDs
  lastAccessedAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateEnrollmentInput {
  studentId: string;
  courseId: string;
  paymentAmount: number;
  transactionId?: string;
}
