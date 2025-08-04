import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import { ApiResponse } from "./types/auth";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://yourdomain.com"] // Replace with your production domain
        : [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:5173",
          ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parsing middleware
app.use(cookieParser(process.env.COOKIE_SECRET));

// Request logging middleware (development only)
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    console.log("Request body:", req.body);
    console.log("Content-Type:", req.headers["content-type"]);
    next();
  });
}

// Health check endpoint
app.get("/health", (req, res) => {
  const response: ApiResponse = {
    success: true,
    message: "Server is running",
    data: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: "1.0.0",
    },
  };
  res.status(200).json(response);
});

// API routes
app.use("/api/auth", authRoutes);

// Root endpoint
app.get("/", (req, res) => {
  const response: ApiResponse = {
    success: true,
    message: "Authentication API Server",
    data: {
      version: "1.0.0",
      endpoints: {
        auth: "/api/auth",
        health: "/health",
      },
      documentation: "https://github.com/yourusername/auth-api",
    },
  };
  res.status(200).json(response);
});

// Global error handler
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Global error handler:", error);

    const response: ApiResponse = {
      success: false,
      message: "Internal server error",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "INTERNAL_ERROR",
    };

    res.status(500).json(response);
  }
);

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
});

export default app;
