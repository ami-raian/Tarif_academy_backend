import { Document } from "mongoose";

export interface ICourseCategory extends Document {
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateCourseCategoryInput {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface IUpdateCourseCategoryInput {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface ICourseCategoryQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}
