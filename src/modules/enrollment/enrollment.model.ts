import mongoose, { Schema } from "mongoose";
import { IEnrollment } from "./enrollment.interface";

const enrollmentSchema: Schema<IEnrollment> = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student ID is required"],
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required"],
      index: true,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      // Optional: for courses with expiry (e.g., 6 months access)
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "completed",
    },
    paymentAmount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: 0,
    },
    transactionId: {
      type: String,
      trim: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completedVideos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    approvedAt: {
      type: Date,
    },
    rejectedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
    rejectedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate enrollments
enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

// Index for active enrollments
enrollmentSchema.index({ isActive: 1, studentId: 1 });

const Enrollment = mongoose.model<IEnrollment>("Enrollment", enrollmentSchema);

export default Enrollment;
