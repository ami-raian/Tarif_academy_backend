import { McqExam, McqQuestion, McqSubmission } from "./mcq.model";
import {
  IMcqExam,
  IMcqQuestion,
  IMcqSubmission,
  ICreateExamInput,
  ICreateQuestionInput,
  IUpdateExamInput,
  ISubmitAnswerInput,
} from "./mcq.interface";

interface QueryOptions {
  page?: number;
  limit?: number;
  isPublished?: boolean;
  isResultPublished?: boolean;
  search?: string;
}

class McqService {
  // ==================== EXAM METHODS ====================

  // Get all exams with filters (for admin)
  async getAllExams(options: QueryOptions = {}): Promise<{
    exams: IMcqExam[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      isPublished,
      isResultPublished,
      search,
    } = options;

    const query: Record<string, unknown> = { isDeleted: false };

    if (isPublished !== undefined) {
      query.isPublished = isPublished;
    }

    if (isResultPublished !== undefined) {
      query.isResultPublished = isResultPublished;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [exams, total] = await Promise.all([
      McqExam.find(query)
        .populate("createdBy", "name email")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      McqExam.countDocuments(query),
    ]);

    return {
      exams: exams as IMcqExam[],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Get published exams for students
  async getPublishedExams(options: QueryOptions = {}): Promise<{
    exams: IMcqExam[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, search } = options;

    const query: Record<string, unknown> = {
      isDeleted: false,
      isPublished: true,
    };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [exams, total] = await Promise.all([
      McqExam.find(query)
        .select("-isDeleted -deletedAt -deletedBy")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      McqExam.countDocuments(query),
    ]);

    return {
      exams: exams as IMcqExam[],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Get exam by ID
  async getExamById(id: string): Promise<IMcqExam | null> {
    return await McqExam.findOne({ _id: id, isDeleted: false }).populate(
      "createdBy",
      "name email",
    );
  }

  // Create new exam
  async createExam(
    examData: ICreateExamInput,
    createdBy: string,
  ): Promise<IMcqExam> {
    return await McqExam.create({ ...examData, createdBy });
  }

  // Update exam
  async updateExam(
    id: string,
    examData: IUpdateExamInput,
  ): Promise<IMcqExam | null> {
    return await McqExam.findOneAndUpdate(
      { _id: id, isDeleted: false },
      examData,
      { new: true, runValidators: true },
    );
  }

  // Delete exam (soft delete)
  async deleteExam(id: string, deletedBy: string): Promise<IMcqExam | null> {
    // Also delete all questions for this exam
    await McqQuestion.deleteMany({ examId: id });

    return await McqExam.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), deletedBy },
      { new: true },
    );
  }

  // Publish/Unpublish exam
  async togglePublish(id: string): Promise<IMcqExam | null> {
    const exam = await McqExam.findOne({ _id: id, isDeleted: false });
    if (!exam) return null;

    exam.isPublished = !exam.isPublished;
    await exam.save();
    return exam;
  }

  // Publish results
  async publishResults(id: string): Promise<IMcqExam | null> {
    return await McqExam.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isResultPublished: true },
      { new: true },
    );
  }

