import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request, Response, NextFunction } from "express";

// Configure multer for memory storage (files stored in buffer)
const storage = multer.memoryStorage();

// File filter for video files
const videoFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  // Allowed video extensions
  const allowedExtensions = [".mp4", ".webm", ".mov", ".avi", ".mkv", ".m4v"];
  const ext = path.extname(file.originalname).toLowerCase();

  // Allowed MIME types
  const allowedMimeTypes = [
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-matroska",
    "video/x-m4v",
  ];

  if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedExtensions.join(", ")}`));
  }
};

// Video upload middleware - max 500MB
export const uploadVideo = multer({
  storage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max
  },
}).single("video"); // Field name: "video"

// Wrapper to handle multer errors
export const handleVideoUpload = (req: Request, res: Response, next: NextFunction) => {
  uploadVideo(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File too large. Maximum size is 500MB",
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    next();
  });
};

export default uploadVideo;
