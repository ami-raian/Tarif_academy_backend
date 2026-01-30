import { Document, Types } from "mongoose";

export type EnrollmentStatus = "pending" | "approved" | "rejected";

export interface IEnrollment extends Document {
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  enrolledAt: Date;
  expiresAt?: Date;
  status: EnrollmentStatus;
  paymentStatus: "pending" | "completed" | "failed";
  paymentAmount: number;
  transactionId?: string;
  progress: number; // 0-100 percentage
  completedVideos: Types.ObjectId[]; // Array of video IDs
  lastAccessedAt: Date;
  isActive: boolean;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  rejectedBy?: Types.ObjectId;
  rejectedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateEnrollmentInput {
  studentId: string;
  courseId: string;
  paymentAmount: number;
  transactionId?: string;
}
