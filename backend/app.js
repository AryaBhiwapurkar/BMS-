import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/authRoutes.js";
import movieRoutes from "./src/routes/movieRoutes.js";
import screenRoutes from "./src/routes/screenRoutes.js";
import seatRoutes from "./src/routes/seatRoutes.js";
import seatLockRoutes from "./src/routes/seatLockRoutes.js";
import showRoutes from "./src/routes/showRoutes.js";
import bookingRoutes from "./src/routes/bookingRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import { pool } from "./src/config/database.js";
import redis from "./src/config/redis.js";
import dotenv from "dotenv";
import theatreRoutes from "./src/routes/theatreRoutes.js";
import logger from "./src/middleware/logger.js";
import { startWorkers } from "./src/utils/startWorkers.js";

dotenv.config();
const app = express();

// Initialize services
(async () => {
  try {
    // Wait for database connection
    await pool.query("SELECT 1");
    console.log("DB connected");
  } catch (err) {
    console.error("DB connection error:", err);
  }

  try {
    // Wait for Redis connection
    await redis.ping();
    console.log("Redis connected");
  } catch (err) {
    console.error("Redis connection error:", err);
  }

  // Start workers
  try {
    await startWorkers();
  } catch (err) {
    console.error("Error starting workers:", err);
  }
})();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(logger);

// Health check route
app.get("/", (req, res) => {
  res.send("API Running...");
});

// Routes (MUST be before error handler)
app.use('/api/v1/auth', authRoutes);
app.use("/api/v1/movies", movieRoutes);
app.use("/api/v1/theatres", theatreRoutes);
app.use("/api/v1/screens", screenRoutes);
app.use("/api/v1/seats", seatRoutes);
app.use("/api/v1/seats", seatLockRoutes);
app.use("/api/v1/shows", showRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/payments", paymentRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  
  console.error(`[ERROR] ${statusCode} - ${message}`, err);
  
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Internal server error" : message,
    ...(process.env.NODE_ENV === "development" && { error: err.message })
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});