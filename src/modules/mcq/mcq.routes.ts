import { Router } from "express";
import {
  // Exam controllers
  getExams,
  getPublishedExams,
  getPublishedExam,
  getExam,
  createExam,
  updateExam,
  deleteExam,
  togglePublish,
  publishResults,
  unpublishResults,
  // Question controllers
  getQuestions,
  getQuestionsForStudent,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  bulkCreateQuestions,
  // Submission controllers
  startExam,
  getSubmission,
  saveAnswer,
  submitExam,
  getExamSubmissions,
  getMyExams,
  getExamResult,
  getLeaderboard,
} from "./mcq.controller";
import { protectAdmin, protectStudent, authorize } from "../auth/auth.middleware";

const router: Router = Router();

// ==================== EXAM ROUTES ====================

// Admin routes for exams
router
  .route("/exams")
  .get(protectAdmin, getExams)
  .post(protectAdmin, authorize("super_admin", "admin"), createExam);

// Published exams for students
router.get("/exams/published", protectStudent, getPublishedExams);


// Student: Get single published exam
router.get("/exams/published/:id", protectStudent, getPublishedExam);

// Student's exam history
router.get("/my-exams", protectStudent, getMyExams);

// Single exam routes
router
  .route("/exams/:id")
  .get(protectAdmin, getExam)
  .put(protectAdmin, authorize("super_admin", "admin"), updateExam)
  .delete(protectAdmin, authorize("super_admin"), deleteExam);

// Publish/unpublish exam
router.patch(
  "/exams/:id/publish",
  protectAdmin,
  authorize("super_admin", "admin"),
  togglePublish
);

// Publish/unpublish results
router.patch(
  "/exams/:id/publish-results",
  protectAdmin,
  authorize("super_admin", "admin"),
  publishResults
);

router.patch(
  "/exams/:id/unpublish-results",
  protectAdmin,
  authorize("super_admin", "admin"),
  unpublishResults
);

// ==================== QUESTION ROUTES ====================

// Admin: get all questions with answers
router.get("/exams/:examId/questions", protectAdmin, getQuestions);

// Student: get questions without answers
router.get("/exams/:examId/questions/student", protectStudent, getQuestionsForStudent);

// Bulk create questions
router.post(
  "/exams/:examId/questions/bulk",
  protectAdmin,
  authorize("super_admin", "admin"),
  bulkCreateQuestions
);

// Individual question CRUD
router
  .route("/questions")
  .post(protectAdmin, authorize("super_admin", "admin"), createQuestion);

router
  .route("/questions/:id")
  .put(protectAdmin, authorize("super_admin", "admin"), updateQuestion)
  .delete(protectAdmin, authorize("super_admin", "admin"), deleteQuestion);

// ==================== SUBMISSION ROUTES ====================

// Start exam
router.post("/exams/:examId/start", protectStudent, startExam);

// Get submission status
router.get("/exams/:examId/submission", protectStudent, getSubmission);

// Save answer
router.post("/exams/:examId/answer", protectStudent, saveAnswer);

// Submit exam
router.post("/exams/:examId/submit", protectStudent, submitExam);

// Get result (only if published)
router.get("/exams/:examId/result", protectStudent, getExamResult);

// Leaderboard (public for published results)
router.get("/exams/:examId/leaderboard", getLeaderboard);

// Admin: get all submissions for an exam
router.get("/exams/:examId/submissions", protectAdmin, getExamSubmissions);

export default router;
