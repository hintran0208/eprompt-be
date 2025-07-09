import express from "express";
import dotenv from "dotenv";
import generateRoute from "./routes/generate";
import refineRoute from "./routes/refine";
import { specs, swaggerUi } from "./config/swagger";

dotenv.config();

const app = express();
app.use(express.json());

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
      refine: "/refine",
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

app.use("/generate", generateRoute);
app.use("/refine", refineRoute);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
  console.log(`Prompt Engine API listening on port ${PORT}`);
});
