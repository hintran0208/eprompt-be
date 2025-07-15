import express from "express";
import cors, { CorsOptions } from "cors";
import dotenv from "dotenv";
import generateRoute from "./routes/generate";
import refineRoute from "./routes/refine";
import searchRoute from "./routes/search";
import aiGenerateRoute from "./routes/ai-generate";
import { specs, swaggerUi } from "./config/swagger";

dotenv.config();

const app = express();

// const allowedOrigins = [
//   "https://api.eprompt.me",
//   "https://eprompt.me",
//   "https://eprompt-be-4e52843fa931.herokuapp.com",
//   "https://www.api.eprompt.me",
//   "https://www.eprompt.me",
// ];

// CORS configuration
const corsOptions: CorsOptions = {
  // origin:
  //   process.env.NODE_ENV === "production"
  //     ? (origin, callback) => {
  //         // Allow requests with no origin (mobile apps, curl, etc.)
  //         if (!origin) return callback(null, true);

  //         // Allow production domains
  //         if (allowedOrigins.includes(origin)) return callback(null, true);

  //         // Allow all Vercel preview URLs
  //         if (/^https:\/\/eprompt-.*-hintran0208s-projects\.vercel\.app$/.test(origin)) {
  //           return callback(null, true);
  //         }

  //         // Allow Heroku app URLs
  //         if (/^https:\/\/eprompt-be-.*\.herokuapp\.com$/.test(origin)) {
  //           return callback(null, true);
  //         }

  //         // Otherwise, block
  //         console.log(`CORS blocked origin: ${origin}`);
  //         return callback(new Error("Not allowed by CORS"));
  //       }
  //     : true, // Allow all origins in development
  origin: true, // Allow all origins in development
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  credentials: true,
};

app.use(cors(corsOptions));
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

app.use("/generate", generateRoute);
app.use("/ai-generate", aiGenerateRoute);
app.use("/refine", refineRoute);
app.use("/search", searchRoute);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
  console.log(`Prompt Engine API listening on port ${PORT}`);
});
