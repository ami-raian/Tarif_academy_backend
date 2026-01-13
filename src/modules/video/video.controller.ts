import { Request, Response } from "express";
import videoService from "./video.service";
import { successResponse, errorResponse, createdResponse } from "../../shared";

class VideoController {
  /**
   * Create a new video (Admin only)
   * POST /api/v1/videos
   */
  async createVideo(req: Request, res: Response) {
    try {
      const adminId = req.user?.id;
      if (!adminId) {
        return errorResponse(res, "Authentication required", 401);
      }
      const result = await videoService.createVideo(req.body, adminId);
      return createdResponse(res, result, "Video created successfully. You can now upload the video file.");
    } catch (error: any) {
      return errorResponse(res, error.message);
    }
  }

  /**
   * Get all videos for a course
   * GET /api/v1/videos/course/:courseId
   */
  async getCourseVideos(req: Request, res: Response) {
    try {
      const courseId = req.params.courseId as string;
      const isStudent = req.user?.role === "student";
      const result = await videoService.getCourseVideos(
        courseId,
        req.user?.id,
        isStudent
      );
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message);
    }
  }

  /**
   * Get video stream URL (Students only - requires enrollment)
   * GET /api/v1/videos/:videoId/stream
   */
  async getVideoStreamUrl(req: Request, res: Response) {
    try {
      const videoId = req.params.videoId as string;
      const studentId = req.user?.id;

      if (!studentId) {
        return errorResponse(res, "Authentication required", 401);
      }

      const result = await videoService.getVideoStreamUrl(videoId, studentId);
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message, error.message.includes("not enrolled") ? 403 : 500);
    }
  }

  /**
   * Mark video as completed
   * POST /api/v1/videos/:videoId/complete
   */
  async markVideoCompleted(req: Request, res: Response) {
    try {
      const videoId = req.params.videoId as string;
      const studentId = req.user?.id;

      if (!studentId) {
        return errorResponse(res, "Authentication required", 401);
      }

      const result = await videoService.markVideoCompleted(videoId, studentId);
      return successResponse(res, result, "Video marked as completed");
    } catch (error: any) {
      return errorResponse(res, error.message);
    }
  }

  /**
   * Update video details (Admin only)
   * PATCH /api/v1/videos/:videoId
   */
  async updateVideo(req: Request, res: Response) {
    try {
      const videoId = req.params.videoId as string;
      const video = await videoService.updateVideo(videoId, req.body);
      return successResponse(res, video, "Video updated successfully");
    } catch (error: any) {
      return errorResponse(res, error.message);
    }
  }

  /**
   * Delete video (Admin only)
   * DELETE /api/v1/videos/:videoId
   */
  async deleteVideo(req: Request, res: Response) {
    try {
      const videoId = req.params.videoId as string;
      const result = await videoService.deleteVideo(videoId);
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message);
    }
  }

  /**
   * Check video encoding status (Admin only)
   * GET /api/v1/videos/:videoId/status
   */
  async checkEncodingStatus(req: Request, res: Response) {
    try {
      const videoId = req.params.videoId as string;
      const result = await videoService.checkEncodingStatus(videoId);
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message);
    }
  }
}

export default new VideoController();
