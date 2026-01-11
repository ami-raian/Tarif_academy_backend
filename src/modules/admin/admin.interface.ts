import { Document } from "mongoose";

// Admin Roles
export type AdminRole = "super_admin" | "admin" | "moderator";

// Admin Interface
export interface IAdmin extends Document {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Create Admin Input
export interface ICreateAdminInput {
  name: string;
  email: string;
  password: string;
  role?: AdminRole;
  phone?: string;
}

// Admin Login Input
export interface IAdminLoginInput {
  email: string;
  password: string;
}

// JWT Payload
export interface IJwtPayload {
  id: string;
  email: string;
  role: string;
  type: "admin" | "student";
}
