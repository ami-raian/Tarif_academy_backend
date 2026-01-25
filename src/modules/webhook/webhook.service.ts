import Video from "../video/video.model";
import bunnyService from "../../services/bunny.service";

/**
 * Bunny.net Video Status Codes:
 * 0 = Created
 * 1 = Uploaded
 * 2 = Processing
 * 3 = Transcoding
 * 4 = Finished (Ready)
 * 5 = Error
 * 6 = UploadFailed
 */
const BUNNY_STATUS = {
  CREATED: 0,
  UPLOADED: 1,
  PROCESSING: 2,
  TRANSCODING: 3,
  FINISHED: 4,
  ERROR: 5,
  UPLOAD_FAILED: 6,
};

class WebhookService {
  /**
   * Process video status update from Bunny webhook
   */
  async processVideoStatusUpdate(bunnyGuid: string, bunnyStatus: number) {
    // Find video by bunnyGuid
    const video = await Video.findOne({ bunnyGuid });

    if (!video) {
      console.log(`⚠️ Video not found for bunnyGuid: ${bunnyGuid}`);
      return { found: false, bunnyGuid };
    }

    let newStatus: "processing" | "ready" | "failed" = video.status as any;
    let duration = video.duration;

    // Map Bunny status to our status
    if (bunnyStatus === BUNNY_STATUS.FINISHED) {
      newStatus = "ready";

      // Fetch video info to get duration
      try {
        const videoInfo = await bunnyService.getEncodingStatus(bunnyGuid);
        if (videoInfo && videoInfo.length) {
          duration = videoInfo.length;
        }
      } catch (err) {
        console.log("Could not fetch video duration:", err);
      }
    } else if (
      bunnyStatus === BUNNY_STATUS.ERROR ||
      bunnyStatus === BUNNY_STATUS.UPLOAD_FAILED
    ) {
      newStatus = "failed";
    } else if (
      bunnyStatus === BUNNY_STATUS.PROCESSING ||
      bunnyStatus === BUNNY_STATUS.TRANSCODING ||
      bunnyStatus === BUNNY_STATUS.UPLOADED
    ) {
      newStatus = "processing";
    }

    // Update video if status changed
    if (video.status !== newStatus || video.duration !== duration) {
      video.status = newStatus;
      video.duration = duration;
      await video.save();

      console.log(
        `📹 Video "${video.title}" status updated: ${video.status} → ${newStatus}`
      );
    }

    return {
      found: true,
      videoId: video._id,
      title: video.title,
      previousStatus: video.status,
      newStatus,
      duration,
    };
  }

  /**
   * Sync all videos that are stuck in "processing" status
   * Useful when webhooks fail or for initial setup
   */
  async syncAllProcessingVideos() {
    // Find all videos with "processing" status
    const processingVideos = await Video.find({ status: "processing" });

    console.log(`Found ${processingVideos.length} videos in processing status`);

    const results = {
      total: processingVideos.length,
      updated: 0,
      ready: 0,
      failed: 0,
      stillProcessing: 0,
      errors: [] as string[],
    };

    for (const video of processingVideos) {
      try {
        // Get current status from Bunny
        const bunnyStatus = await bunnyService.getEncodingStatus(video.bunnyGuid);

        let newStatus: "processing" | "ready" | "failed" = "processing";

        // Bunny API returns different format than webhook
        // status field: 3 = Transcoding done, 4 = Finished, 5 = Failed
        if (bunnyStatus.status === 3 || bunnyStatus.status === 4) {
          newStatus = "ready";
          results.ready++;
        } else if (bunnyStatus.status === 5) {
          newStatus = "failed";
          results.failed++;
        } else {
          results.stillProcessing++;
        }

        // Update if changed
        if (video.status !== newStatus) {
          video.status = newStatus;
          video.duration = bunnyStatus.length || video.duration;
          await video.save();
          results.updated++;

          console.log(
            `✅ Updated "${video.title}": processing → ${newStatus}`
          );
        }
      } catch (error: any) {
        console.error(`❌ Error syncing video ${video._id}:`, error.message);
        results.errors.push(`${video.title}: ${error.message}`);
      }
    }

    return results;
  }
}

export default new WebhookService();
