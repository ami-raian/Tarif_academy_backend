import { Router } from "express";
import videoController from "./video.controller";
import { protect, protectAdmin, protectStudent } from "../auth/auth.middleware";
import { handleVideoUpload } from "../../middlewares/upload.middleware";

const router = Router();

// Admin routes - Video management
router.post("/", protectAdmin, videoController.createVideo);

// Single-step video upload (create + upload in one request)
// POST /api/v1/videos/upload
// Content-Type: multipart/form-data
router.post("/upload", protectAdmin, handleVideoUpload, videoController.uploadVideo);

router.patch("/:videoId", protectAdmin, videoController.updateVideo);
router.delete("/:videoId", protectAdmin, videoController.deleteVideo);
router.get("/:videoId/status", protectAdmin, videoController.checkEncodingStatus);

// Public/Student routes - Get course videos
router.get("/course/:courseId", protect, videoController.getCourseVideos);

// Student routes - Video streaming and progress
router.get("/:videoId/stream", protectStudent, videoController.getVideoStreamUrl);
router.post("/:videoId/complete", protectStudent, videoController.markVideoCompleted);

export default router;
