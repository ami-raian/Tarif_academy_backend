import mongoose, { Schema } from "mongoose";
import { IStudyLog } from "./study-log.interface";

const studyEntrySchema = new Schema(
  {
    subject: {
      type: String,
      required: [true, "Subject is required"],
      trim: true,
      maxlength: [100, "Subject name cannot exceed 100 characters"],
    },
    hours: {
      type: Number,
      required: [true, "Hours is required"],
      min: [0.5, "Minimum 0.5 hour"],
      max: [24, "Cannot exceed 24 hours"],
    },
  },
  { _id: false },
);

const studyLogSchema: Schema<IStudyLog> = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student ID is required"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    entries: {
      type: [studyEntrySchema],
      required: true,
      validate: {
        validator: (v: unknown[]) => v.length > 0,
        message: "At least one subject entry is required",
      },
    },
    totalHours: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { timestamps: true },
);

// Unique constraint: one log per student per day
studyLogSchema.index({ studentId: 1, date: 1 }, { unique: true });

// Pre-save: normalize date to UTC midnight & compute totalHours
studyLogSchema.pre("save", function () {
  const d = this.date;
  this.date = new Date(
    Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()),
  );
  this.totalHours = this.entries.reduce((sum, e) => sum + e.hours, 0);
});

const StudyLog = mongoose.model<IStudyLog>("StudyLog", studyLogSchema);
export default StudyLog;
