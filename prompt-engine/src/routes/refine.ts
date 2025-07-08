import { Router, Request, Response } from 'express';
import { refinePrompt, getRefinementTypes, refinerTools } from '../engine';
import type { ModelConfig } from '../engine/types';

const router = Router();

// GET /refine/types - Get available refinement types
router.get('/types', (req: Request, res: Response) => {
  try {
    const types = getRefinementTypes();
    const tools = refinerTools.map(tool => ({
      id: tool.id,
      name: tool.name,
      icon: tool.icon,
      description: tool.description,
      color: tool.color
    }));
    res.json({ types, tools });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Internal error' });
  }
});

// POST /refine - Refine a prompt using AI
router.post('/', async (req: Request, res: Response) => {
  const { prompt, refinementType = 'specific', modelConfig } = req.body;
  
  if (typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid prompt' });
  }
  
  if (typeof refinementType !== 'string') {
    return res.status(400).json({ error: 'Invalid refinementType - must be a string' });
  }

  if (modelConfig && typeof modelConfig !== 'object') {
    return res.status(400).json({ error: 'Invalid modelConfig - must be an object' });
  }

  try {
    const result = await refinePrompt(prompt, refinementType, modelConfig as ModelConfig);
    res.json(result);
  } catch (err) {
    if (err instanceof Error && err.message.includes('Unknown refinement type')) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err instanceof Error ? err.message : 'Internal error' });
  }
});

export default router;
