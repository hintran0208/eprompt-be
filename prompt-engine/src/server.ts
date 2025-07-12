import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import registerRoutes from "./routes";

import { specs, swaggerUi } from "./config/swagger";

dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? ["https://api.eprompt.me", "https://eprompt.me"] // Add production domains
      : true, // Allow all origins in development
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// MongoDB connection
const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/eprompt";

mongoose
  .connect(mongoUri, {
    // Connection options for better reliability
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  })
  .then(() => {
    console.log("Connected to MongoDB");
    console.log(`Database: ${mongoUri.replace(/\/\/.*@/, "//***:***@")}`); // Hide credentials in logs
  })
  .catch((err: Error) => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit the process if database connection fails
  });

// Handle MongoDB connection events
mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
    process.exit(0);
  } catch (err: unknown) {
    console.error("Error during graceful shutdown:", err);
    process.exit(1);
  }
});

// Swagger Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "ePrompt API Documentation",
  })
);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome endpoint
 *     description: Returns welcome message and API information
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Welcome message with API information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WelcomeResponse'
 */
// Welcome endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to ePrompt API - Prompt Generation & Refinement Engine",
    version: "1.0.0",
    description: "A powerful API for generating and refining prompts using AI",
    endpoints: {
      health: "/health",
      generate: "/generate",
      "ai-generate": "/ai-generate",
      refine: "/refine",
      search: "/search",
      template: "/template",
      docs: "/api-docs",
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API
 *     tags: [General]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    // Check MongoDB connection
    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";

    // Basic health response
    const healthData: {
      status: string;
      timestamp: string;
      database: {
        status: string;
        name: string;
        ping?: string;
      };
    } = {
      status: "OK",
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        name: mongoose.connection.name || "unknown",
      },
    };

    // If database is connected, add more details
    if (dbStatus === "connected") {
      try {
        // Quick ping to verify database is responsive
        const db = mongoose.connection.db;
        if (db) {
          await db.admin().ping();
          healthData.database.ping = "success";
        } else {
          healthData.database.ping = "failed";
          healthData.status = "DEGRADED";
        }
      } catch (pingError) {
        healthData.database.ping = "failed";
        healthData.status = "DEGRADED";
      }
    } else {
      healthData.status = "DEGRADED";
    }

    const statusCode = healthData.status === "OK" ? 200 : 503;
    res.status(statusCode).json(healthData);
  } catch (error) {
    res.status(503).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

registerRoutes(app); // Register all routes

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
  console.log(`Prompt Engine API listening on port ${PORT}`);
});
