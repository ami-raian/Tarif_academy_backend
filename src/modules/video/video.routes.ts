import { Router } from "express";
import videoController from "./video.controller";
import { protect, protectAdmin, protectStudent } from "../auth/auth.middleware";

const router = Router();

// Admin routes - Video management
router.post("/", protectAdmin, videoController.createVideo);
router.patch("/:videoId", protectAdmin, videoController.updateVideo);
router.delete("/:videoId", protectAdmin, videoController.deleteVideo);
router.get("/:videoId/status", protectAdmin, videoController.checkEncodingStatus);

// Public/Student routes - Get course videos
router.get("/course/:courseId", protect, videoController.getCourseVideos);

// Student routes - Video streaming and progress
router.get("/:videoId/stream", protectStudent, videoController.getVideoStreamUrl);
router.post("/:videoId/complete", protectStudent, videoController.markVideoCompleted);

export default router;
