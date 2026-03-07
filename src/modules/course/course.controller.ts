import { Request, Response } from "express";
import courseService from "./course.service";

// Helper function to transform course data for frontend
const transformCourseData = (course: any) => {
  return {
    ...course,
    instructor:
      typeof course.instructor === "object" && course.instructor?.name
        ? course.instructor.name
        : course.instructor || null,
  };
};

// @desc    Get all courses
// @route   GET /api/courses
export const getCourses = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { page, limit, categoryId, category, level, search, isPublished } =
      req.query;

    const result = await courseService.getAllCourses({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      categoryId: categoryId as string,
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

    const pageSize = limit ? parseInt(limit as string) : 10;

    // Transform instructor field for all courses
    const transformedCourses = result.courses.map(transformCourseData);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Courses fetched successfully",
      data: transformedCourses,
      pagination: {
        totalItems: result.total,
        totalPages: result.totalPages,
        currentPage: result.page,
        pageSize: pageSize,
      },
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({
      success: false,
      statusCode: 500,
      message:
        error instanceof Error ? error.message : "Error fetching courses",
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
        statusCode: 404,
        message: "Course not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Course fetched successfully",
      data: transformCourseData(course),
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error instanceof Error ? error.message : "Error fetching course",
    });
  }
};

// @desc    Get course by slug
// @route   GET /api/courses/slug/:slug
export const getCourseBySlug = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const course = await courseService.getCourseBySlug(
      req.params.slug as string,
    );

    if (!course) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Course not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Course fetched successfully",
      data: transformCourseData(course),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Server Error",
    });
  }
};

// @desc    Create a course
// @route   POST /api/courses
export const createCourse = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const course = await courseService.createCourse(req.body);

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      statusCode: 400,
      message: error instanceof Error ? error.message : "Error creating course",
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
export const updateCourse = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const course = await courseService.getCourseById(req.params.id as string);

    if (!course) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Course not found",
      });
      return;
    }

    // Permission check: admin (super_admin/admin) OR course owner (instructor)
    const user = req.user;
    const isAdmin =
      user &&
      user.type === "admin" &&
      ["super_admin", "admin"].includes(user.role);
    const isOwner = user && String(course.instructor) === user.id;

    if (!isAdmin && !isOwner) {
      res.status(403).json({
        success: false,
        statusCode: 403,
        message: "Access denied. You cannot update this course.",
      });
      return;
    }

    const updated = await courseService.updateCourse(
      req.params.id as string,
      req.body,
    );

    if (!updated) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Course not found or could not be updated",
      });
      return;
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Course updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      statusCode: 400,
      message: error instanceof Error ? error.message : "Error updating course",
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
export const deleteCourse = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Only super_admin can reach this route (route-protected). Perform soft-delete and record who deleted.
    const deleted = await courseService.deleteCourse(
      req.params.id as string,
      req.user!.id,
    );

    if (!deleted) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Course not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Course deleted successfully",
      data: deleted,
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error instanceof Error ? error.message : "Error deleting course",
    });
  }
};

// @desc    Publish/Unpublish course
// @route   PATCH /api/courses/:id/publish
export const togglePublish = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const course = await courseService.togglePublish(req.params.id as string);

    if (!course) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Course not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: course.isPublished
        ? "Course published successfully"
        : "Course unpublished successfully",
      data: course,
    });
  } catch (error) {
    console.error("Error toggling course publish status:", error);
    res.status(500).json({
      success: false,
      statusCode: 500,
      message:
        error instanceof Error ? error.message : "Error updating course status",
    });
  }
};

// @desc    Get courses by instructor
// @route   GET /api/courses/instructor/:instructorId
export const getInstructorCourses = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const courses = await courseService.getCoursesByInstructor(
      req.params.instructorId as string,
    );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Instructor courses fetched successfully",
      data: courses,
    });
  } catch (error) {
    console.error("Error fetching instructor courses:", error);
    res.status(500).json({
      success: false,
      statusCode: 500,
      message:
        error instanceof Error
          ? error.message
          : "Error fetching instructor courses",
    });
  }
};

// @desc    Upload course thumbnail
// @route   POST /api/courses/:id/thumbnail
export const uploadCourseThumbnail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const courseId = req.params.id as string;

    // Check if file was uploaded
    if (!req.file) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: "কোন ছবি আপলোড করা হয়নি",
      });
      return;
    }

    // Get the file path - just the relative path
    const thumbnailPath = `/uploads/thumbnails/${req.file.filename}`;

    // Update course with new thumbnail
    const course = await courseService.updateCourse(courseId, {
      thumbnail: thumbnailPath,
    });

    if (!course) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "কোর্স পাওয়া যায়নি",
      });
      return;
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "থাম্বনেইল সফলভাবে আপলোড হয়েছে",
      data: {
        thumbnail: thumbnailPath,
        course,
      },
    });
  } catch (error) {
    console.error("Error uploading thumbnail:", error);
    res.status(500).json({
      success: false,
      statusCode: 500,
      message:
        error instanceof Error
          ? error.message
          : "থাম্বনেইল আপলোড করতে সমস্যা হয়েছে",
    });
  }
};
