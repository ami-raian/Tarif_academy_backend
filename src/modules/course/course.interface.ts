import { Document, Types } from "mongoose";

export interface ICourse extends Document {
  title: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  thumbnail?: string;
  instructor?: Types.ObjectId;
  categoryId?: Types.ObjectId;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  language: string;
  duration: number; // in minutes
  totalLessons: number;
  isPublished: boolean;
  enrolledStudents: number;
  rating: number;
  totalReviews: number;
  // Soft delete
  isDeleted?: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateCourseInput {
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  thumbnail?: string;
  instructor: string;
  categoryId?: string;
  category: string;
  level?: "beginner" | "intermediate" | "advanced";
  language?: string;
  duration?: number;
}

export interface IUpdateCourseInput {
  title?: string;
  description?: string;
  price?: number;
  discountPrice?: number;
  thumbnail?: string;
  categoryId?: string;
  category?: string;
  level?: "beginner" | "intermediate" | "advanced";
  language?: string;
  duration?: number;
  totalLessons?: number;
  isPublished?: boolean;
}
