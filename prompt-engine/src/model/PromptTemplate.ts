import mongoose from 'mongoose';

import { PromptTemplate } from '../engine/types';

export const promptTemplateSchema = new mongoose.Schema<PromptTemplate>({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    template: { type: String, required: true },
    role: { type: String, required: true },
    useCase: { type: String, required: true },
    requiredFields: { type: [String], required: true },
    optionalFields: { type: [String], default: [] },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const PublicPromptTemplateModel = mongoose.model<PromptTemplate>('PromptTemplate', promptTemplateSchema, 'public_prompt_templates');

export default PublicPromptTemplateModel;
