import { Router } from "express";
import {
  getStudents,
  getStudent,
  registerStudent,
  updateStudent,
  deleteStudent,
  verifyStudent,
  toggleStatus,
  getStats,
} from "./student.controller";
import { validate } from "../../shared";
import {
  registerStudentSchema,
  updateStudentSchema,
  idParamSchema,
} from "./student.validation";

const router: Router = Router();

// Stats route (must be before /:id)
router.get("/stats", getStats);

// Main CRUD routes
router.route("/").get(getStudents);

// Register with validation
router.post("/register", validate(registerStudentSchema), registerStudent);

// Routes with ID param validation
router
  .route("/:id")
  .get(validate(idParamSchema, "params"), getStudent)
  .put(
    validate(idParamSchema, "params"),
    validate(updateStudentSchema),
    updateStudent
  )
  .delete(validate(idParamSchema, "params"), deleteStudent);

// Special routes with ID validation
router.patch("/:id/verify", validate(idParamSchema, "params"), verifyStudent);
router.patch(
  "/:id/toggle-status",
  validate(idParamSchema, "params"),
  toggleStatus
);

export default router;
