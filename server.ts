// IMPORTANT: Load env vars FIRST before any other imports
import dotenv from "dotenv";
dotenv.config();

// Now import other modules (they will have access to process.env)
import { connectDB } from "./src/config/database";
import app from "./src/app";

// Connect to database
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Node 18+ kills any request that runs longer than 5 min (requestTimeout = 300s).
// A 5GB video upload (PUT /videos/:bunnyGuid/upload-stream) can take far longer, so allow up to 2 hours.
server.requestTimeout = 2 * 60 * 60 * 1000;
