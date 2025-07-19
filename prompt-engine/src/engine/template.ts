import PublicPromptTemplateModel from "../models/PromptTemplate";
import { getEmbedding } from "./huggingface";
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

export async function updatePromptTemplate(data: PromptTemplate) {
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

export const updateEmbeddings = async () => {
  const templates = await PublicPromptTemplateModel.find();

  console.log(`Found ${templates.length} templates to update.`);

  if (templates.length === 0) {
    return { updatedCount: 0, updatedIds: [] };
  }

  const updatedTemplates = [];

  for (const template of templates) {
    const inputText = textFieldsForEmbedding(template);
    const embedding = await getEmbedding(inputText);

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
