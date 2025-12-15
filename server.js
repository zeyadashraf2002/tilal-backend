import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
// import rateLimit from "express-rate-limit";
import connectDB from "./src/config/database.js";
import errorHandler from "./src/middleware/errorHandler.js";

// Import routes
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import taskRoutes from "./src/routes/taskRoutes.js";
import clientRoutes from "./src/routes/clientRoutes.js";
import plantRoutes from "./src/routes/plantRoutes.js";
import inventoryRoutes from "./src/routes/inventoryRoutes.js";
import deleteImageRoutes from "./src/routes/deleteImageRoutes.js";
import reportRoutes from "./src/routes/reportRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import uploadRoutes from "./src/routes/uploadRoutes.js";
import siteRoutes from "./src/routes/siteRoutes.js";

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize express app
const app = express();

// =====================================
// 🛡️ CORS Configuration
// =====================================
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("CORS blocked origin:", origin);
      callback(null, true);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  maxAge: 600,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// =====================================
// 🔒 Security Middleware
// =====================================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(mongoSanitize());

// =====================================
// 🚦 Rate Limiting
// =====================================
// const limiter = rateLimit({
//   windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 10 * 60 * 1000,
//   max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10000,
//   message: "Too many requests from this IP, please try again later",
//   standardHeaders: true,
//   legacyHeaders: false,
//   skip: (req) => req.url.includes("/uploads") || req.url.includes("/health"),
// });
// app.use("/api", limiter);

// =====================================
// 🧩 Middleware
// =====================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(compression());

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// =====================================
// 📁 Static Files
// =====================================
app.use(
  "/uploads",
  express.static("uploads", {
    setHeaders: (res) => {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

// =====================================
// 🚀 API Routes
// =====================================
const API_VERSION = process.env.API_VERSION || "v1";

app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/delete-image`, deleteImageRoutes);
app.use(`/api/${API_VERSION}/users`, userRoutes);
app.use(`/api/${API_VERSION}/tasks`, taskRoutes);
app.use(`/api/${API_VERSION}/clients`, clientRoutes);
app.use(`/api/${API_VERSION}/sites`, siteRoutes);
app.use(`/api/${API_VERSION}/plants`, plantRoutes);
app.use(`/api/${API_VERSION}/inventory`, inventoryRoutes);
app.use(`/api/${API_VERSION}/reports`, reportRoutes);
app.use(`/api/${API_VERSION}/notifications`, notificationRoutes);
app.use(`/api/${API_VERSION}/uploads`, uploadRoutes);

// =====================================
// 💓 Health & Root
// =====================================
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    cors: "enabled",
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Garden Management System API",
    version: API_VERSION,
    documentation: "/api/docs",
    cors: "enabled",
  });
});

// =====================================
// ❌ 404 & Error Handling
// =====================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

app.use(errorHandler);

// =====================================
// 🧠 Server Start (Local Only)
// =====================================
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  const server = app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║   🌿 Garden Management System API                    ║
║   Running in ${process.env.NODE_ENV} mode             ║
║   📡 http://localhost:${PORT}                         ║
║   🏥 /health                                           ║
╚═══════════════════════════════════════════════════════╝
    `);
  });

  process.on("unhandledRejection", (err) => {
    console.error(`❌ Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });

  process.on("SIGTERM", () => {
    console.log("👋 SIGTERM received. Shutting down gracefully...");
    server.close(() => console.log("✅ Process terminated"));
  });
}

// Load cron jobs (runs once at startup)
import "./src/utils/cronJobs.js";
// ✅ مهم جدًا لتعمل على Vercel
export default app;
