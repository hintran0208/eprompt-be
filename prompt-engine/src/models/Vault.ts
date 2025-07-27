import mongoose from 'mongoose';

import { VaultItem } from '../engine/types';

const vaultItemSchema = new mongoose.Schema<VaultItem>({
    userId: { type: String, required: true, default: 'admin' },
    vaultId: { type: String }, // will be auto-generated
    templateId: { type: String, required: true },
    name: { type: String },
    initialPrompt: { type: String, required: true },
    refinedPrompt: { type: String },
    generatedContent: { type: String },
    history: [
        {
          refinedPrompt: { type: String },
          generatedContent: { type: String },
          action: { type: String, enum: ['Refine Prompt', 'Generate Content'], required: true },
          version: { type: Number, required: true },
          updatedAt: { type: Date, default: Date.now },
        },
    ],
    nameEmbedding: { type: [Number], default: [] }, // TODO: for vault: searching
    initialPromptEmbedding: { type: [Number], default: [] }, // for initial: searching
    refinedPromptEmbedding: { type: [Number], default: [] }, // for refined: searching
    generatedContentEmbedding: { type: [Number], default: [] }, // for content: searching
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },

});

vaultItemSchema.pre('save', async function (next) {
    if (this.isNew && !this.vaultId) {
      const count = await mongoose.model('VaultItem').countDocuments({ userId: this.userId });
      this.vaultId = `${this.userId}-${count + 1}`; // Auto-create `vaultId` with format `{userId}-{generated number}`
    }

    if (!this.isNew) {
        const latestVersion = this.history.length > 0 ? this.history[this.history.length - 1].version : 0;
    
        if (this.isModified('refinedPrompt') || this.isModified('generatedContent')) {
          this.history.push({
              refinedPrompt: this.refinedPrompt,
              generatedContent: this.generatedContent,
              action: this.isModified('refinedPrompt') ? 'Refine Prompt' : 'Generate Content',
              version: latestVersion + 1,
              updatedAt: new Date(),
          });
    
          // Limit history to last 20 versions
          if (this.history.length > 20) {
            this.history.shift();
          }
        }
      }
    next();
});

const VaultItemModel = mongoose.model<VaultItem>('VaultItem', vaultItemSchema, 'vault_items');

export default VaultItemModel;
