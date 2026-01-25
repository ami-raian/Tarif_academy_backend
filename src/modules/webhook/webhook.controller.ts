import { Request, Response } from "express";
import webhookService from "./webhook.service";

class WebhookController {
  /**
   * Handle Bunny.net webhook callbacks
   * POST /api/v1/webhooks/bunny
   */
  async handleBunnyWebhook(req: Request, res: Response) {
    try {
      const payload = req.body;

      console.log("📥 Bunny Webhook Received:", JSON.stringify(payload, null, 2));

      // Bunny sends VideoId (guid) in the payload
      const { VideoId, Status, VideoLibraryId } = payload;

      if (!VideoId) {
        console.log("⚠️ Webhook received without VideoId");
        return res.status(200).json({
          success: true,
          message: "Webhook received but no VideoId provided",
        });
      }

      // Process the webhook
      const result = await webhookService.processVideoStatusUpdate(
        VideoId,
        Status
      );

      console.log(`✅ Webhook processed for video: ${VideoId}, Status: ${Status}`);

      return res.status(200).json({
        success: true,
        message: "Webhook processed successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("❌ Webhook processing error:", error.message);

      // Always return 200 to Bunny to prevent retries
      return res.status(200).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
   * Manually sync all videos stuck in "processing" status
   * POST /api/v1/webhooks/sync-all-videos
   */
  async syncAllProcessingVideos(req: Request, res: Response) {
    try {
      console.log("🔄 Starting manual sync of all processing videos...");

      const result = await webhookService.syncAllProcessingVideos();

      return res.status(200).json({
        success: true,
        message: "Video sync completed",
        data: result,
      });
    } catch (error: any) {
      console.error("❌ Sync error:", error.message);

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default new WebhookController();
