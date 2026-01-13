import mongoose, { Schema } from "mongoose";
import { IVideo } from "./video.interface";

const videoSchema: Schema<IVideo> = new Schema(
  {
    title: {
      type: String,
      required: [true, "Video title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required"],
      index: true,
    },
    sectionTitle: {
      type: String,
      required: [true, "Section title is required"],
      trim: true,
    },
    order: {
      type: Number,
      required: [true, "Video order is required"],
      min: 1,
    },
    duration: {
      type: Number,
      default: 0,
      min: 0,
    },
    bunnyVideoId: {
      type: String,
      required: true,
      unique: true,
    },
    bunnyGuid: {
      type: String,
      required: true,
      unique: true,
    },
    thumbnailUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ["processing", "ready", "failed"],
      default: "processing",
    },
    isFree: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for course and order
videoSchema.index({ courseId: 1, order: 1 });
videoSchema.index({ courseId: 1, sectionTitle: 1 });

const Video = mongoose.model<IVideo>("Video", videoSchema);

export default Video;
