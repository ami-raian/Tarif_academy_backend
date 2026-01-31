import Enrollment from "./enrollment.model";
import Course from "../course/course.model";
import Student from "../student/student.model";
import Video from "../video/video.model";
import { ICreateEnrollmentInput } from "./enrollment.interface";

class EnrollmentService {
  /**
   * Create a new enrollment (when student purchases a course)
   */
  async createEnrollment(enrollmentData: ICreateEnrollmentInput) {
    // Check if course exists
    const course = await Course.findById(enrollmentData.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    // Check if student exists
    const student = await Student.findById(enrollmentData.studentId);
    if (!student) {
      throw new Error("Student not found");
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      studentId: enrollmentData.studentId,
      courseId: enrollmentData.courseId,
    });

    if (existingEnrollment) {
      throw new Error("Already enrolled in this course");
    }

    // Create enrollment with pending status (requires admin approval)
    const enrollment = await Enrollment.create({
      studentId: enrollmentData.studentId,
      courseId: enrollmentData.courseId,
      paymentAmount: enrollmentData.paymentAmount,
      transactionId: enrollmentData.transactionId,
      paymentStatus: "completed",
      status: "pending",
      enrolledAt: new Date(),
    });

    // Note: enrolledStudents count is updated only when admin approves

    return enrollment;
  }

  /**
   * Get student's all enrollments (only approved ones for course access)
   */
  async getStudentEnrollments(studentId: string) {
    const enrollments = await Enrollment.find({ studentId, isActive: true })
      .populate("courseId", "title description thumbnail instructor category price totalLessons")
      .sort({ enrolledAt: -1 });

    // Transform to match frontend expected format (courseId -> course)
    return enrollments.map((enrollment) => {
      const enrollmentObj = enrollment.toObject();
      return {
        ...enrollmentObj,
        course: enrollmentObj.courseId,
        student: enrollmentObj.studentId,
      };
    });
  }

  /**
   * Get all enrollments for admin (with filters)
   */
  async getAllEnrollments(filters: { status?: string; page?: number; limit?: number }) {
    const { status, page = 1, limit = 20 } = filters;

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const [enrollments, total] = await Promise.all([
      Enrollment.find(query)
        .populate("studentId", "fullName email phone")
        .populate("courseId", "title price thumbnail")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Enrollment.countDocuments(query),
    ]);

    return {
      enrollments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Approve enrollment (Admin only)
   */
  async approveEnrollment(enrollmentId: string, adminId: string) {
    const enrollment = await Enrollment.findById(enrollmentId);

    if (!enrollment) {
      throw new Error("Enrollment not found");
    }

    if (enrollment.status === "approved") {
      throw new Error("Enrollment is already approved");
    }

    if (enrollment.status === "rejected") {
      throw new Error("Cannot approve a rejected enrollment");
    }

    enrollment.status = "approved";
    enrollment.approvedBy = adminId as any;
    enrollment.approvedAt = new Date();
    await enrollment.save();

    // Update course enrolled students count
    await Course.findByIdAndUpdate(enrollment.courseId, {
      $inc: { enrolledStudents: 1 },
    });

    return enrollment;
  }

  /**
   * Reject enrollment (Admin only)
   */
  async rejectEnrollment(enrollmentId: string, adminId: string, reason?: string) {
    const enrollment = await Enrollment.findById(enrollmentId);

    if (!enrollment) {
      throw new Error("Enrollment not found");
    }

    if (enrollment.status === "rejected") {
      throw new Error("Enrollment is already rejected");
    }

    if (enrollment.status === "approved") {
      throw new Error("Cannot reject an approved enrollment");
    }

    enrollment.status = "rejected";
    enrollment.rejectedBy = adminId as any;
    enrollment.rejectedAt = new Date();
    enrollment.rejectionReason = reason || "";
    await enrollment.save();

    return enrollment;
  }

  /**
   * Get enrollment details
   */
  async getEnrollmentDetails(enrollmentId: string, studentId: string) {
    const enrollment = await Enrollment.findOne({
      _id: enrollmentId,
      studentId,
    }).populate("courseId");

    if (!enrollment) {
      throw new Error("Enrollment not found");
    }

    return enrollment;
  }

  /**
   * Check if student is enrolled in a course (only approved enrollments)
   */
  async checkEnrollment(studentId: string, courseId: string) {
    const enrollment = await Enrollment.findOne({
      studentId,
      courseId,
      isActive: true,
    });

    return {
      isEnrolled: enrollment?.status === "approved",
      status: enrollment?.status || null,
      enrollment,
    };
  }

  /**
   * Get course progress for a student
   */
  async getCourseProgress(studentId: string, courseId: string) {
    const [enrollment, totalVideos] = await Promise.all([
      Enrollment.findOne({
        studentId,
        courseId,
        isActive: true,
      }),
      Video.countDocuments({ courseId }),
    ]);

    if (!enrollment) {
      throw new Error("Not enrolled in this course");
    }

    const completedVideoIds = enrollment.completedVideos.map((id) => id.toString());

    return {
      totalVideos,
      completedVideos: completedVideoIds.length,
      progress: enrollment.progress,
      completedVideoIds,
    };
  }

  /**
   * Cancel enrollment (Admin only)
   */
  async cancelEnrollment(enrollmentId: string) {
    const enrollment = await Enrollment.findByIdAndUpdate(
      enrollmentId,
      { isActive: false },
      { new: true }
    );

    if (!enrollment) {
      throw new Error("Enrollment not found");
    }

    // Decrease course enrolled students count
    await Course.findByIdAndUpdate(enrollment.courseId, {
      $inc: { enrolledStudents: -1 },
    });

    return enrollment;
  }
}

export default new EnrollmentService();
