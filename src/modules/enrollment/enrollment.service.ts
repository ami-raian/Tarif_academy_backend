import Enrollment from "./enrollment.model";
import Course from "../course/course.model";
import Student from "../student/student.model";
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

    // Create enrollment
    const enrollment = await Enrollment.create({
      studentId: enrollmentData.studentId,
      courseId: enrollmentData.courseId,
      paymentAmount: enrollmentData.paymentAmount,
      transactionId: enrollmentData.transactionId,
      paymentStatus: "completed",
      enrolledAt: new Date(),
    });

    // Update course enrolled students count
    await Course.findByIdAndUpdate(enrollmentData.courseId, {
      $inc: { enrolledStudents: 1 },
    });

    return enrollment;
  }

  /**
   * Get student's all enrollments
   */
  async getStudentEnrollments(studentId: string) {
    const enrollments = await Enrollment.find({ studentId, isActive: true })
      .populate("courseId", "title description thumbnail instructor category price")
      .sort({ enrolledAt: -1 });

    return enrollments;
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
   * Check if student is enrolled in a course
   */
  async checkEnrollment(studentId: string, courseId: string) {
    const enrollment = await Enrollment.findOne({
      studentId,
      courseId,
      isActive: true,
    });

    return {
      isEnrolled: !!enrollment,
      enrollment,
    };
  }

  /**
   * Get course progress for a student
   */
  async getCourseProgress(studentId: string, courseId: string) {
    const enrollment = await Enrollment.findOne({
      studentId,
      courseId,
      isActive: true,
    }).populate("completedVideos");

    if (!enrollment) {
      throw new Error("Not enrolled in this course");
    }

    return {
      progress: enrollment.progress,
      completedVideos: enrollment.completedVideos,
      lastAccessedAt: enrollment.lastAccessedAt,
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
