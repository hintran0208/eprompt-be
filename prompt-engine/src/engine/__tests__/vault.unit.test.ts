import { jest, describe, it, expect } from '@jest/globals';

import { createVaultItem, getVaultItemById, getAllVaultItemsByUserId, updateVaultItem, deleteVaultItem, restoreVersion } from '../vault';
import { VaultItemModel } from '../../models/Vault';
import { VaultItem } from '../types';

jest.mock('../../models/Vault');

describe('Vault', () => {
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
          updatedAt: new Date()
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

  describe('restoreVersion', () => {
    it('should restore a specific version of VaultItem', async () => {
      const mockData = {
        vaultId: 'vault123',
        history: [
          { version: 1, refinedPrompt: 'Old prompt', generatedContent: 'Old content' },
          { version: 2, refinedPrompt: 'New prompt', generatedContent: 'New content' },
        ],
        save: (jest.fn() as jest.Mock<any>).mockResolvedValue({
            vaultId: 'vault123',
            refinedPrompt: 'Old prompt', 
            generatedContent: 'Old content',
            history: [
              { version: 1, refinedPrompt: 'Old prompt', generatedContent: 'Old content' },
              { version: 2, refinedPrompt: 'New prompt', generatedContent: 'New content' },
            ],
            save: (jest.fn() as jest.Mock<any>).mockResolvedValue(true),
          }),
      };

      (VaultItemModel.findOne as jest.Mock<any>).mockResolvedValue(mockData);

      const result = await restoreVersion('vault123', 1);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.refinedPrompt).toEqual('Old prompt');
        expect(result.generatedContent).toEqual('Old content');
      }
      expect(VaultItemModel.findOne).toHaveBeenCalledWith({ vaultId: 'vault123' });
    });

    it('should return null if version not found', async () => {
      const mockData = {
        vaultId: 'vault123',
        history: [{ version: 1, refinedPrompt: 'Old prompt', generatedContent: 'Old content' }],
      };

      (VaultItemModel.findOne as jest.Mock<any>).mockResolvedValue(mockData);

      const result = await restoreVersion('vault123', 2);
      expect(result).toBeNull();
      expect(VaultItemModel.findOne).toHaveBeenCalledWith({ vaultId: 'vault123' });
    });
  });
});