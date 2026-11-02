import { Document, Types } from "mongoose";

export interface IVideo extends Document {
  title: string;
  description?: string;
  courseId: Types.ObjectId;
  sectionTitle: string;
  order: number;
  duration: number; // in seconds
  bunnyVideoId: string; // Bunny.net video ID
  bunnyGuid: string; // Bunny.net GUID
  thumbnailUrl?: string;
  notesUrl?: string; // PDF notes path, e.g. /uploads/notes/notes-123.pdf
  notesFileName?: string; // Original PDF file name (for display)
  notesSize?: number; // in bytes
  status: "processing" | "ready" | "failed";
  isFree: boolean; // Free preview videos
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateVideoInput {
  title: string;
  description?: string;
  courseId: string;
  sectionTitle: string;
  order: number;
  isFree?: boolean;
}

export interface IBunnyUploadResponse {
  success: boolean;
  message: string;
  statusCode: number;
  guid?: string;
  videoId?: string;
}
