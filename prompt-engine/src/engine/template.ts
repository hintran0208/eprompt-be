import PublicPromptTemplateModel from "../models/PromptTemplate";
import { getEmbedding } from "../utils/getEmbedding";
import { PromptTemplate } from "../engine/types";

function textFieldsForEmbedding(template: PromptTemplate) {
    return [
      template.name,
      template.description,
      template.template,
      template.role,
      ...(template.tags || []),
      template.id,
    ].filter(Boolean).join(" ");
}

export async function createPromptTemplate(data: PromptTemplate) {
    const inputText = textFieldsForEmbedding(data);
    const embedding = await getEmbedding(inputText);

    const newTemplate = new PublicPromptTemplateModel({
      ...data,
      embedding,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  
    return await newTemplate.save();
}

export async function updatePromptTemplate(data: Partial<PromptTemplate> & { id: string }) {
    const inputText = textFieldsForEmbedding(data as PromptTemplate);
    const embedding = await getEmbedding(inputText);
  
    const updated = await PublicPromptTemplateModel.findOneAndUpdate(
      { id: data.id },
      {
        ...data,
        embedding,
        updatedAt: new Date(),
      },
      { new: true }
    );
  
    return updated;
}

export const updateMissingEmbeddings = async () => {
    const templates = await PublicPromptTemplateModel.find({
      $or: [
        { embedding: { $exists: false } },
        { embedding: { $size: 0 } }
      ]
    });

    console.log(`Found ${templates.length} templates to update.`);

    if (templates.length === 0) {
      return { updatedCount: 0, updatedIds: [] };
    }

    const updatedTemplates = [];
  
    for (const template of templates) {
      const text = textFieldsForEmbedding(template);
      const embedding = await getEmbedding(text);

      template.embedding = embedding;
      template.updatedAt = new Date();
      await template.save();
  
      updatedTemplates.push(template.id);
    }
  
    return {
      updatedCount: updatedTemplates.length,
      updatedIds: updatedTemplates,
    };
  };