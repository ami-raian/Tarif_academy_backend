import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import routes from "./routes";
import { errorHandler } from "./shared";

const app: Application = express();

// API Version from env
const API_VERSION = process.env.API_VERSION || "v1";

// CORS Configuration
// const corsOptions = {
//   origin: function (origin: string | undefined, callback: Function) {
//     const allowedOrigins = [
//       process.env.FRONTEND_URL || "http://localhost:3000",
//       "http://localhost:3000",
//       "http://localhost:5173",
//       "http://localhost:5174",
//     ];

//     // Allow requests with no origin (like mobile apps or Postman)
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(null, true); // Allow all origins in development
//     }
//   },
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
//   optionsSuccessStatus: 200,
// };

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      "https://www.tarifacademy.com",
      "https://tarifacademy.com",
      "https://staging.tarifacademy.com",
      "https://staging.api.tarifacademy.com",
      `${process.env.FRONTEND_URL}`,
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

// Skip body parsers for video streaming uploads — they check Content-Length globally in Express 5
// and would reject large uploads with 413 before the controller can stream them
const skipForUploadStream = (parser: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Use originalUrl (full original URL) — req.path can be relative to mount point inside routers
    if ((req.originalUrl || req.path).includes("/upload-stream")) {
      console.log(`⏭️  Bypassing body parser for: ${req.method} ${req.originalUrl}`);
      return next();
    }
    return parser(req, res, next);
  };
};

app.use(skipForUploadStream(express.json({ limit: "10mb" })));
app.use(skipForUploadStream(express.urlencoded({ extended: true, limit: "10mb" })));

// Serve static files from public folder
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "public", "uploads")),
);

// API Routes - /api/v1/...
app.use(`/api/${API_VERSION}`, routes);

// Root route
app.get("/", (req: Request, res: Response) => {
  res.status(200).send("tarif-academy running on port 5000");
});

// Health check route
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
