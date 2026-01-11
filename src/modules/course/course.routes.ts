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

const router: Router = Router();

// Public routes
router.route("/").get(getCourses).post(createCourse);

router.get("/slug/:slug", getCourseBySlug);
router.get("/instructor/:instructorId", getInstructorCourses);

router.route("/:id").get(getCourse).put(updateCourse).delete(deleteCourse);

router.patch("/:id/publish", togglePublish);

export default router;
