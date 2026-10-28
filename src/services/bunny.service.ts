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
    // Trim whitespace from environment variables
    this.apiKey = (process.env.BUNNY_STREAM_API_KEY || "").trim();
    this.libraryId = (process.env.BUNNY_LIBRARY_ID || "").trim();
    this.cdnHostname = (process.env.BUNNY_CDN_HOSTNAME || "").trim();

    // Debug log
    console.log("🔧 Bunny.net Service Initialized:");
    console.log("   Library ID:", this.libraryId || "NOT SET");
    console.log("   API Key:", this.apiKey ? `${this.apiKey.substring(0, 10)}...` : "NOT SET");
    console.log("   CDN Hostname:", this.cdnHostname || "NOT SET");

    if (!this.apiKey || !this.libraryId || !this.cdnHostname) {
      console.warn(
        "\n⚠️ Bunny.net credentials not configured. Please set BUNNY_STREAM_API_KEY, BUNNY_LIBRARY_ID, and BUNNY_CDN_HOSTNAME in .env\n"
      );
    } else {
      console.log("✅ Bunny.net configured successfully!\n");
    }
  }

  /**
   * Create a new video in Bunny Stream library
   * This creates an empty video object that you can upload to
   */
  async createVideo(title: string, collectionId?: string) {
    try {
      console.log("🔧 Bunny.net Config Check:");
      console.log("   Library ID:", this.libraryId);
      console.log("   API Key:", this.apiKey ? `${this.apiKey.substring(0, 10)}...` : "NOT SET");
      console.log("   CDN Hostname:", this.cdnHostname);
      console.log("   Request URL:", `${this.baseURL}/library/${this.libraryId}/videos`);

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
      console.error("❌ Bunny.net Error Details:");
      console.error("   Status:", error.response?.status);
      console.error("   Status Text:", error.response?.statusText);
      console.error("   Error Data:", JSON.stringify(error.response?.data, null, 2));
      console.error("   Error Message:", error.message);
      throw new Error(`Failed to create video in Bunny Stream: ${error.response?.data?.Message || error.message}`);
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
   * Upload video from buffer (for multer uploads)
   * @param videoId - The GUID from createVideo()
   * @param buffer - Video file buffer
   */
  async uploadVideoFromBuffer(videoId: string, buffer: Buffer) {
    try {
      console.log(`📤 Uploading video buffer to Bunny (${(buffer.length / 1024 / 1024).toFixed(2)} MB)...`);

      const response = await axios.put(
        `${this.baseURL}/library/${this.libraryId}/videos/${videoId}`,
        buffer,
        {
          headers: {
            AccessKey: this.apiKey,
            "Content-Type": "application/octet-stream",
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      console.log(`✅ Video uploaded successfully to Bunny`);

      return {
        success: true,
        message: "Video uploaded successfully",
        data: response.data,
      };
    } catch (error: any) {
      console.error(
        "❌ Error uploading video to Bunny.net:",
        error.response?.data || error.message
      );
      throw new Error(`Failed to upload video to Bunny Stream: ${error.response?.data?.Message || error.message}`);
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
      // Already gone on Bunny (e.g. upload never completed) - nothing to delete
      if (error.response?.status === 404) {
        return {
          success: true,
          message: "Video not found on Bunny, skipped",
        };
      }
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
   * Stream upload video directly from a Node.js Readable stream (no RAM buffering)
   * @param videoId - The GUID from createVideo()
   * @param stream - Readable stream (e.g., Express req)
   * @param contentLength - Content-Length header value
   */
  async streamUploadVideo(videoId: string, stream: NodeJS.ReadableStream, contentLength: string) {
    try {
      console.log(`📤 Streaming video to Bunny (${(parseInt(contentLength) / 1024 / 1024).toFixed(2)} MB)...`);

      const response = await axios.put(
        `${this.baseURL}/library/${this.libraryId}/videos/${videoId}`,
        stream,
        {
          headers: {
            AccessKey: this.apiKey,
            "Content-Type": "application/octet-stream",
            "Content-Length": contentLength,
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      console.log(`✅ Video streamed successfully to Bunny`);

      return {
        success: true,
        message: "Video uploaded successfully",
        data: response.data,
      };
    } catch (error: any) {
      console.error(
        "❌ Error streaming video to Bunny.net:",
        error.response?.data || error.message
      );
      throw new Error(`Failed to stream video to Bunny Stream: ${error.response?.data?.Message || error.message}`);
    }
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
