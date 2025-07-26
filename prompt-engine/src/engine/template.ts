import PublicPromptTemplateModel from "../models/PromptTemplate";
import { getEmbedding } from "./embedding";
import { PromptTemplate } from "../engine/types";

function textFieldsForEmbedding(template: PromptTemplate) {
    return [
      `name: ${template.name}`,
      `description: ${template.description}`,
      `template: ${template.template}`,
      `role: ${template.role}`,
      ...(template.tags || []).map(tag => `tag: ${tag}`),
      `id: ${template.id}`,
    ].filter(Boolean).join("\n");
}

async function createPromptTemplate(data: PromptTemplate) {
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

async function updatePromptTemplate(data: PromptTemplate) {
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

async function updateEmbeddings () {
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
    total: templates.length,
    updated: updatedTemplates.length,
    updatedIds: updatedTemplates,
  };
};

async function getAllPromptTemplates() {
  return await PublicPromptTemplateModel.find();
}

async function getPromptTemplateById(id: string) {
  return await PublicPromptTemplateModel.findOne({ id });
}

async function deletePromptTemplate(id: string) {
  const deleted = await PublicPromptTemplateModel.findOneAndDelete({ id });
  return deleted;
}

export {
  createPromptTemplate,
  updatePromptTemplate,
  updateEmbeddings,
  getAllPromptTemplates,
  getPromptTemplateById,
  deletePromptTemplate
}
