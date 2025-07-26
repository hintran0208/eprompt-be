import request from 'supertest';
import express from 'express';
import { jest, describe, it, expect } from '@jest/globals';
import vaultRoutes from '../../routes/vault';
import { createVaultItem, getVaultItemById, getAllVaultItemsByUserId, updateVaultItem } from '../../engine/vault';

jest.mock('../../engine/vault');

const app = express();
app.use(express.json());
app.use('/vault', vaultRoutes);

describe('Vault Routes', () => {
  describe('POST /vault/add', () => {
    it('should create a new VaultItem', async () => {
      const mockData = {
        userId: 'user123',
        templateId: 'template456',
        initialPrompt: 'Initial prompt',
      };

      (createVaultItem as jest.Mock<any>).mockResolvedValue({
        ...mockData,
        vaultId: 'vault123',
      });

      const response = await request(app).post('/vault/add').send(mockData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        userId: 'user123',
        templateId: 'template456',
        initialPrompt: 'Initial prompt',
        vaultId: 'vault123',
      });
      expect(createVaultItem).toHaveBeenCalledWith(mockData);
    });

    it('should return 500 if there is an error', async () => {
      (createVaultItem as jest.Mock<any>).mockRejectedValue(new Error('Internal Server Error'));

      const response = await request(app).post('/vault/add').send({
        userId: 'user123',
        templateId: 'template456',
        initialPrompt: 'Initial prompt',
      });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal Server Error' });
    });
  });

  describe('GET /vault/:vaultId', () => {
    it('should return a VaultItem by ID', async () => {
      const mockData = { vaultId: 'vault123', userId: 'user123' };

      (getVaultItemById as jest.Mock<any>).mockResolvedValue(mockData);

      const response = await request(app).get('/vault/vault123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
      expect(getVaultItemById).toHaveBeenCalledWith('vault123');
    });

    it('should return 404 if VaultItem not found', async () => {
      (getVaultItemById as jest.Mock<any>).mockResolvedValue(null);

      const response = await request(app).get('/vault/vault123');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'VaultItem not found' });
    });
  });

  describe('POST /vault/update', () => {
    it('should update a VaultItem', async () => {
      const mockData = { vaultId: 'vault123', refinedPrompt: 'Updated prompt' };

      (updateVaultItem as jest.Mock<any>).mockResolvedValue(mockData);

      const response = await request(app).post('/vault/update').send({
        vaultId: 'vault123',
        refinedPrompt: 'Updated prompt',
      });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
      expect(updateVaultItem).toHaveBeenCalledWith('vault123', {
        vaultId: 'vault123',
        refinedPrompt: 'Updated prompt',
      });
    });

    it('should return 400 if vaultId is missing', async () => {
      const response = await request(app).post('/vault/update').send({
        refinedPrompt: 'Updated prompt',
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'vaultId is required' });
    });

    it('should return 404 if VaultItem not found', async () => {
      (updateVaultItem as jest.Mock<any>).mockResolvedValue(null);

      const response = await request(app).post('/vault/update').send({
        vaultId: 'vault123',
        refinedPrompt: 'Updated prompt',
      });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'VaultItem not found' });
    });
  });

  describe('GET /vault/user/:userId', () => {
    it('should return all VaultItems for a user', async () => {
      const mockData = [{ vaultId: 'vault123', userId: 'user123' }];

      (getAllVaultItemsByUserId as jest.Mock<any>).mockResolvedValue(mockData);

      const response = await request(app).get('/vault/user/user123');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
      expect(getAllVaultItemsByUserId).toHaveBeenCalledWith('user123');
    });

    it('should return 400 if userId is missing', async () => {
      const response = await request(app).get('/vault/user/');

      expect(response.status).toBe(404);
    });
  });
});