import Video from "./video.model";
import Course from "../course/course.model";
import Enrollment from "../enrollment/enrollment.model";
import bunnyService from "../../services/bunny.service";
import { ICreateVideoInput } from "./video.interface";

class VideoService {
  /**
   * Create a new video entry and initialize in Bunny Stream
   */
  async createVideo(videoData: ICreateVideoInput, adminId: string) {
    // Check if course exists
    const course = await Course.findById(videoData.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    // Create video in Bunny Stream
    const bunnyVideo = await bunnyService.createVideo(videoData.title);

    if (!bunnyVideo.success) {
      throw new Error("Failed to create video in Bunny Stream");
    }

    // Create video document in database
    const video = await Video.create({
      title: videoData.title,
      description: videoData.description,
      courseId: videoData.courseId,
      sectionTitle: videoData.sectionTitle,
      order: videoData.order,
      bunnyVideoId: bunnyVideo.videoId,
      bunnyGuid: bunnyVideo.videoId,
      isFree: videoData.isFree || false,
      status: "processing",
    });

    // Update course's total lessons count
    await Course.findByIdAndUpdate(videoData.courseId, {
      $inc: { totalLessons: 1 },
    });

    return {
      video,
      uploadUrl: `https://video.bunnycdn.com/library/${process.env.BUNNY_LIBRARY_ID}/videos/${bunnyVideo.videoId}`,
      videoId: video._id,
      bunnyGuid: bunnyVideo.videoId,
    };
  }

  /**
   * Create video entry and upload file in one step
   * This handles both database entry creation and file upload to Bunny
   */
  async createAndUploadVideo(
    videoData: ICreateVideoInput,
    fileBuffer: Buffer,
    adminId: string
  ) {
    // Check if course exists
    const course = await Course.findById(videoData.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    console.log(`📹 Creating video "${videoData.title}" for course "${course.title}"`);

    // Step 1: Create video entry in Bunny Stream
    const bunnyVideo = await bunnyService.createVideo(videoData.title);

    if (!bunnyVideo.success) {
      throw new Error("Failed to create video in Bunny Stream");
    }

    console.log(`✅ Bunny video created with GUID: ${bunnyVideo.videoId}`);

    // Step 2: Upload the file to Bunny
    const uploadResult = await bunnyService.uploadVideoFromBuffer(
      bunnyVideo.videoId,
      fileBuffer
    );

    if (!uploadResult.success) {
      throw new Error("Failed to upload video file to Bunny Stream");
    }

    // Step 3: Create video document in database
    const video = await Video.create({
      title: videoData.title,
      description: videoData.description,
      courseId: videoData.courseId,
      sectionTitle: videoData.sectionTitle,
      order: videoData.order,
      bunnyVideoId: bunnyVideo.videoId,
      bunnyGuid: bunnyVideo.videoId,
      isFree: videoData.isFree || false,
      status: "processing", // Will be updated by webhook when encoding completes
    });

    // Step 4: Update course's total lessons count
    await Course.findByIdAndUpdate(videoData.courseId, {
      $inc: { totalLessons: 1 },
    });

    console.log(`✅ Video "${videoData.title}" created and uploaded successfully`);

    return {
      video,
      bunnyGuid: bunnyVideo.videoId,
      message: "Video created and uploaded successfully. Processing will begin shortly.",
    };
  }

  /**
   * Create video entry only (no file upload) — Step 1 of streaming upload
   * Returns bunnyGuid so frontend can stream directly
   */
  async createVideoSession(videoData: ICreateVideoInput, adminId: string) {
    const course = await Course.findById(videoData.courseId);
    if (!course) {
      throw new Error("Course not found");
    }

    console.log(`📹 Creating video session "${videoData.title}" for course "${course.title}"`);

    const bunnyVideo = await bunnyService.createVideo(videoData.title);
    if (!bunnyVideo.success) {
      throw new Error("Failed to create video in Bunny Stream");
    }

    const video = await Video.create({
      title: videoData.title,
      description: videoData.description,
      courseId: videoData.courseId,
      sectionTitle: videoData.sectionTitle,
      order: videoData.order,
      bunnyVideoId: bunnyVideo.videoId,
      bunnyGuid: bunnyVideo.videoId,
      isFree: videoData.isFree || false,
      status: "processing",
    });

    await Course.findByIdAndUpdate(videoData.courseId, {
      $inc: { totalLessons: 1 },
    });

    console.log(`✅ Video session created. bunnyGuid: ${bunnyVideo.videoId}`);

    return {
      videoId: video._id,
      bunnyGuid: bunnyVideo.videoId,
      message: "Video session created. Ready for streaming upload.",
    };
  }

  /**
   * Get all videos for a course (grouped by sections)
   */
  async getCourseVideos(
    courseId: string,
    userId?: string,
    isStudent: boolean = false
  ) {
    const videos = await Video.find({ courseId })
      .sort({ sectionTitle: 1, order: 1 })
      .lean();

    // If student, check enrollment and hide video URLs for non-enrolled
    if (isStudent && userId) {
      const enrollment = await Enrollment.findOne({
        studentId: userId,
        courseId,
        isActive: true,
      });

      // Group videos by section
      const groupedVideos = videos.reduce((acc: any, video) => {
        if (!acc[video.sectionTitle]) {
          acc[video.sectionTitle] = [];
        }

        // If not enrolled, only show free videos
        if (!enrollment && !video.isFree) {
          acc[video.sectionTitle].push({
            _id: video._id,
            title: video.title,
            order: video.order,
            duration: video.duration,
            isFree: video.isFree,
            locked: true,
          });
        } else {
          acc[video.sectionTitle].push({
            _id: video._id,
            title: video.title,
            description: video.description,
            order: video.order,
            duration: video.duration,
            isFree: video.isFree,
            status: video.status,
            thumbnailUrl: video.thumbnailUrl,
            locked: false,
            completed: enrollment?.completedVideos.includes(video._id) || false,
          });
        }

        return acc;
      }, {});

      return { sections: groupedVideos, isEnrolled: !!enrollment };
    }

    // For admin, return all videos with full details
    const groupedVideos = videos.reduce((acc: any, video) => {
      if (!acc[video.sectionTitle]) {
        acc[video.sectionTitle] = [];
      }
      acc[video.sectionTitle].push(video);
      return acc;
    }, {});

    return { sections: groupedVideos };
  }

  /**
   * Get secure video streaming URL for enrolled students
   */
  async getVideoStreamUrl(videoId: string, studentId: string) {
    const video = await Video.findById(videoId);
    if (!video) {
      throw new Error("Video not found");
    }

    // If video is free, allow access
    if (video.isFree) {
      const streamUrl = bunnyService.generateSignedUrl(video.bunnyGuid);
      const embedUrl = bunnyService.generateEmbedUrl(video.bunnyGuid);
      return { streamUrl, embedUrl, video };
    }

    // Check if student is enrolled in the course
    const enrollment = await Enrollment.findOne({
      studentId,
      courseId: video.courseId,
      isActive: true,
    });

    if (!enrollment) {
      throw new Error("You are not enrolled in this course");
    }

    // Update last accessed time
    enrollment.lastAccessedAt = new Date();
    await enrollment.save();

    // Generate signed URL (valid for 2 hours)
    const streamUrl = bunnyService.generateSignedUrl(video.bunnyGuid, 7200);
    const embedUrl = bunnyService.generateEmbedUrl(video.bunnyGuid, 7200);

    return { streamUrl, embedUrl, video };
  }

  /**
   * Mark video as completed for a student
   */
  async markVideoCompleted(videoId: string, studentId: string) {
    const video = await Video.findById(videoId);
    if (!video) {
      throw new Error("Video not found");
    }

    const enrollment = await Enrollment.findOne({
      studentId,
      courseId: video.courseId,
      isActive: true,
    });

    if (!enrollment) {
      throw new Error("You are not enrolled in this course");
    }

    // Add to completed videos if not already completed
    if (!enrollment.completedVideos.includes(video._id)) {
      enrollment.completedVideos.push(video._id);

      // Calculate progress
      const totalVideos = await Video.countDocuments({
        courseId: video.courseId,
      });
      enrollment.progress = Math.round(
        (enrollment.completedVideos.length / totalVideos) * 100
      );

      await enrollment.save();
    }

    return { progress: enrollment.progress };
  }

  /**
   * Update video details
   */
  async updateVideo(videoId: string, updates: any) {
    const video = await Video.findByIdAndUpdate(videoId, updates, {
      new: true,
      runValidators: true,
    });

    if (!video) {
      throw new Error("Video not found");
    }

    // Update in Bunny Stream if title changed
    if (updates.title) {
      await bunnyService.updateVideo(video.bunnyGuid, {
        title: updates.title,
      });
    }

    return video;
  }

  /**
   * Delete video
   */
  async deleteVideo(videoId: string) {
    const video = await Video.findById(videoId);
    if (!video) {
      throw new Error("Video not found");
    }

    // Delete from Bunny Stream
    await bunnyService.deleteVideo(video.bunnyGuid);

    // Delete from database
    await Video.findByIdAndDelete(videoId);

    // Update course's total lessons count
    await Course.findByIdAndUpdate(video.courseId, {
      $inc: { totalLessons: -1 },
    });

    return { message: "Video deleted successfully" };
  }

  /**
   * Check video encoding status
   */
  async checkEncodingStatus(videoId: string) {
    const video = await Video.findById(videoId);
    if (!video) {
      throw new Error("Video not found");
    }

    const status = await bunnyService.getEncodingStatus(video.bunnyGuid);

    // Update video status in database
    if (status.status === 3 || status.status === 4) {
      // Finished encoding
      video.status = "ready";
      video.duration = status.length;
      await video.save();
    } else if (status.status === 5) {
      // Failed
      video.status = "failed";
      await video.save();
    }

    return { video, encodingStatus: status };
  }
}

export default new VideoService();
