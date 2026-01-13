import { Request, Response } from "express";
import courseService from "./course.service";

// @desc    Get all courses
// @route   GET /api/courses
export const getCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page, limit, category, level, search, isPublished } = req.query;

    const result = await courseService.getAllCourses({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      category: category as string,
      level: level as string,
      search: search as string,
      isPublished:
        isPublished === "false"
          ? false
          : isPublished === "all"
          ? undefined
          : true,
    });

    res.status(200).json({
      success: true,
      count: result.courses.length,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      data: result.courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
export const getCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const course = await courseService.getCourseById(req.params.id as string);

    if (!course) {
      res.status(404).json({
        success: false,
        message: "Course not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Get course by slug
// @route   GET /api/courses/slug/:slug
export const getCourseBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const course = await courseService.getCourseBySlug(
      req.params.slug as string
    );

    if (!course) {
      res.status(404).json({
        success: false,
        message: "Course not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Create a course
// @route   POST /api/courses
export const createCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const course = await courseService.createCourse(req.body);

    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Error creating course",
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
export const updateCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const course = await courseService.updateCourse(
      req.params.id as string,
      req.body
    );

    if (!course) {
      res.status(404).json({
        success: false,
        message: "Course not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Error updating course",
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
export const deleteCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const course = await courseService.deleteCourse(req.params.id as string);

    if (!course) {
      res.status(404).json({
        success: false,
        message: "Course not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Publish/Unpublish course
// @route   PATCH /api/courses/:id/publish
export const togglePublish = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const course = await courseService.togglePublish(req.params.id as string);

    if (!course) {
      res.status(404).json({
        success: false,
        message: "Course not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: course.isPublished
        ? "Course published successfully"
        : "Course unpublished successfully",
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// @desc    Get courses by instructor
// @route   GET /api/courses/instructor/:instructorId
export const getInstructorCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const courses = await courseService.getCoursesByInstructor(
      req.params.instructorId as string
    );

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
