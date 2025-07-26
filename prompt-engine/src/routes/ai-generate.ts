import { Router, Request, Response } from "express";
import { createOpenAIClient, DEFAULT_OPENAI_CONFIG } from "../engine/openai";
import type { ModelConfig } from "../engine/types";
import { updateVaultItem } from "../engine/vault";

const router = Router();

/**
 * @swagger
 * /ai-generate:
 *   post:
 *     summary: Generate AI results from text
 *     description: Generates AI results from text content using OpenAI API
 *     tags: [AI Generation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: The text content to send to OpenAI API
 *                 example: "Write a brief introduction about artificial intelligence."
 *               modelConfig:
 *                 type: object
 *                 description: Configuration for the AI model
 *                 properties:
 *                   provider:
 *                     type: string
 *                     example: "openai"
 *                   model:
 *                     type: string
 *                     example: "GPT-4o"
 *                   temperature:
 *                     type: number
 *                     example: 0.7
 *                   maxTokens:
 *                     type: number
 *                     example: 2000
 *                   customApiHost:
 *                     type: string
 *                     example: "https://api.openai.com/v1"
 *                   customApiKey:
 *                     type: string
 *                     example: "Bearer sk-..."
 *               systemPrompt:
 *                 type: string
 *                 description: Optional system prompt to provide context
 *                 example: "You are a helpful AI assistant that provides clear and informative responses."
 *     responses:
 *       200:
 *         description: Successfully generated AI response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 text:
 *                   type: string
 *                   description: The original input text
 *                 result:
 *                   type: string
 *                   description: The AI-generated response
 *                 tokensUsed:
 *                   type: number
 *                   description: Number of tokens used in the API call
 *                 latencyMs:
 *                   type: number
 *                   description: Processing time in milliseconds
 *                 modelConfig:
 *                   type: object
 *                   description: The model configuration used
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: Timestamp of the generation
 *               example:
 *                 text: "Write a brief introduction about artificial intelligence."
 *                 result: "Artificial Intelligence (AI) is a branch of computer science that focuses on creating systems capable of performing tasks that typically require human intelligence..."
 *                 tokensUsed: 156
 *                 latencyMs: 1250
 *                 modelConfig:
 *                   provider: "openai"
 *                   model: "GPT-4o"
 *                   temperature: 0.7
 *                   maxTokens: 2000
 *                 timestamp: "2025-07-12T10:30:00.000Z"
 *       400:
 *         description: Bad request - missing or invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", async (req: Request, res: Response) => {
  const { text, vaultId, modelConfig, systemPrompt } = req.body;

  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Missing or invalid text - must be a non-empty string" });
  }
  if (modelConfig && (typeof modelConfig !== "object" || Array.isArray(modelConfig) || modelConfig === null)) {
    return res.status(400).json({ error: "Invalid modelConfig - must be an object" });
  }

  if (systemPrompt && typeof systemPrompt !== "string") {
    return res.status(400).json({ error: "Invalid systemPrompt - must be a string" });
  }

  const startTime = Date.now();

  try {
    // Use provided model config or default to OpenAI
    const config: ModelConfig = {
      provider: 'openai',
      model: DEFAULT_OPENAI_CONFIG.model,
      temperature: DEFAULT_OPENAI_CONFIG.temperature,
      maxTokens: DEFAULT_OPENAI_CONFIG.maxTokens,
      customApiHost: DEFAULT_OPENAI_CONFIG.apiHost,
      customApiKey: DEFAULT_OPENAI_CONFIG.apiKey,
      ...modelConfig
    };

    if (config.provider !== 'openai') {
      return res.status(400).json({ error: "Only OpenAI provider is currently supported" });
    }

    // Create OpenAI client with configuration
    const openaiClient = createOpenAIClient({
      apiHost: config.customApiHost || DEFAULT_OPENAI_CONFIG.apiHost,
      apiKey: config.customApiKey || DEFAULT_OPENAI_CONFIG.apiKey,
      model: config.model || DEFAULT_OPENAI_CONFIG.model,
      temperature: config.temperature,
      maxTokens: config.maxTokens
    });    // Generate completion
    const completion = await openaiClient.generateCompletion(text.trim(), {
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      systemPrompt: systemPrompt === '' ? '' : (systemPrompt || undefined)
    });

    const latencyMs = Date.now() - startTime;

    if (vaultId) {
      await updateVaultItem(vaultId, {
        generatedContent: completion.content,
      });
    }

    res.json({
      text: text.trim(),
      result: completion.content,
      tokensUsed: completion.tokensUsed,
      latencyMs,
      modelConfig: config,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    const latencyMs = Date.now() - startTime;
    
    if (err instanceof Error) {
      if (err.message.includes("OpenAI API error")) {
        return res.status(500).json({ 
          error: "OpenAI API error", 
          details: err.message,
          latencyMs,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    res.status(500).json({ 
      error: err instanceof Error ? err.message : "Internal error",
      latencyMs,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
