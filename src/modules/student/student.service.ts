import Student from "./student.model";
import {
  IStudent,
  ICreateStudentInput,
  IUpdateStudentInput,
} from "./student.interface";

interface QueryOptions {
  page?: number;
  limit?: number;
  board?: string;
  group?: string;
  passingYear?: number;
  district?: string;
  isVerified?: boolean;
  search?: string;
}

class StudentService {
  // Get all students with filters
  async getAllStudents(options: QueryOptions = {}): Promise<{
    students: IStudent[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      board,
      group,
      passingYear,
      district,
      isVerified,
      search,
    } = options;

    const query: Record<string, unknown> = {};

    if (board) query["educationalInfo.ssc.board"] = board;
    if (group) query["educationalInfo.ssc.group"] = group;
    if (passingYear) query["educationalInfo.ssc.passingYear"] = passingYear;
    if (district) query["address.district"] = district;
    if (typeof isVerified === "boolean") query.isVerified = isVerified;

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
        { "educationalInfo.ssc.roll": { $regex: search, $options: "i" } },
        { "educationalInfo.ssc.schoolName": { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [students, total] = await Promise.all([
      Student.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Student.countDocuments(query),
    ]);

    return {
      students,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Get student by ID
  async getStudentById(id: string): Promise<IStudent | null> {
    return await Student.findById(id);
  }

  // Get student by email
  async getStudentByEmail(email: string): Promise<IStudent | null> {
    return await Student.findOne({ email });
  }

  // Get student by email with password (for login)
  async getStudentByEmailWithPassword(email: string): Promise<IStudent | null> {
    return await Student.findOne({ email }).select("+password");
  }

  // Get student by mobile
  async getStudentByMobile(mobile: string): Promise<IStudent | null> {
    return await Student.findOne({ mobile });
  }

  // Get student by SSC Roll and Board
  async getStudentBySSCRoll(
    sscRoll: string,
    board: string
  ): Promise<IStudent | null> {
    return await Student.findOne({
      "educationalInfo.ssc.roll": sscRoll,
      "educationalInfo.ssc.board": board,
    });
  }

  // Create new student
  async createStudent(studentData: ICreateStudentInput): Promise<IStudent> {
    return await Student.create(studentData);
  }

  // Update student
  async updateStudent(
    id: string,
    studentData: IUpdateStudentInput
  ): Promise<IStudent | null> {
    return await Student.findByIdAndUpdate(id, studentData, {
      new: true,
      runValidators: true,
    });
  }

  // Delete student
  async deleteStudent(id: string): Promise<IStudent | null> {
    return await Student.findByIdAndDelete(id);
  }

  // Verify student
  async verifyStudent(id: string): Promise<IStudent | null> {
    return await Student.findByIdAndUpdate(
      id,
      { isVerified: true },
      { new: true }
    );
  }

  // Toggle active status
  async toggleActiveStatus(id: string): Promise<IStudent | null> {
    const student = await Student.findById(id);
    if (!student) return null;

    student.isActive = !student.isActive;
    await student.save();
    return student;
  }

  // Check if email exists
  async emailExists(email: string): Promise<boolean> {
    const student = await Student.findOne({ email });
    return !!student;
  }

  // Check if mobile exists
  async mobileExists(mobile: string): Promise<boolean> {
    const student = await Student.findOne({ mobile });
    return !!student;
  }

  // Get students by board
  async getStudentsByBoard(board: string): Promise<IStudent[]> {
    return await Student.find({ "educationalInfo.ssc.board": board });
  }

  // Get students by passing year
  async getStudentsByPassingYear(year: number): Promise<IStudent[]> {
    return await Student.find({ "educationalInfo.ssc.passingYear": year });
  }

  // Get student stats
  async getStats(): Promise<{
    total: number;
    verified: number;
    unverified: number;
    byBoard: Record<string, number>;
    byGroup: Record<string, number>;
  }> {
    const [total, verified, boardStats, groupStats] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ isVerified: true }),
      Student.aggregate([
        { $group: { _id: "$educationalInfo.ssc.board", count: { $sum: 1 } } },
      ]),
      Student.aggregate([
        { $group: { _id: "$educationalInfo.ssc.group", count: { $sum: 1 } } },
      ]),
    ]);

    const byBoard: Record<string, number> = {};
    boardStats.forEach((item) => {
      byBoard[item._id] = item.count;
    });

    const byGroup: Record<string, number> = {};
    groupStats.forEach((item) => {
      byGroup[item._id] = item.count;
    });

    return {
      total,
      verified,
      unverified: total - verified,
      byBoard,
      byGroup,
    };
  }

  // Update student password
  async updateStudentPassword(
    id: string,
    hashedPassword: string
  ): Promise<void> {
    await Student.findByIdAndUpdate(id, { password: hashedPassword });
  }
}

export default new StudentService();
