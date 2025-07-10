import { Router, Request, Response } from "express";
import { generateSearch } from "../engine";
import type { PromptContext, BaseTemplate } from "../engine/types";

const router = Router();

/**
 * @swagger
 * /search:
 *   post:
 *     summary: Semantic search
 *     description: Search from a database using natural language query
 *     tags: [Semantic Search]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *               - options
 *             properties:
 *               query:
 *                 $ref: '#/components/schemas/SemanticSearchTemplate'
 *               options:
 *                 $ref: '#/components/schemas/SemanticSearchOptions'
 *           example:
 *             query:
 *               text: "{{search query}}"
 *             options:
 *               topK: 5
 *     responses:
 *       200:
 *         description: Successfully retrieve search result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                      $ref: '#/components/schemas/SemanticSearchResult'
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
  const { query, options } = req.body;
  if (!query || typeof query !== "object" ) {
    return res.status(400).json({ error: "Missing or invalid query" });
  }

  if (!options || typeof options !== "object" ) {
    return res.status(400).json({ error: "Missing or invalid query" });
  }

  try {
    // Create a proper template object with defaults
    const promptTemplate: BaseTemplate = {
      text: query.text,
      description: query.description || "Semantic search query",
      metadata: query.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const output = await generateSearch(promptTemplate, options as PromptContext);
    res.json(output);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Internal error" });
  }
});

export default router;