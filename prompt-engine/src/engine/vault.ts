import VaultItemModel from '../models/Vault';
import { VaultItem } from './types';
import { getEmbedding } from './embedding';

async function createVaultItem(vaultItemData: Partial<VaultItem>) {
    try {
      const embeddingPromises = [];
      
      if (vaultItemData.name && !vaultItemData.nameEmbedding) {
        embeddingPromises.push(getEmbedding(vaultItemData.name).then(embedding => vaultItemData.nameEmbedding = embedding));
      }
      if (vaultItemData.initialPrompt && !vaultItemData.initialPromptEmbedding) {
        embeddingPromises.push(getEmbedding(vaultItemData.initialPrompt).then(embedding => vaultItemData.initialPromptEmbedding = embedding));
      }
      if (vaultItemData.refinedPrompt && !vaultItemData.refinedPromptEmbedding) {
        embeddingPromises.push(getEmbedding(vaultItemData.refinedPrompt).then(embedding => vaultItemData.refinedPromptEmbedding = embedding));
      }
      if (vaultItemData.generatedContent && !vaultItemData.generatedContentEmbedding) {
        embeddingPromises.push(getEmbedding(vaultItemData.generatedContent).then(embedding => vaultItemData.generatedContentEmbedding = embedding));
      }
      await Promise.all(embeddingPromises);

      const vaultItem = new VaultItemModel(vaultItemData);
      console.log('VaultItem created:', vaultItem);
      return await vaultItem.save();
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
      const vaultItems = await VaultItemModel.find({ userId }).sort({ updatedAt: -1 });
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
      const embeddingPromises = [];
      
      if (updates.name) {
        embeddingPromises.push(getEmbedding(updates.name).then(embedding => updates.nameEmbedding = embedding));
      }
      if (updates.initialPrompt) {
        embeddingPromises.push(getEmbedding(updates.initialPrompt).then(embedding => updates.initialPromptEmbedding = embedding));
      }
      if (updates.refinedPrompt) {
        embeddingPromises.push(getEmbedding(updates.refinedPrompt).then(embedding => updates.refinedPromptEmbedding = embedding));
      }
      if (updates.generatedContent) {
        embeddingPromises.push(getEmbedding(updates.generatedContent).then(embedding => updates.generatedContentEmbedding = embedding));
      }
      await Promise.all(embeddingPromises);
  
      Object.assign(vaultItem, updates);
      vaultItem.updatedAt = new Date();

      return await vaultItem.save();
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

// PLACEHOLDER
// TODO: Implement versioning for VaultItem
async function restoreVersion(vaultId: string, version: number) {

}

export {
    createVaultItem,
    getVaultItemById,
    getAllVaultItemsByUserId,
    updateVaultItem,
    deleteVaultItem,
    restoreVersion
}