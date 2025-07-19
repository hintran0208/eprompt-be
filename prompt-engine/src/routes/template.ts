import { Router, Request, Response } from 'express'

import {
	createPromptTemplate,
	updatePromptTemplate,
	updateEmbeddings,
	getAllPromptTemplates,
	getPromptTemplateById,
	deletePromptTemplate,
} from '../engine/template'

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Prompt Templates
 *   description: Manage prompt templates
 */

/**
 * @swagger
 * /template/all:
 *   get:
 *     summary: Get all public prompt templates
 *     description: Retrieve all available public prompt templates
 *     tags: [Prompt Templates]
 *     responses:
 *       200:
 *         description: Successfully retrieved all templates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PromptTemplate'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// GET /template/all - get all public prompt templates
router.get('/all', async (req: Request, res: Response) => {
	try {
		console.log('Fetching all templates...')
		const templates = await getAllPromptTemplates()
		console.log(`Found ${templates.length} templates`)
		res.json(templates)
	} catch (err) {
		console.error('Error fetching all templates:', err)
		res.status(500).json({ error: 'Failed to fetch templates' })
	}
})

/**
 * @swagger
 * /template/{id}:
 *   get:
 *     summary: Get a prompt template by ID
 *     description: Retrieve a specific prompt template by its unique identifier
 *     tags: [Prompt Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the template
 *         example: "blog-post-template"
 *     responses:
 *       200:
 *         description: Successfully retrieved the template
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PromptTemplate'
 *       404:
 *         description: Template not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Template not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// GET /template/:id - get 1 public prompt template by id
router.get('/:id', async (req: Request, res: Response) => {
	try {
		const template = await getPromptTemplateById(req.params.id)

		if (!template) {
			return res.status(404).json({ error: 'Template not found' })
		}

		res.json(template)
	} catch (err) {
		console.error('Error fetching template by ID:', err)
		res.status(500).json({ error: 'Failed to fetch template' })
	}
})

/**
 * @swagger
 * /template/add:
 *   post:
 *     summary: Add a new prompt template
 *     description: Create and store a new prompt template in the database
 *     tags: [Prompt Templates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePromptTemplate'
 *     responses:
 *       201:
 *         description: Template successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PromptTemplate'
 *       400:
 *         description: Bad request - invalid template data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error - failed to save template
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Failed to add template"
 */
// POST /template/add - add new prompt template
router.post('/add', async (req: Request, res: Response) => {
	try {
		const saved = await createPromptTemplate(req.body)
		res.status(201).json(saved)
	} catch (err) {
		console.error('Error adding template:', err)
		res.status(500).json({ error: 'Failed to add template' })
	}
})

/**
 * @swagger
 * /template/update:
 *   post:
 *     summary: Update an existing prompt template (via POST)
 *     description: Update the details of an existing prompt template by ID
 *     tags: [Prompt Templates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePromptTemplate'
 *     responses:
 *       200:
 *         description: Template successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PromptTemplate'
 *       404:
 *         description: Template not found
 *       500:
 *         description: Internal server error
 */
router.post('/update', async (req: Request, res: Response) => {
	try {
		const updated = await updatePromptTemplate(req.body)
		if (!updated)
			return res.status(404).json({ error: 'Template not found' })
		res.json(updated)
	} catch (err) {
		console.error('Update error:', err)
		res.status(500).json({ error: 'Failed to update template' })
	}
})

/**
 * @swagger
 * /template/update-embedding:
 *   post:
 *     summary: Update missing embeddings for prompt templates - dev only
 *     description: Regenerates and updates missing or outdated vector embeddings for all prompt templates.
 *     tags: [Prompt Templates]
 *     responses:
 *       200:
 *         description: Embeddings successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 total:
 *                   type: number
 *                 updated:
 *                   type: number
 *       500:
 *         description: Failed to update embeddings due to server error
 */
router.post('/update-embedding', async (req: Request, res: Response) => {
	try {
		const result = await updateEmbeddings()
		res.json({ message: 'Updated embeddings', ...result })
	} catch (err) {
		console.error('Error updating embeddings:', err)
		res.status(500).json({ error: 'Failed to update embeddings' })
	}
})

/**
 * @swagger
 * /template/{id}:
 *   delete:
 *     summary: Delete a prompt template by ID
 *     description: Remove a prompt template from the database by its unique identifier
 *     tags: [Prompt Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the template
 *     responses:
 *       200:
 *         description: Successfully deleted the template
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Template not found
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
// DELETE /template/:id - delete a prompt template by id
router.delete('/:id', async (req: Request, res: Response) => {
	try {
		const { id } = req.params
		const deleted = await deletePromptTemplate(id)
		if (!deleted) {
			return res.status(404).json({ error: 'Template not found' })
		}
		res.json(deleted)
	} catch (err) {
		console.error('Error deleting template:', err)
		res.status(500).json({ error: 'Failed to delete template' })
	}
})

export default router