  // Unpublish results
  async unpublishResults(id: string): Promise<IMcqExam | null> {
    return await McqExam.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isResultPublished: false },
      { new: true },
    );
  }

  // ==================== QUESTION METHODS ====================

  // Get questions for an exam
  async getQuestionsByExam(examId: string): Promise<IMcqQuestion[]> {
    return await McqQuestion.find({ examId }).sort({ order: 1 });
  }

  // Get questions for students (hide correct answers)
  async getQuestionsForStudent(examId: string) {
    const questions = await McqQuestion.find({ examId })
      .select("-options.isCorrect")
      .sort({ order: 1 })
      .lean();

    // Remove isCorrect from options
    return questions.map((q) => ({
      ...q,
      options: q.options.map((opt: { text: string; isCorrect?: boolean }) => ({
        text: opt.text,
      })),
    }));
  }

  // Create question
  async createQuestion(
    questionData: ICreateQuestionInput,
  ): Promise<IMcqQuestion> {
    // Get the current max order for this exam
    const lastQuestion = await McqQuestion.findOne({
      examId: questionData.examId,
    })
      .sort({ order: -1 })
      .lean();

    const order =
      questionData.order ?? (lastQuestion ? lastQuestion.order + 1 : 0);

    const question = await McqQuestion.create({ ...questionData, order });

    // Update exam's totalQuestions and totalMarks
    await this.updateExamStats(questionData.examId);

    return question;
  }

  // Update question
  async updateQuestion(
    id: string,
    questionData: Partial<ICreateQuestionInput>,
  ): Promise<IMcqQuestion | null> {
    const question = await McqQuestion.findByIdAndUpdate(id, questionData, {
      new: true,
      runValidators: true,
    });

    if (question) {
      await this.updateExamStats(question.examId.toString());
    }

    return question;
  }

  // Delete question
  async deleteQuestion(id: string): Promise<IMcqQuestion | null> {
    const question = await McqQuestion.findByIdAndDelete(id);

    if (question) {
      await this.updateExamStats(question.examId.toString());
    }

    return question;
  }

  // Bulk create questions
  async bulkCreateQuestions(
    examId: string,
    questions: Omit<ICreateQuestionInput, "examId">[],
  ) {
    const questionsWithExamId = questions.map((q, index) => ({
      ...q,
      examId,
      order: q.order ?? index,
    }));

    const created = await McqQuestion.insertMany(questionsWithExamId);
    await this.updateExamStats(examId);

    return created;
  }

  // Update exam stats (totalQuestions, totalMarks)
  private async updateExamStats(examId: string): Promise<void> {
    const questions = await McqQuestion.find({ examId });
    const totalQuestions = questions.length;
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

    await McqExam.findByIdAndUpdate(examId, { totalQuestions, totalMarks });
  }

  // ==================== SUBMISSION METHODS ====================

  // Start exam (create submission entry)
  async startExam(examId: string, studentId: string): Promise<IMcqSubmission> {
    // Check if already started
    const existing = await McqSubmission.findOne({ examId, studentId });
    if (existing) {
      return existing;
    }

    // Get all questions for this exam
    const questions = await McqQuestion.find({ examId });
    const exam = await McqExam.findById(examId);

    if (!exam) {
      throw new Error("Exam not found");
    }

    // Initialize answers array with null selections
    const answers = questions.map((q) => ({
      questionId: q._id,
      selectedOptionIndex: null,
      isCorrect: false,
      marksObtained: 0,
    }));

    return await McqSubmission.create({
      examId,
      studentId,
      answers,
      totalMarks: exam.totalMarks,
      startedAt: new Date(),
      status: "in_progress",
    });
  }

  // Get submission by exam and student
  async getSubmission(
    examId: string,
    studentId: string,
  ): Promise<IMcqSubmission | null> {
    return await McqSubmission.findOne({ examId, studentId })
      .populate("examId")
      .populate("answers.questionId");
  }

  // Save answer during exam
  async saveAnswer(
    examId: string,
    studentId: string,
    answerData: ISubmitAnswerInput,
  ): Promise<IMcqSubmission | null> {
    const submission = await McqSubmission.findOne({
      examId,
      studentId,
      status: "in_progress",
    });

    if (!submission) {
      return null;
    }

    // Find and update the specific answer
    const answerIndex = submission.answers.findIndex(
      (a) => a.questionId.toString() === answerData.questionId,
    );

    if (answerIndex !== -1) {
      submission.answers[answerIndex].selectedOptionIndex =
        answerData.selectedOptionIndex;
    }

    await submission.save();
    return submission;
  }

  // Submit exam
  async submitExam(
    examId: string,
    studentId: string,
    isAutoSubmit: boolean = false,
  ): Promise<IMcqSubmission | null> {
    const submission = await McqSubmission.findOne({
      examId,
      studentId,
      status: "in_progress",
    });

    if (!submission) {
      return null;
    }

    // Get exam and questions
    const exam = await McqExam.findById(examId);
    const questions = await McqQuestion.find({ examId });

    if (!exam) {
      return null;
    }

    // Calculate marks
    let obtainedMarks = 0;

    for (const answer of submission.answers) {
      const question = questions.find(
        (q) => q._id.toString() === answer.questionId.toString(),
      );

      if (question && answer.selectedOptionIndex !== null) {
        const selectedOption = question.options[answer.selectedOptionIndex];
        if (selectedOption && selectedOption.isCorrect) {
          answer.isCorrect = true;
          answer.marksObtained = question.marks;
          obtainedMarks += question.marks;
        } else {
          // Apply negative marking for wrong answers
          answer.isCorrect = false;
          answer.marksObtained = -exam.negativeMarking;
          obtainedMarks -= exam.negativeMarking;
        }
      }
    }

    // Update submission
    submission.obtainedMarks = obtainedMarks;
    submission.percentage =
      exam.totalMarks > 0
        ? Math.round((obtainedMarks / exam.totalMarks) * 100)
        : 0;
    submission.isPassed = obtainedMarks >= exam.passingMarks;
    submission.submittedAt = new Date();
    submission.isAutoSubmitted = isAutoSubmit;
    submission.status = "evaluated";

    await submission.save();
    return submission;
  }

  // Get all submissions for an exam (for admin)
  async getExamSubmissions(
    examId: string,
    options: { page?: number; limit?: number } = {},
  ): Promise<{
    submissions: IMcqSubmission[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const query = { examId };

    const [submissions, total] = await Promise.all([
      McqSubmission.find(query)
        .populate("studentId", "roll fullName email mobile")
        .populate("examId", "title totalMarks passingMarks")
        .sort({ obtainedMarks: -1 })
        .skip(skip)
        .limit(limit),
      McqSubmission.countDocuments(query),
    ]);

    return {
      submissions: submissions as IMcqSubmission[],
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Get student's all submissions
  async getStudentSubmissions(studentId: string): Promise<IMcqSubmission[]> {
    return await McqSubmission.find({ studentId })
      .populate("examId", "title totalMarks passingMarks isResultPublished")
      .sort({ createdAt: -1 });
  }

  // Get exam result for student (only if result is published)
  async getExamResult(
    examId: string,
    studentId: string,
  ): Promise<IMcqSubmission | null> {
    const exam = await McqExam.findById(examId);
    if (!exam || !exam.isResultPublished) {
      return null;
    }

    return await McqSubmission.findOne({ examId, studentId })
      .populate("examId")
      .populate("answers.questionId");
  }

  // Check if student has already submitted
  async hasSubmitted(examId: string, studentId: string): Promise<boolean> {
    const submission = await McqSubmission.findOne({ examId, studentId });
    return (
      submission?.status === "evaluated" || submission?.status === "submitted"
    );
  }

  // Get exam leaderboard
  async getLeaderboard(
    examId: string,
    limit: number = 10,
  ): Promise<IMcqSubmission[]> {
    return await McqSubmission.find({ examId, status: "evaluated" })
      .populate("studentId", "fullName")
      .select("studentId obtainedMarks percentage isPassed submittedAt")
      .sort({ obtainedMarks: -1, submittedAt: 1 })
      .limit(limit);
  }
}

export default new McqService();
