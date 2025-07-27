import { Router, Request, Response } from "express";
import { generatePrompt } from "../engine";
import type { PromptTemplate, PromptContext } from "../engine/types";

const router = Router();

/**
 * @swagger
 * /generate:
 *   post:
 *     summary: Generate a prompt
 *     description: Generates a prompt based on a template and context
 *     tags: [Prompt Generation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - template
 *               - context
 *             properties:
 *               template:
 *                 $ref: '#/components/schemas/PromptTemplate'
 *               context:
 *                 $ref: '#/components/schemas/PromptContext'
 *           example:
 *             template:
 *               template: "Generate a {{type}} about {{topic}}"
 *               variables: ["type", "topic"]
 *             context:
 *               type: "blog post"
 *               topic: "artificial intelligence"
 *     responses:
 *       200:
 *         description: Successfully generated prompt
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GeneratedPrompt'
 *       400:
 *         description: Bad request - missing or invalid template/context
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
  const { template, context } = req.body;
  if (!template || typeof template !== "object" || !template.template) {
    return res.status(400).json({ error: "Missing or invalid template" });
  }
  if (!context || typeof context !== "object") {
    return res.status(400).json({ error: "Missing or invalid context" });
  }

  try {
    // Create a proper template object with defaults
    const promptTemplate: PromptTemplate = {
      id: template.id || "default",
      name: template.name || "Default Template",
      description: template.description || "Generated template",
      template: template.template,
      role: template.role || "Assistant",
      tags: template.tags || [],
      requiredFields: template.requiredFields || [],
      optionalFields: template.optionalFields || [],
      metadata: template.metadata || {},
      embedding: template.embedding || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const output = await generatePrompt(promptTemplate, context as PromptContext);
    res.json(output);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Internal error" });
  }
});

export default router;
