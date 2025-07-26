import { Router, Request, Response } from "express";
import { 
  refinePrompt, 
  refineContent,
  getPromptRefinementTypes, 
  getContentRefinementTypes,
  promptRefinerTools,
  contentRefinerTools
} from "../engine";
import type { ModelConfig } from "../engine/types";

const router = Router();

/**
 * @swagger
 * /refine/types:
 *   get:
 *     summary: Get all available refinement types
 *     description: Returns all available refinement types and tools for both prompts and content
 *     tags: [Refinement]
 *     responses:
 *       200:
 *         description: List of available refinement types and tools
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 prompt:
 *                   type: object
 *                   properties:
 *                     types:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Available prompt refinement types
 *                     tools:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           icon:
 *                             type: string
 *                           description:
 *                             type: string
 *                           color:
 *                             type: string
 *                 content:
 *                   type: object
 *                   properties:
 *                     types:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Available content refinement types
 *                     tools:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           icon:
 *                             type: string
 *                           description:
 *                             type: string
 *                           color:
 *                             type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// GET /refine/types - Get all available refinement types
router.get("/types", (req: Request, res: Response) => {
  try {
    const promptTypes = getPromptRefinementTypes();
    const contentTypes = getContentRefinementTypes();
    
    const promptTools = promptRefinerTools.map((tool) => ({
      id: tool.id,
      name: tool.name,
      icon: tool.icon,
      description: tool.description,
      color: tool.color,
    }));
    
    const contentTools = contentRefinerTools.map((tool) => ({
      id: tool.id,
      name: tool.name,
      icon: tool.icon,
      description: tool.description,
      color: tool.color,
    }));
    
    res.json({ 
      prompt: { types: promptTypes, tools: promptTools },
      content: { types: contentTypes, tools: contentTools }
    });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Internal error" });
  }
});

/**
 * @swagger
 * /refine/prompt:
 *   post:
 *     summary: Refine a prompt using AI
 *     description: Refines an existing prompt using AI with specified refinement type
 *     tags: [Prompt Refinement]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: The prompt to refine
 *                 example: "Write a story"
 *               refinementType:
 *                 type: string
 *                 description: Type of refinement to apply
 *                 default: "specific"
 *                 example: "specific"
 *               modelConfig:
 *                 type: object
 *                 description: Configuration for the AI model
 *                 properties:
 *                   model:
 *                     type: string
 *                     example: "gpt-4"
 *                   temperature:
 *                     type: number
 *                     example: 0.7
 *                   maxTokens:
 *                     type: number
 *                     example: 1000
 *     responses:
 *       200:
 *         description: Successfully refined prompt
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 refinedPrompt:
 *                   type: string
 *                   description: The refined prompt
 *                 originalPrompt:
 *                   type: string
 *                   description: The original prompt
 *                 refinementTool:
 *                   type: object
 *                   description: Information about the refinement tool used
 *                 tokensUsed:
 *                   type: number
 *                   description: Number of AI tokens used
 *                 latencyMs:
 *                   type: number
 *                   description: Processing time in milliseconds
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
// POST /refine/prompt - Refine a prompt using AI
router.post("/prompt", async (req: Request, res: Response) => {
  const { prompt, refinementType = "specific", vaultId, modelConfig } = req.body;

  if (typeof prompt !== "string") {
    return res.status(400).json({ error: "Missing or invalid prompt" });
  }

  if (typeof refinementType !== "string") {
    return res.status(400).json({ error: "Invalid refinementType - must be a string" });
  }

  if (modelConfig && typeof modelConfig !== "object") {
    return res.status(400).json({ error: "Invalid modelConfig - must be an object" });
  }

  try {
    const result = await refinePrompt(prompt, refinementType, vaultId, modelConfig as ModelConfig);
    res.json(result);
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unknown prompt refinement type")) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err instanceof Error ? err.message : "Internal error" });
  }
});

/**
 * @swagger
 * /refine/content:
 *   post:
 *     summary: Refine custom content using AI
 *     description: Refines existing content using AI with specified refinement type
 *     tags: [Content Refinement]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: The content to refine
 *                 example: "This is some content that needs improvement"
 *               refinementType:
 *                 type: string
 *                 description: Type of refinement to apply
 *                 default: "clarity"
 *                 example: "clarity"
 *               modelConfig:
 *                 type: object
 *                 description: Configuration for the AI model
 *                 properties:
 *                   model:
 *                     type: string
 *                     example: "gpt-4"
 *                   temperature:
 *                     type: number
 *                     example: 0.7
 *                   maxTokens:
 *                     type: number
 *                     example: 1000
 *     responses:
 *       200:
 *         description: Successfully refined content
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 refinedContent:
 *                   type: string
 *                   description: The refined content
 *                 originalContent:
 *                   type: string
 *                   description: The original content
 *                 refinementTool:
 *                   type: object
 *                   description: Information about the refinement tool used
 *                 tokensUsed:
 *                   type: number
 *                   description: Number of AI tokens used
 *                 latencyMs:
 *                   type: number
 *                   description: Processing time in milliseconds
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
// POST /refine/content - Refine content using AI
router.post("/content", async (req: Request, res: Response) => {
  const { content, refinementType = "clarity", vaultId, modelConfig } = req.body;

  if (typeof content !== "string") {
    return res.status(400).json({ error: "Missing or invalid content" });
  }

  if (typeof refinementType !== "string") {
    return res.status(400).json({ error: "Invalid refinementType - must be a string" });
  }

  if (modelConfig && typeof modelConfig !== "object") {
    return res.status(400).json({ error: "Invalid modelConfig - must be an object" });
  }

  try {
    const result = await refineContent(content, refinementType, vaultId,  modelConfig as ModelConfig);
    res.json(result);
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unknown content refinement type")) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err instanceof Error ? err.message : "Internal error" });
  }
});

export default router;
