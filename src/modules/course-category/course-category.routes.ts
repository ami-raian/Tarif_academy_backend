import { Router } from "express";
import {
  createCourseCategory,
  deleteCourseCategory,
  getCourseCategories,
  getCourseCategory,
  updateCourseCategory,
} from "./course-category.controller";
import { authorize, protectAdmin } from "../auth/auth.middleware";

const router = Router();

router.get("/", getCourseCategories);
router.get("/:id", getCourseCategory);

router.post(
  "/",
  protectAdmin,
  authorize("super_admin", "admin"),
  createCourseCategory,
);
router.put(
  "/:id",
  protectAdmin,
  authorize("super_admin", "admin"),
  updateCourseCategory,
);
router.delete(
  "/:id",
  protectAdmin,
  authorize("super_admin", "admin"),
  deleteCourseCategory,
);

export default router;
