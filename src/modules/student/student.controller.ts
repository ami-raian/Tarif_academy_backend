import { Request, Response } from "express";
import studentService from "./student.service";
import {
  successResponse,
  errorResponse,
  createdResponse,
  notFoundResponse,
  paginatedResponse,
  buildPagination,
} from "../../shared";

// @desc    Get all students
// @route   GET /api/v1/students
export const getStudents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page, limit, board, group, passingYear, district, search } =
      req.query;

    const result = await studentService.getAllStudents({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      board: board as string,
      group: group as string,
      passingYear: passingYear ? parseInt(passingYear as string) : undefined,
      district: district as string,
      search: search as string,
    });

    const pagination = buildPagination(
      result.total,
      result.page,
      limit ? parseInt(limit as string) : 10
    );

    paginatedResponse(
      res,
      result.students,
      pagination,
      "Students fetched successfully"
    );
  } catch (error) {
    errorResponse(res, "Server Error", 500);
  }
};

// @desc    Get single student
// @route   GET /api/v1/students/:id
export const getStudent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const student = await studentService.getStudentById(
      req.params.id as string
    );

    if (!student) {
      notFoundResponse(res, "Student not found");
      return;
    }

    successResponse(res, student, "Student fetched successfully");
  } catch (error) {
    errorResponse(res, "Server Error", 500);
  }
};

// @desc    Register new student
// @route   POST /api/v1/students/register
export const registerStudent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, mobile, educationalInfo } = req.body;

    // Check if email already exists
    const emailExists = await studentService.emailExists(email);
    if (emailExists) {
      errorResponse(res, "Email already registered", 400);
      return;
    }

    // Check if mobile already exists
    const mobileExists = await studentService.mobileExists(mobile);
    if (mobileExists) {
      errorResponse(res, "Mobile number already registered", 400);
      return;
    }

    // Check if SSC Roll already exists for the same board
    const sscRollExists = await studentService.getStudentBySSCRoll(
      educationalInfo.ssc.roll,
      educationalInfo.ssc.board
    );
    if (sscRollExists) {
      errorResponse(res, "SSC Roll already registered for this board", 400);
      return;
    }

    const student = await studentService.createStudent(req.body);

    createdResponse(res, student, "Student registered successfully");
  } catch (error) {
    errorResponse(
      res,
      error instanceof Error ? error.message : "Error registering student",
      400
    );
  }
};

// @desc    Update student
// @route   PUT /api/v1/students/:id
export const updateStudent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const student = await studentService.updateStudent(
      req.params.id as string,
      req.body
    );

    if (!student) {
      notFoundResponse(res, "Student not found");
      return;
    }

    successResponse(res, student, "Student updated successfully");
  } catch (error) {
    errorResponse(
      res,
      error instanceof Error ? error.message : "Error updating student",
      400
    );
  }
};

// @desc    Delete student
// @route   DELETE /api/v1/students/:id
export const deleteStudent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const student = await studentService.deleteStudent(req.params.id as string);

    if (!student) {
      notFoundResponse(res, "Student not found");
      return;
    }

    successResponse(res, null, "Student deleted successfully");
  } catch (error) {
    errorResponse(res, "Server Error", 500);
  }
};

// @desc    Verify student
// @route   PATCH /api/v1/students/:id/verify
export const verifyStudent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const student = await studentService.verifyStudent(req.params.id as string);

    if (!student) {
      notFoundResponse(res, "Student not found");
      return;
    }

    successResponse(res, student, "Student verified successfully");
  } catch (error) {
    errorResponse(res, "Server Error", 500);
  }
};

// @desc    Toggle student active status
// @route   PATCH /api/v1/students/:id/toggle-status
export const toggleStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const student = await studentService.toggleActiveStatus(
      req.params.id as string
    );

    if (!student) {
      notFoundResponse(res, "Student not found");
      return;
    }

    successResponse(
      res,
      student,
      student.isActive
        ? "Student activated successfully"
        : "Student deactivated successfully"
    );
  } catch (error) {
    errorResponse(res, "Server Error", 500);
  }
};

// @desc    Get student stats
// @route   GET /api/v1/students/stats
export const getStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = await studentService.getStats();
    successResponse(res, stats, "Stats fetched successfully");
  } catch (error) {
    errorResponse(res, "Server Error", 500);
  }
};
