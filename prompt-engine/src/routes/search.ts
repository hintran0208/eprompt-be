import { Router, Request, Response } from "express";
import { extractPrefix, semanticSearch } from "../engine/search";

const router = Router();

/**
 * @swagger
 * /search:
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
 *               query:
 *                 type: string
 *                 description: The search query text.
 *             required:
 *               - query
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
    const { query, limit } = req.body;
    if (!query) return res.status(400).json({ error: 'Missing text input' });  
    
    // process query
    const { prefix, text } = extractPrefix(query);
    if (!text) return res.status(400).json({ error: 'Missing text input' });

    const results = await semanticSearch(prefix, text, limit);
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;