import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from 'mongoose';

import registerRoutes from './routes';

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
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eprompt')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

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
    description: "A powerful API for generating and refining prompts using AI",    endpoints: {
      health: "/health",
      generate: "/generate",
      "ai-generate": "/ai-generate",
      refine: "/refine",
      search: "/search",
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
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

registerRoutes(app); // Register all routes

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
  console.log(`Prompt Engine API listening on port ${PORT}`);
});
