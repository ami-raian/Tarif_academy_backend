import { Request, Response } from "express";
import enrollmentService from "./enrollment.service";
import { successResponse, errorResponse, createdResponse } from "../../shared";

class EnrollmentController {
  /**
   * Create new enrollment (Student purchases course)
   * POST /api/v1/enrollments
   */
  async createEnrollment(req: Request, res: Response) {
    try {
      const studentId = req.user?.id;
      if (!studentId) {
        return errorResponse(res, "Authentication required", 401);
      }

      const enrollmentData = {
        ...req.body,
        studentId,
      };

      const enrollment = await enrollmentService.createEnrollment(enrollmentData);
      return createdResponse(res, enrollment, "Successfully enrolled in course");
    } catch (error: any) {
      return errorResponse(res, error.message);
    }
  }

  /**
   * Get student's all enrollments
   * GET /api/v1/enrollments/my-courses
   */
  async getMyEnrollments(req: Request, res: Response) {
    try {
      const studentId = req.user?.id;
      if (!studentId) {
        return errorResponse(res, "Authentication required", 401);
      }

      const enrollments = await enrollmentService.getStudentEnrollments(studentId);
      return successResponse(res, enrollments);
    } catch (error: any) {
      return errorResponse(res, error.message);
    }
  }

  /**
   * Check if enrolled in a course
   * GET /api/v1/enrollments/check/:courseId
   */
  async checkEnrollment(req: Request, res: Response) {
    try {
      const studentId = req.user?.id;
      const courseId = req.params.courseId as string;

      if (!studentId) {
        return errorResponse(res, "Authentication required", 401);
      }

      const result = await enrollmentService.checkEnrollment(studentId, courseId);
      return successResponse(res, result);
    } catch (error: any) {
      return errorResponse(res, error.message);
    }
  }

  /**
   * Get course progress
   * GET /api/v1/enrollments/progress/:courseId
   */
  async getCourseProgress(req: Request, res: Response) {
    try {
      const studentId = req.user?.id;
      const courseId = req.params.courseId as string;

      if (!studentId) {
        return errorResponse(res, "Authentication required", 401);
      }

      const progress = await enrollmentService.getCourseProgress(studentId, courseId);
      return successResponse(res, progress);
    } catch (error: any) {
      return errorResponse(res, error.message);
    }
  }

  /**
   * Cancel enrollment (Admin only)
   * DELETE /api/v1/enrollments/:enrollmentId
   */
  async cancelEnrollment(req: Request, res: Response) {
    try {
      const enrollmentId = req.params.enrollmentId as string;
      const enrollment = await enrollmentService.cancelEnrollment(enrollmentId);
      return successResponse(res, enrollment, "Enrollment cancelled successfully");
    } catch (error: any) {
      return errorResponse(res, error.message);
    }
  }
}

export default new EnrollmentController();
