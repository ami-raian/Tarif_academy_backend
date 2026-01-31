import { Request, Response } from "express";
import mcqService from "./mcq.service";

// ==================== EXAM CONTROLLERS ====================

// @desc    Get all exams (Admin)
// @route   GET /api/v1/mcq/exams
export const getExams = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page, limit, isPublished, search } = req.query;

    const result = await mcqService.getAllExams({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      isPublished: isPublished === "true" ? true : isPublished === "false" ? false : undefined,
      search: search as string,
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Exams fetched successfully",
      data: result.exams,
      pagination: {
        totalItems: result.total,
        totalPages: result.totalPages,
        currentPage: result.page,
        pageSize: limit ? parseInt(limit as string) : 10,
      },
    });
  } catch (error) {
    console.error("Error fetching exams:", error);
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error instanceof Error ? error.message : "Error fetching exams",
    });
  }
};

// @desc    Get published exams (Student)
// @route   GET /api/v1/mcq/exams/published
export const getPublishedExams = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page, limit, search } = req.query;

    const result = await mcqService.getPublishedExams({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      search: search as string,
    });

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Published exams fetched successfully",
      data: result.exams,
      pagination: {
        totalItems: result.total,
        totalPages: result.totalPages,
        currentPage: result.page,
        pageSize: limit ? parseInt(limit as string) : 10,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error instanceof Error ? error.message : "Error fetching exams",
    });
  }
};

// @desc    Get single exam by ID
// @route   GET /api/v1/mcq/exams/:id
export const getExam = async (req: Request, res: Response): Promise<void> => {
  try {
    const exam = await mcqService.getExamById(req.params.id as string);

    if (!exam) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Exam not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Exam fetched successfully",
      data: exam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error instanceof Error ? error.message : "Error fetching exam",
    });
  }
};

// @desc    Create new exam
// @route   POST /api/v1/mcq/exams
export const createExam = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const exam = await mcqService.createExam(req.body, req.user!.id);

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Exam created successfully",
      data: exam,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      statusCode: 400,
      message: error instanceof Error ? error.message : "Error creating exam",
    });
  }
};

// @desc    Update exam
// @route   PUT /api/v1/mcq/exams/:id
export const updateExam = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const exam = await mcqService.updateExam(req.params.id as string, req.body);

    if (!exam) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Exam not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Exam updated successfully",
      data: exam,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      statusCode: 400,
      message: error instanceof Error ? error.message : "Error updating exam",
    });
  }
};

// @desc    Delete exam
// @route   DELETE /api/v1/mcq/exams/:id
export const deleteExam = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const exam = await mcqService.deleteExam(req.params.id as string, req.user!.id);

    if (!exam) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Exam not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Exam deleted successfully",
      data: exam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error instanceof Error ? error.message : "Error deleting exam",
    });
  }
};

// @desc    Toggle publish status
// @route   PATCH /api/v1/mcq/exams/:id/publish
export const togglePublish = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const exam = await mcqService.togglePublish(req.params.id as string);

    if (!exam) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Exam not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: exam.isPublished
        ? "Exam published successfully"
        : "Exam unpublished successfully",
      data: exam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error instanceof Error ? error.message : "Error toggling publish",
    });
  }
};

// @desc    Publish results
// @route   PATCH /api/v1/mcq/exams/:id/publish-results
export const publishResults = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const exam = await mcqService.publishResults(req.params.id as string);

    if (!exam) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Exam not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Results published successfully",
      data: exam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error instanceof Error ? error.message : "Error publishing results",
    });
  }
};

// @desc    Unpublish results
// @route   PATCH /api/v1/mcq/exams/:id/unpublish-results
export const unpublishResults = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const exam = await mcqService.unpublishResults(req.params.id as string);

    if (!exam) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Exam not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Results unpublished successfully",
      data: exam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error instanceof Error ? error.message : "Error unpublishing results",
    });
  }
};

// ==================== QUESTION CONTROLLERS ====================

// @desc    Get questions for an exam (Admin - with answers)
// @route   GET /api/v1/mcq/exams/:examId/questions
export const getQuestions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const questions = await mcqService.getQuestionsByExam(req.params.examId as string);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Questions fetched successfully",
      data: questions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error instanceof Error ? error.message : "Error fetching questions",
    });
  }
};

// @desc    Get questions for student (without answers)
// @route   GET /api/v1/mcq/exams/:examId/questions/student
export const getQuestionsForStudent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const questions = await mcqService.getQuestionsForStudent(req.params.examId as string);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Questions fetched successfully",
      data: questions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error instanceof Error ? error.message : "Error fetching questions",
    });
  }
};

// @desc    Create question
// @route   POST /api/v1/mcq/questions
export const createQuestion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const question = await mcqService.createQuestion(req.body);

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Question created successfully",
      data: question,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      statusCode: 400,
      message: error instanceof Error ? error.message : "Error creating question",
    });
  }
};

