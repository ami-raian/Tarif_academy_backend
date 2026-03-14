import { Request, Response } from "express";
import studyLogService from "./study-log.service";

/** POST /study-logs/log  — student logs study for a given date (once per day) */
export const logStudy = async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = req.user!.id;
    const { entries, date } = req.body;

    if (!entries || !Array.isArray(entries) || entries.length === 0) {
      res.status(400).json({ success: false, statusCode: 400, message: "entries array is required" });
      return;
    }

    // Determine which date to log for (default: today; cannot be in the future)
    const logDate = date ? new Date(date) : new Date();
    if (isNaN(logDate.getTime())) {
      res.status(400).json({ success: false, statusCode: 400, message: "Invalid date" });
      return;
    }
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (logDate > today) {
      res.status(400).json({ success: false, statusCode: 400, message: "Cannot log for a future date" });
      return;
    }

    const alreadyLogged = await studyLogService.hasLoggedForDate(studentId, logDate);
    if (alreadyLogged) {
      res.status(409).json({
        success: false,
        statusCode: 409,
        message: "You have already submitted a study log for this date.",
      });
      return;
    }

    const log = await studyLogService.createLog(studentId, entries, logDate);
    res.status(201).json({ success: true, statusCode: 201, message: "Study log saved!", data: log });
  } catch (error) {
    res.status(500).json({
      success: false,
      statusCode: 500,
      message: error instanceof Error ? error.message : "Server error",
    });
  }
};

/** GET /study-logs/my  — student sees their own logs */
export const getMyLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const studentId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const { logs, total } = await studyLogService.getStudentLogs(studentId, page, limit);
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Logs fetched",
      data: logs,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, statusCode: 500, message: "Server error" });
  }
};

/** GET /study-logs  — admin sees all logs */
export const getAllLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const studentId = req.query.studentId as string | undefined;
    const date = req.query.date as string | undefined;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const { logs, total } = await studyLogService.getAllLogs({ page, limit, studentId, date, startDate, endDate });
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Logs fetched",
      data: logs,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, statusCode: 500, message: "Server error" });
  }
};
