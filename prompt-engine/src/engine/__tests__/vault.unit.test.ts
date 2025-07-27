import { jest, describe, it, expect } from '@jest/globals';

import { createVaultItem, getVaultItemById, getAllVaultItemsByUserId, updateVaultItem, deleteVaultItem, restoreVersion } from '../vault';
import { getEmbedding } from '../embedding'
import VaultItemModel from '../../models/Vault';
import { VaultItem } from '../types';

jest.mock('../../models/Vault');
jest.mock('../embedding')

const mockedGetEmbedding = (getEmbedding as unknown) as jest.Mock<any>

describe('Vault', () => {
  
  const mockEmbedding: number[] = [0.1, 0.2, 0.3]
  mockedGetEmbedding.mockResolvedValue(mockEmbedding)
  describe('createVaultItem', () => {
    it('should create a new VaultItem', async () => {
      const mockData = {
        userId: 'user123',
        vaultId: 'vault123',
        templateId: 'template456',
        initialPrompt: 'Initial prompt',
      };

      (VaultItemModel.prototype.save as jest.Mock<any>).mockResolvedValue(mockData);

      const result = await createVaultItem(mockData);
      expect(mockedGetEmbedding).toHaveBeenCalledWith(expect.any(String))
      expect(result).toEqual(mockData);
      expect(VaultItemModel.prototype.save).toHaveBeenCalled();
    });
  });

  describe('getVaultItemById', () => {
    it('should return a VaultItem by vaultId', async () => {
      const mockData = { vaultId: 'vault123', userId: 'user123' };
      (VaultItemModel.findOne as jest.Mock<any>).mockResolvedValue(mockData);

      const result = await getVaultItemById('vault123');
      expect(result).toEqual(mockData);
      expect(VaultItemModel.findOne).toHaveBeenCalledWith({ vaultId: 'vault123' });
    });

    it('should return null if VaultItem not found', async () => {
      (VaultItemModel.findOne as jest.Mock<any>).mockResolvedValue(null);

      const result = await getVaultItemById('vault123');
      expect(result).toBeNull();
      expect(VaultItemModel.findOne).toHaveBeenCalledWith({ vaultId: 'vault123' });
    });
  });

  describe('getAllVaultItemsByUserId', () => {
    it('should return all VaultItems for a user', async () => {
      const mockData: VaultItem[] = [{
        vaultId: 'vault123', userId: 'user123',
        templateId: 'test-template',
        initialPrompt: 'Initial prompt',
        refinedPrompt: '',
        generatedContent: '',
        history: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        name: ''
      }];
      (VaultItemModel.find as jest.Mock<any>).mockResolvedValue(mockData);

      const result = await getAllVaultItemsByUserId('user123');
      expect(result).toEqual(mockData);
      expect(VaultItemModel.find).toHaveBeenCalledWith({ userId: 'user123' });
    });
  });

  describe('updateVaultItem', () => {
    it('should update a VaultItem', async () => {
      const mockData = { vaultId: 'vault123', refinedPrompt: 'Updated prompt' };
      (VaultItemModel.findOne as jest.Mock<any>).mockResolvedValue({
        ...mockData,
        save: (jest.fn() as jest.Mock<any>).mockResolvedValue(mockData),
      });

      const result = await updateVaultItem('vault123', { refinedPrompt: 'Updated prompt' });
      expect(mockedGetEmbedding).toHaveBeenCalledWith(expect.any(String))
      expect(result).toEqual({ ...mockData });
      expect(VaultItemModel.findOne).toHaveBeenCalledWith({ vaultId: 'vault123' });
    });

    it('should return null if VaultItem not found', async () => {
      (VaultItemModel.findOne as jest.Mock<any>).mockResolvedValue(null);

      const result = await updateVaultItem('vault123', { refinedPrompt: 'Updated prompt' });
      expect(result).toBeNull();
      expect(VaultItemModel.findOne).toHaveBeenCalledWith({ vaultId: 'vault123' });
    });
  });

  describe('deleteVaultItem', () => {
    it('should delete a VaultItem', async () => {
      const mockData = { vaultId: 'vault123' };
      (VaultItemModel.findOneAndDelete as jest.Mock<any>).mockResolvedValue(mockData);

      const result = await deleteVaultItem('vault123');
      expect(result).toEqual(mockData);
      expect(VaultItemModel.findOneAndDelete).toHaveBeenCalledWith({ vaultId: 'vault123' });
    });

    it('should return null if VaultItem not found', async () => {
      (VaultItemModel.findOneAndDelete as jest.Mock<any>).mockResolvedValue(null);

      const result = await deleteVaultItem('vault123');
      expect(result).toBeNull();
      expect(VaultItemModel.findOneAndDelete).toHaveBeenCalledWith({ vaultId: 'vault123' });
    });
  });
});
