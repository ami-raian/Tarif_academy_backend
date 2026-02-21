import mongoose, { Schema } from "mongoose";
import { IMcqExam, IMcqQuestion, IMcqSubmission } from "./mcq.interface";

// MCQ Question Schema
const mcqQuestionSchema: Schema<IMcqQuestion> = new Schema(
  {
    examId: {
      type: Schema.Types.ObjectId,
      ref: "McqExam",
      required: [true, "Exam ID is required"],
      index: true,
    },
    questionText: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },
    options: [
      {
        text: {
          type: String,
          required: [true, "Option text is required"],
          trim: true,
        },
        isCorrect: {
          type: Boolean,
          default: false,
        },
      },
    ],
    marks: {
      type: Number,
      default: 1,
      min: [0, "Marks cannot be negative"],
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// MCQ Exam Schema
const mcqExamSchema: Schema<IMcqExam> = new Schema(
  {
    title: {
      type: String,
      required: [true, "Exam title is required"],
      trim: true,
      maxlength: [200, "Title cannot be more than 200 characters"],
    },
    description: {
      type: String,
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, "Exam duration is required"],
      min: [1, "Duration must be at least 1 minute"],
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    passingMarks: {
      type: Number,
      required: [true, "Passing marks is required"],
      min: [0, "Passing marks cannot be negative"],
    },
    negativeMarking: {
      type: Number,
      default: 0,
      min: [0, "Negative marking cannot be negative"],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isResultPublished: {
      type: Boolean,
      default: false,
    },
    accessCode: {
      type: String,
      trim: true,
      select: true, // kept in DB; we manually strip it from student responses
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: [true, "Creator is required"],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  },
);

// MCQ Submission Schema
const mcqSubmissionSchema: Schema<IMcqSubmission> = new Schema(
  {
    examId: {
      type: Schema.Types.ObjectId,
      ref: "McqExam",
      required: [true, "Exam ID is required"],
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student ID is required"],
      index: true,
    },
    answers: [
      {
        questionId: {
          type: Schema.Types.ObjectId,
          ref: "McqQuestion",
          required: true,
        },
        selectedOptionIndex: {
          type: Number,
          default: null,
        },
        isCorrect: {
          type: Boolean,
          default: false,
        },
        marksObtained: {
          type: Number,
          default: 0,
        },
      },
    ],
    totalMarks: {
      type: Number,
      default: 0,
    },
    obtainedMarks: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    isPassed: {
      type: Boolean,
      default: false,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
    },
    isAutoSubmitted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["in_progress", "submitted", "evaluated"],
      default: "in_progress",
    },
  },
  {
    timestamps: true,
  },
);

// Compound index to prevent duplicate submissions
mcqSubmissionSchema.index({ examId: 1, studentId: 1 }, { unique: true });

// Index for questions by exam
mcqQuestionSchema.index({ examId: 1, order: 1 });

export const McqExam = mongoose.model<IMcqExam>("McqExam", mcqExamSchema);
export const McqQuestion = mongoose.model<IMcqQuestion>(
  "McqQuestion",
  mcqQuestionSchema,
);
export const McqSubmission = mongoose.model<IMcqSubmission>(
  "McqSubmission",
  mcqSubmissionSchema,
);
