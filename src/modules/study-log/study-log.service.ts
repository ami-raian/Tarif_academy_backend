import StudyLog from "./study-log.model";
import { IStudyEntry } from "./study-log.interface";

class StudyLogService {
  /** Normalize a date to UTC midnight */
  private toUtcDay(date: Date): Date {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  }

  /** Check if a student has already logged for a specific date */
  async hasLoggedForDate(studentId: string, date: Date): Promise<boolean> {
    const day = this.toUtcDay(date);
    const log = await StudyLog.findOne({ studentId, date: day });
    return !!log;
  }

  /** Create a log for a student on a given date (defaults to today) */
  async createLog(studentId: string, entries: IStudyEntry[], date?: Date) {
    const day = this.toUtcDay(date || new Date());
    const log = await StudyLog.create({ studentId, date: day, entries, totalHours: 0 });
    return log;
  }

  /** Get a student's own logs (most recent first) */
  async getStudentLogs(studentId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      StudyLog.find({ studentId }).sort({ date: -1 }).skip(skip).limit(limit),
      StudyLog.countDocuments({ studentId }),
    ]);
    return { logs, total };
  }

  /** Admin: Get all logs with student info */
  async getAllLogs(params: {
    page?: number;
    limit?: number;
    studentId?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (params.studentId) filter.studentId = params.studentId;

    if (params.date) {
      const d = new Date(params.date);
      filter.date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    } else if (params.startDate || params.endDate) {
      const dateRange: Record<string, Date> = {};
      if (params.startDate) {
        const s = new Date(params.startDate);
        dateRange.$gte = new Date(Date.UTC(s.getFullYear(), s.getMonth(), s.getDate()));
      }
      if (params.endDate) {
        const e = new Date(params.endDate);
        dateRange.$lte = new Date(Date.UTC(e.getFullYear(), e.getMonth(), e.getDate()));
      }
      filter.date = dateRange;
    }

    const [logs, total] = await Promise.all([
      StudyLog.find(filter)
        .populate("studentId", "fullName email roll mobile")
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      StudyLog.countDocuments(filter),
    ]);
    return { logs, total };
  }
}

export default new StudyLogService();
