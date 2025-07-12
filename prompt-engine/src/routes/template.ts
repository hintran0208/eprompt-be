import { Router, Request, Response } from "express";

import PublicPromptTemplateModel from "../model/PromptTemplate";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Prompt Templates
 *   description: Manage prompt templates
 */

// GET /template/all - gett all public prompt templates
router.get('/all', async (req: Request, res: Response) => {
    const templates = await PublicPromptTemplateModel.find();
    res.json(templates);
  });

// GET /template/:id - get 1 public prompt template by id
router.get('/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const template = await PublicPromptTemplateModel.findOne({ id });
  
      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }
  
      res.json(template);
    } catch (err) {
      console.error('Error fetching template by ID:', err);
      res.status(500).json({ error: 'Failed to fetch template' });
    }
  });


// POST /template/add - add new prompt template 
router.post('/add', async (req: Request, res: Response) => {
    try {
        const template = new PublicPromptTemplateModel(req.body);
        const saved = await template.save();
        res.status(201).json(saved);
    } catch (err) {
        console.error('Error adding template:', err);
        res.status(500).json({ error: 'Failed to add template' });
    }
});

export default router;
