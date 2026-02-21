import { Document, Types } from "mongoose";

// MCQ Option interface
export interface IMcqOption {
  text: string;
  isCorrect: boolean;
}

// MCQ Question interface
export interface IMcqQuestion extends Document {
  examId: Types.ObjectId;
  questionText: string;
  options: IMcqOption[];
  marks: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// MCQ Exam interface
export interface IMcqExam extends Document {
  title: string;
  description?: string;
  duration: number; // in minutes
  totalQuestions: number;
  totalMarks: number;
  passingMarks: number;
  negativeMarking: number; // marks to deduct per wrong answer (0 means no negative marking)
  isPublished: boolean;
  isResultPublished: boolean;
  accessCode?: string; // optional: if set, students must enter this code to start
  startTime?: Date;
  endTime?: Date;
  createdBy: Types.ObjectId;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Student's answer for a question
export interface IStudentAnswer {
  questionId: Types.ObjectId;
  selectedOptionIndex: number | null; // null means unanswered
  isCorrect: boolean;
  marksObtained: number;
}

// MCQ Submission interface
export interface IMcqSubmission extends Document {
  examId: Types.ObjectId;
  studentId: Types.ObjectId;
  answers: IStudentAnswer[];
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  isPassed: boolean;
  startedAt: Date;
  submittedAt?: Date;
  isAutoSubmitted: boolean;
  status: "in_progress" | "submitted" | "evaluated";
  createdAt: Date;
  updatedAt: Date;
}

// Input types for creating/updating
export interface ICreateExamInput {
  title: string;
  description?: string;
  duration: number;
  passingMarks: number;
  negativeMarking?: number;
  accessCode?: string;
  startTime?: Date;
  endTime?: Date;
}

export interface ICreateQuestionInput {
  examId: string;
  questionText: string;
  options: { text: string; isCorrect: boolean }[];
  marks?: number;
  order?: number;
}

export interface IUpdateExamInput {
  title?: string;
  description?: string;
  duration?: number;
  passingMarks?: number;
  negativeMarking?: number;
  accessCode?: string;
  startTime?: Date;
  endTime?: Date;
  isPublished?: boolean;
}

export interface ISubmitAnswerInput {
  questionId: string;
  selectedOptionIndex: number | null;
}
