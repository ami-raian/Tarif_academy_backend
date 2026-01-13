import axios from "axios";
import crypto from "crypto";
import FormData from "form-data";
import fs from "fs";

class BunnyStreamService {
  private apiKey: string;
  private libraryId: string;
  private cdnHostname: string;
  private baseURL = "https://video.bunnycdn.com";

  constructor() {
    this.apiKey = process.env.BUNNY_STREAM_API_KEY || "";
    this.libraryId = process.env.BUNNY_LIBRARY_ID || "";
    this.cdnHostname = process.env.BUNNY_CDN_HOSTNAME || "";

    if (!this.apiKey || !this.libraryId || !this.cdnHostname) {
      console.warn(
        "⚠️ Bunny.net credentials not configured. Please set BUNNY_STREAM_API_KEY, BUNNY_LIBRARY_ID, and BUNNY_CDN_HOSTNAME in .env"
      );
    }
  }

  /**
   * Create a new video in Bunny Stream library
   * This creates an empty video object that you can upload to
   */
  async createVideo(title: string, collectionId?: string) {
    try {
      const response = await axios.post(
        `${this.baseURL}/library/${this.libraryId}/videos`,
        {
          title,
          collectionId,
        },
        {
          headers: {
            AccessKey: this.apiKey,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        success: true,
        videoId: response.data.guid,
        data: response.data,
      };
    } catch (error: any) {
      console.error(
        "Error creating video in Bunny.net:",
        error.response?.data || error.message
      );
      throw new Error("Failed to create video in Bunny Stream");
    }
  }

  /**
   * Upload video file to Bunny Stream
   * @param videoId - The GUID from createVideo()
   * @param filePath - Path to the video file on server
   */
  async uploadVideo(videoId: string, filePath: string) {
    try {
      const fileStream = fs.createReadStream(filePath);

      const response = await axios.put(
        `${this.baseURL}/library/${this.libraryId}/videos/${videoId}`,
        fileStream,
        {
          headers: {
            AccessKey: this.apiKey,
            "Content-Type": "application/octet-stream",
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      return {
        success: true,
        message: "Video uploaded successfully",
        data: response.data,
      };
    } catch (error: any) {
      console.error(
        "Error uploading video to Bunny.net:",
        error.response?.data || error.message
      );
      throw new Error("Failed to upload video to Bunny Stream");
    }
  }

  /**
   * Get video information
   */
  async getVideoInfo(videoId: string) {
    try {
      const response = await axios.get(
        `${this.baseURL}/library/${this.libraryId}/videos/${videoId}`,
        {
          headers: {
            AccessKey: this.apiKey,
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error(
        "Error fetching video info:",
        error.response?.data || error.message
      );
      throw new Error("Failed to fetch video information");
    }
  }

  /**
   * Delete video from Bunny Stream
   */
  async deleteVideo(videoId: string) {
    try {
      await axios.delete(
        `${this.baseURL}/library/${this.libraryId}/videos/${videoId}`,
        {
          headers: {
            AccessKey: this.apiKey,
          },
        }
      );

      return {
        success: true,
        message: "Video deleted successfully",
      };
    } catch (error: any) {
      console.error(
        "Error deleting video:",
        error.response?.data || error.message
      );
      throw new Error("Failed to delete video");
    }
  }

  /**
   * Generate signed URL for secure video playback
   * This prevents unauthorized access to videos
   * @param videoId - Bunny video GUID
   * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
   */
  generateSignedUrl(videoId: string, expiresIn: number = 3600): string {
    const expirationTime = Math.floor(Date.now() / 1000) + expiresIn;

    // Format: libraryId + videoId + expirationTime + securityKey
    const signatureString = `${this.libraryId}${videoId}${expirationTime}${this.apiKey}`;

    // Generate SHA256 hash
    const token = crypto
      .createHash("sha256")
      .update(signatureString)
      .digest("hex");

    // Return the signed URL
    return `https://${this.cdnHostname}/${videoId}/playlist.m3u8?token=${token}&expires=${expirationTime}`;
  }

  /**
   * Generate iframe embed code with token authentication
   */
  generateEmbedUrl(videoId: string, expiresIn: number = 3600): string {
    const expirationTime = Math.floor(Date.now() / 1000) + expiresIn;
    const signatureString = `${this.libraryId}${videoId}${expirationTime}${this.apiKey}`;
    const token = crypto
      .createHash("sha256")
      .update(signatureString)
      .digest("hex");

    return `https://iframe.mediadelivery.net/embed/${this.libraryId}/${videoId}?autoplay=false&preload=true&token=${token}&expires=${expirationTime}`;
  }

  /**
   * Update video details (title, description, etc.)
   */
  async updateVideo(
    videoId: string,
    updates: { title?: string; collectionId?: string }
  ) {
    try {
      const response = await axios.post(
        `${this.baseURL}/library/${this.libraryId}/videos/${videoId}`,
        updates,
        {
          headers: {
            AccessKey: this.apiKey,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error(
        "Error updating video:",
        error.response?.data || error.message
      );
      throw new Error("Failed to update video");
    }
  }

  /**
   * Get video encoding status
   */
  async getEncodingStatus(videoId: string) {
    try {
      const videoInfo = await this.getVideoInfo(videoId);
      return {
        status: videoInfo.data.status, // 0=Queued, 1=Processing, 2=Encoding, 3=Finished, 4=Resolution Finished, 5=Failed
        videoLibraryId: videoInfo.data.videoLibraryId,
        guid: videoInfo.data.guid,
        title: videoInfo.data.title,
        length: videoInfo.data.length, // Duration in seconds
        availableResolutions: videoInfo.data.availableResolutions,
      };
    } catch (error) {
      throw error;
    }
  }
}

export default new BunnyStreamService();
