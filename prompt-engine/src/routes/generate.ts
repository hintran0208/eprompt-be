import { Router, Request, Response } from 'express';
import { generatePrompt } from '../engine';
import type { PromptTemplate, PromptContext } from '../engine/types';

const router = Router();

router.post('/', (req: Request, res: Response) => {
  const { template, context } = req.body;
  if (!template || typeof template !== 'object' || !template.template) {
    return res.status(400).json({ error: 'Missing or invalid template' });
  }
  if (!context || typeof context !== 'object') {
    return res.status(400).json({ error: 'Missing or invalid context' });
  }
  try {
    const output = generatePrompt(template as PromptTemplate, context as PromptContext);
    res.json(output);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Internal error' });
  }
});

export default router;
