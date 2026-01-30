import { Router } from "express";
import webhookController from "./webhook.controller";

const router: Router = Router();

/**
 * Bunny.net Webhook Endpoint
 * POST /api/v1/webhooks/bunny
 *
 * This endpoint receives callbacks from Bunny.net when:
 * - Video encoding is completed
 * - Video encoding fails
 * - Video is deleted
 *
 * Configure this URL in Bunny Dashboard:
 * Stream → Library → Webhooks → Add Webhook
 */
router.post("/bunny", webhookController.handleBunnyWebhook);

/**
 * Manual status sync for all processing videos
 * POST /api/v1/webhooks/sync-all-videos
 *
 * Use this to manually sync all videos that are stuck in "processing" status
 */
router.post("/sync-all-videos", webhookController.syncAllProcessingVideos);

export default router;