// @desc    Update question
// @route   PUT /api/v1/mcq/questions/:id
export const updateQuestion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const question = await mcqService.updateQuestion(req.params.id as string, req.body);

    if (!question) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Question not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Question updated successfully",
      data: question,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      statusCode: 400,
      message: error instanceof Error ? error.message : "Error updating question",
    });
  }
};

// @desc    Delete question
// @route   DELETE /api/v1/mcq/questions/:id
export const deleteQuestion = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const question = await mcqService.deleteQuestion(req.params.id as string);

    if (!question) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Question not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Question deleted successfully",
      data: question,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error instanceof Error ? error.message : "Error deleting question",
    });
  }
};

// @desc    Bulk create questions
// @route   POST /api/v1/mcq/exams/:examId/questions/bulk
export const bulkCreateQuestions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions)) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Questions array is required",
      });
      return;
    }

    const created = await mcqService.bulkCreateQuestions(
      req.params.examId as string,
      questions
    );

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: `${created.length} questions created successfully`,
      data: created,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      statusCode: 400,
      message: error instanceof Error ? error.message : "Error creating questions",
    });
  }
};

// ==================== SUBMISSION CONTROLLERS ====================

// @desc    Start exam (create submission)
// @route   POST /api/v1/mcq/exams/:examId/start
export const startExam = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const studentId = req.user!.id;
    const examId = req.params.examId as string;

    // Check if exam exists and is published
    const exam = await mcqService.getExamById(examId);
    if (!exam) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Exam not found",
      });
      return;
    }

    if (!exam.isPublished) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Exam is not published yet",
      });
      return;
    }

    // Check if already submitted
    const hasSubmitted = await mcqService.hasSubmitted(examId, studentId);
    if (hasSubmitted) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: "You have already submitted this exam",
      });
      return;
    }

    const submission = await mcqService.startExam(examId, studentId);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Exam started successfully",
      data: {
        submission,
        exam: {
          _id: exam._id,
          title: exam.title,
          duration: exam.duration,
          totalQuestions: exam.totalQuestions,
          totalMarks: exam.totalMarks,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error instanceof Error ? error.message : "Error starting exam",
    });
  }
};

// @desc    Get current submission status
// @route   GET /api/v1/mcq/exams/:examId/submission
export const getSubmission = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const studentId = req.user!.id;
    const submission = await mcqService.getSubmission(
      req.params.examId as string,
      studentId
    );

    if (!submission) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "No submission found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Submission fetched successfully",
      data: submission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error instanceof Error ? error.message : "Error fetching submission",
    });
  }
};

// @desc    Save answer
// @route   POST /api/v1/mcq/exams/:examId/answer
export const saveAnswer = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const studentId = req.user!.id;
    const submission = await mcqService.saveAnswer(
      req.params.examId as string,
      studentId,
      req.body
    );

    if (!submission) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Cannot save answer. Exam not started or already submitted.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Answer saved successfully",
      data: submission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error instanceof Error ? error.message : "Error saving answer",
    });
  }
};

// @desc    Submit exam
// @route   POST /api/v1/mcq/exams/:examId/submit
export const submitExam = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const studentId = req.user!.id;
    const isAutoSubmit = req.body.isAutoSubmit || false;

    const submission = await mcqService.submitExam(
      req.params.examId as string,
      studentId,
      isAutoSubmit
    );

    if (!submission) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Cannot submit. Exam not started or already submitted.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: isAutoSubmit
        ? "Exam auto-submitted due to time limit"
        : "Exam submitted successfully",
      data: submission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error instanceof Error ? error.message : "Error submitting exam",
    });
  }
};

// @desc    Get all submissions for an exam (Admin)
// @route   GET /api/v1/mcq/exams/:examId/submissions
export const getExamSubmissions = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const submissions = await mcqService.getExamSubmissions(req.params.examId as string);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Submissions fetched successfully",
      data: submissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error instanceof Error ? error.message : "Error fetching submissions",
    });
  }
};

// @desc    Get student's all submissions
// @route   GET /api/v1/mcq/my-exams
export const getMyExams = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const studentId = req.user!.id;
    const submissions = await mcqService.getStudentSubmissions(studentId);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Your exams fetched successfully",
      data: submissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error instanceof Error ? error.message : "Error fetching your exams",
    });
  }
};

// @desc    Get exam result (only if published)
// @route   GET /api/v1/mcq/exams/:examId/result
export const getExamResult = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const studentId = req.user!.id;
    const result = await mcqService.getExamResult(req.params.examId as string, studentId);

    if (!result) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: "Result not available yet or exam not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Result fetched successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error instanceof Error ? error.message : "Error fetching result",
    });
  }
};

// @desc    Get exam leaderboard
// @route   GET /api/v1/mcq/exams/:examId/leaderboard
export const getLeaderboard = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const leaderboard = await mcqService.getLeaderboard(req.params.examId as string, limit);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Leaderboard fetched successfully",
      data: leaderboard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error instanceof Error ? error.message : "Error fetching leaderboard",
    });
  }
};
