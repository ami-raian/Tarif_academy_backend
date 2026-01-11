import { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateUserInput {
  name: string;
  email: string;
  password: string;
}

export interface IUpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
}
