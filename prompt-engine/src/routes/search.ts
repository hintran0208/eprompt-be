import { Router, Request, Response } from "express";
import { semanticSearch } from "../engine/search";
import type { PromptContext, BaseTemplate } from "../engine/types";

const router = Router();

/**
 * @swagger
 * /search/semantic:
 *   post:
 *     summary: Perform semantic search
 *     description: Search for prompt templates using semantic similarity.
 *     tags: [Semantic Search]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: The search query text.
 *             required:
 *               - text
 *     responses:
 *       200:
 *         description: Search results successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PromptTemplate'
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { query, limit, userId } = req.body;
    if (!query) return res.status(400).json({ error: 'Missing text input' });

    const results = await semanticSearch(query, limit, userId);
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;