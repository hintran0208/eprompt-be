import { VaultItemModel } from '../models/Vault';
import { VaultItem } from './types';

async function createVaultItem(vaultItemData: Partial<VaultItem>) {
    try {
      const vaultItem = new VaultItemModel(vaultItemData);
      await vaultItem.save();
      console.log('VaultItem created:', vaultItem);
      return vaultItem;
    } catch (error) {
      console.error('Error creating VaultItem:', error);
      throw error;
    }
  }

async function getVaultItemById(vaultId: string) {
    try {
      const vaultItem = await VaultItemModel.findOne({ vaultId });
      if (vaultItem) {
        console.log('VaultItem found:', vaultItem);
        return vaultItem;
      } else {
        console.log('VaultItem not found');
        return null;
      }
    } catch (error) {
      console.error('Error fetching VaultItem:', error);
      throw error;
    }
}

async function getAllVaultItemsByUserId(userId: string = 'admin') {
    try {
      const vaultItems = await VaultItemModel.find({ userId });
      console.log('All VaultItems:', vaultItems);
      return vaultItems;
    } catch (error) {
      console.error('Error fetching VaultItems:', error);
      throw error;
    }
}

async function updateVaultItem(vaultId: string, updates: Partial<VaultItem>) {
    try {
      const vaultItem = await VaultItemModel.findOne({ vaultId });
  
      if (!vaultItem) {
        console.log('VaultItem not found');
        return null;
      }
  
      Object.assign(vaultItem, updates);
      vaultItem.updatedAt = new Date();
  
      await vaultItem.save(); 
      console.log('VaultItem updated:', vaultItem);

      return vaultItem;
    } catch (error) {
      console.error('Error updating VaultItem:', error);
      throw error;
    }
  }

async function deleteVaultItem(vaultId: string) {
    try {
      const deletedItem = await VaultItemModel.findOneAndDelete({ vaultId });
      if (deletedItem) {
        console.log('VaultItem deleted:', deletedItem);
        return deletedItem;
      } else {
        console.log('VaultItem not found');
        return null;
      }
    } catch (error) {
      console.error('Error deleting VaultItem:', error);
      throw error;
    }
}

async function restoreVersion(vaultId: string, version: number) {
    try {
      const vaultItem = await VaultItemModel.findOne({ vaultId });
      if (vaultItem) {
        const targetVersion = vaultItem.history.find((entry) => entry.version === version);
        if (targetVersion) {
          vaultItem.refinedPrompt = targetVersion.refinedPrompt;
          vaultItem.generatedContent = targetVersion.generatedContent;
          await vaultItem.save();
          console.log(`Restored VaultItem to version ${version}:`, vaultItem);
          return vaultItem;
        } else {
          console.log(`Version ${version} not found for VaultItem`);
          return null;
        }
      } else {
        console.log('VaultItem not found');
        return null;
      }
    } catch (error) {
      console.error('Error restoring VaultItem version:', error);
      throw error;
    }
}

export {
    createVaultItem,
    getVaultItemById,
    getAllVaultItemsByUserId,
    updateVaultItem,
    deleteVaultItem,
    restoreVersion
}