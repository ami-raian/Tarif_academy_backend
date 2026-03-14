import { Document, Types } from "mongoose";

export interface IStudyEntry {
  subject: string;
  hours: number;
}

export interface IStudyLog extends Document {
  studentId: Types.ObjectId;
  date: Date; // normalized to start of day (UTC midnight)
  entries: IStudyEntry[];
  totalHours: number;
  createdAt: Date;
  updatedAt: Date;
}
