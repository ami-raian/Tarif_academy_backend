import { Router } from "express";
import {
  getCourses,
  getCourse,
  getCourseBySlug,
  createCourse,
  updateCourse,
  deleteCourse,
  togglePublish,
  getInstructorCourses,
} from "./course.controller";
import { protect, protectAdmin, authorize } from "../auth/auth.middleware";

const router: Router = Router();

// Public routes
router
  .route("/")
  .get(getCourses)
  .post(protectAdmin, authorize("super_admin", "admin"), createCourse);

router.get("/slug/:slug", getCourseBySlug);
router.get("/instructor/:instructorId", getInstructorCourses);

router
  .route("/:id")
  .get(getCourse)
  .put(protect, updateCourse)
  .delete(protectAdmin, authorize("super_admin"), deleteCourse);

// Only admin users can publish/unpublish courses
router.patch(
  "/:id/publish",
  protectAdmin,
  authorize("super_admin", "admin"),
  togglePublish
);

export default router;
