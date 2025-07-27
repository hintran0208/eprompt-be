import express, { Request, Response } from 'express';
import { createVaultItem, getVaultItemById, getAllVaultItemsByUserId, updateVaultItem } from '../engine/vault';

const router = express.Router();

/**
 * @swagger
 * /vault:
 *   post:
 *     summary: Create a new vault item
 *     description: Creates a new vault item with the provided data
 *     tags: [Vault]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user creating the vault item
 *               templateId:
 *                 type: string
 *                 description: The ID of the template associated with the vault item
 *               initialPrompt:
 *                 type: string
 *                 description: The initial prompt for the vault item
 *     responses:
 *       201:
 *         description: Successfully created vault item
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.post('/add', async (req: Request, res: Response) => {
  try {
    const vaultItem = await createVaultItem(req.body);
    res.status(201).json(vaultItem);
  } catch (error : any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /vault/{vaultId}:
 *   get:
 *     summary: Get a vault item by ID
 *     description: Retrieves a vault item by its ID
 *     tags: [Vault]
 *     parameters:
 *       - in: path
 *         name: vaultId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the vault item to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved vault item
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/:vaultId', async (req: Request, res: Response) => {
  try {
    const vaultItem = await getVaultItemById(req.params.vaultId);
    if (vaultItem) {
      res.status(200).json(vaultItem);
    } else {
      res.status(404).json({ message: 'VaultItem not found' });
    }
  } catch (error : any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /vault/{vaultId}:
 *   put:
 *     summary: Update a vault item
 *     description: Updates an existing vault item with the provided data
 *     tags: [Vault]
 *     parameters:
 *       - in: path
 *         name: vaultId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the vault item to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refinedPrompt:
 *                 type: string
 *                 description: The refined prompt for the vault item
 *               generatedContent:
 *                 type: string
 *                 description: The generated content for the vault item
 *     responses:
 *       200:
 *         description: Successfully updated vault item
 */
router.post('/update', async (req: Request, res: Response) => {
  try {
    if (!req.body.vaultId) {
      return res.status(400).json({ message: 'vaultId is required' });
    }
    if (!req.body.refinedPrompt && !req.body.generatedContent) {
      return res.status(400).json({ message: 'At least one of refinedPrompt or generatedContent is required' });
    }
    const { vaultId } = req.body;
    const updatedVaultItem = await updateVaultItem(vaultId, req.body);
    if (updatedVaultItem) {
      res.status(200).json(updatedVaultItem);
    } else {
      res.status(404).json({ message: 'VaultItem not found' });
    }
  } catch (error : any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /vault/user:
 *   post:
 *     summary: Create a vault item for a specific user
 *     description: Creates a new vault item associated with a specific user
 *     tags: [Vault]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user creating the vault item
 *               templateId:
 *                 type: string
 *                 description: The ID of the template associated with the vault item
 *               initialPrompt:
 *                 type: string
 *                 description: The initial prompt for the vault item
 *     responses:
 *       201:
 *         description: Successfully created vault item
 */
router.post('/user', async (req: Request, res: Response) => {
    try {
      const { userId, templateId, initialPrompt } = req.body;
  
      if (!userId || !templateId || !initialPrompt) {
        return res.status(400).json({ message: 'userId, templateId, and initialPrompt are required' });
      }
  
      const vaultItem = await createVaultItem(req.body);
      res.status(201).json(vaultItem);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
});
  
/**
 * @swagger
 * /vault/user/{userId}:
 *   get:
 *     summary: Get all vault items for a specific user
 *     description: Retrieves all vault items associated with a specific user
 *     tags: [Vault]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user whose vault items are being retrieved
 *     responses:
 *       200:
 *         description: Successfully retrieved vault items
 */
router.get('/user/:userId', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
  
      if (!userId) {
        return res.status(400).json({ message: 'userId is required' });
      }
  
      const vaultItems = await getAllVaultItemsByUserId(userId);
      res.status(200).json(vaultItems);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
});

export default router;