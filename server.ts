// IMPORTANT: Load env vars FIRST before any other imports
import dotenv from "dotenv";
dotenv.config();

// Now import other modules (they will have access to process.env)
import { connectDB } from "./src/config/database";
import app from "./src/app";

// Connect to database
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port 5000`);
});
