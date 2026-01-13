import { Router, Request, Response } from "express";
import bunnyService from "../services/bunny.service";

const router = Router();

// Test Bunny.net connection
router.get("/test-bunny", async (req: Request, res: Response) => {
  try {
    console.log("\n🧪 Testing Bunny.net Configuration...\n");

    // Check environment variables
    const apiKey = process.env.BUNNY_STREAM_API_KEY;
    const libraryId = process.env.BUNNY_LIBRARY_ID;
    const cdnHostname = process.env.BUNNY_CDN_HOSTNAME;

    console.log("📋 Environment Variables:");
    console.log("   BUNNY_STREAM_API_KEY:", apiKey ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}` : "NOT SET");
    console.log("   BUNNY_LIBRARY_ID:", libraryId || "NOT SET");
    console.log("   BUNNY_CDN_HOSTNAME:", cdnHostname || "NOT SET");

    if (!apiKey || !libraryId || !cdnHostname) {
      return res.status(500).json({
        success: false,
        message: "Bunny.net credentials not configured",
        config: {
          apiKey: !!apiKey,
          libraryId: !!libraryId,
          cdnHostname: !!cdnHostname,
        }
      });
    }

    // Try to create a test video
    console.log("\n🎬 Creating test video...\n");
    const result = await bunnyService.createVideo("Test Video - DELETE ME");

    console.log("✅ Success! Video created:", result.videoId);

    // Clean up - delete the test video
    try {
      await bunnyService.deleteVideo(result.videoId);
      console.log("🗑️  Test video deleted\n");
    } catch (deleteError) {
      console.log("⚠️  Could not delete test video (this is okay)\n");
    }

    return res.status(200).json({
      success: true,
      message: "Bunny.net connection successful!",
      config: {
        libraryId,
        cdnHostname,
        apiKeyLength: apiKey.length,
      },
      testResult: {
        videoCreated: true,
        videoId: result.videoId,
      }
    });

  } catch (error: any) {
    console.error("\n❌ Bunny.net Test Failed:");
    console.error("   Error:", error.message);
    console.error("   Response:", error.response?.data);
    console.error("\n");

    return res.status(500).json({
      success: false,
      message: "Bunny.net connection failed",
      error: error.message,
      details: error.response?.data,
      hint: "Check your BUNNY_STREAM_API_KEY and BUNNY_LIBRARY_ID in .env file"
    });
  }
});

export default router;
