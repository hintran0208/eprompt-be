import Handlebars from 'handlebars';
import type { PromptTemplate, PromptContext, PromptOutput, ModelConfig, PromptResult } from './types';
import { OpenAIClient, createOpenAIClient, DEFAULT_OPENAI_CONFIG } from './openai';
import { createVaultItem } from './vault';

export function extractTemplateVariables(template: string): string[] {
  const variables = new Set<string>();
  const regex = /\{\{\s*([^}]+)\s*\}\}/g;
  let match;
  while ((match = regex.exec(template)) !== null) {
    const variable = match[1].trim();
    if (!variable.includes(' ') && !variable.startsWith('#') && !variable.startsWith('/')) {
      variables.add(variable);
    }
  }
  return Array.from(variables);
}

export function validateRequiredFields(requiredFields: string[], context: PromptContext): string[] {
  return requiredFields.filter(field => 
    context[field] === undefined || 
    context[field] === null || 
    context[field] === ''
  );
}

export function getUsedContextFields(template: string, context: PromptContext): string[] {
  const templateVariables = extractTemplateVariables(template);
  return templateVariables.filter(variable => 
    context[variable] !== undefined && 
    context[variable] !== null && 
    context[variable] !== ''
  );
}

export function sanitizeContext(context: PromptContext): PromptContext {
  const sanitized: PromptContext = {};
  for (const [key, value] of Object.entries(context)) {
    if (value !== undefined && value !== null) {
      sanitized[key] = String(value).trim();
    }
  }
  return sanitized;
}

export async function generatePrompt(template: PromptTemplate, context: PromptContext, vaultItem: any = { userId: 'admin'}): Promise<PromptOutput> {
  try {
    const missingFields = validateRequiredFields(template.requiredFields, context);
    const sanitizedContext = sanitizeContext(context);
    const compiledTemplate = Handlebars.compile(template.template, { noEscape: true });
    const prompt = compiledTemplate(sanitizedContext);
    const contextUsed = getUsedContextFields(template.template, sanitizedContext);

    let result = {};
    if (!(template.id === 'refine-prompt' || template.id === 'refine-content')) {
      result = await createVaultItem({
        userId: vaultItem.userId || 'admin',
        templateId: template.id,
        templateName: template.name,
        initialPrompt: prompt,
        name: vaultItem.name,
        description: vaultItem.description || '',
      });
    }
    
    return {
      prompt: prompt.trim(),
      missingFields,
      contextUsed,
      vaultItem: result || undefined,
      metadata: {
        templateId: template.id,
        templateName: template.name,
        generatedAt: new Date().toISOString(),
        hasRequiredFields: missingFields.length === 0
      }
    };
  } catch (error) {
    return {
      prompt: '',
      missingFields: template.requiredFields,
      contextUsed: [],
      vaultItem: undefined,
      metadata: {
        templateId: template.id,
        templateName: template.name,
        generatedAt: new Date().toISOString(),
        hasRequiredFields: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

export async function generateAndRunPrompt(
  template: PromptTemplate,
  context: PromptContext,
  modelConfig: ModelConfig
): Promise<PromptResult> {
  const startTime = Date.now();
  const promptOutput = await generatePrompt(template, context);
  if (promptOutput.missingFields.length > 0) {
    return {
      prompt: promptOutput.prompt,
      result: `Error: Missing required fields: ${promptOutput.missingFields.join(', ')}`,
      sections: {},
      tokensUsed: 0,
      latencyMs: Date.now() - startTime,
      modelConfig,
      timestamp: new Date()
    };
  }
  try {
    let result = '';
    let tokensUsed = 0;
    if (modelConfig.provider === 'openai') {
      const openaiClient = createOpenAIClient({ model: modelConfig.model });
      const systemPrompt = `You are an expert ${template.role}.\nProvide a comprehensive, well-structured response that directly addresses the user's request.\nFormat your response clearly with appropriate headings and bullet points where helpful.`;
      const completion = await openaiClient.generateCompletion(promptOutput.prompt, {
        temperature: modelConfig.temperature,
        maxTokens: modelConfig.maxTokens,
        systemPrompt
      });
      result = completion.content;
      tokensUsed = completion.tokensUsed;
    } else {
      result = `[Generated with ${modelConfig.provider}/${modelConfig.model}]\n\n${promptOutput.prompt}`;
      tokensUsed = Math.floor(promptOutput.prompt.length / 4);
    }
    const sections = parseResponseSections(result);
    return {
      prompt: promptOutput.prompt,
      result,
      sections,
      tokensUsed,
      latencyMs: Date.now() - startTime,
      modelConfig,
      timestamp: new Date()
    };
  } catch (error) {
    return {
      prompt: promptOutput.prompt,
      result: `Error: ${error instanceof Error ? error.message : 'Failed to generate AI response'}`,
      sections: {},
      tokensUsed: 0,
      latencyMs: Date.now() - startTime,
      modelConfig,
      timestamp: new Date()
    };
  }
}

function parseResponseSections(response: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const sectionPatterns = [
    /^#+\s+(.+)$/gm,
    /^(\d+\.|\*|\-)\s+(.+)$/gm,
    /^\*\*([^*]+)\*\*:?\s*$/gm
  ];
  let currentSection = 'Main Content';
  let currentContent = '';
  const lines = response.split('\n');
  for (const line of lines) {
    const trimmedLine = line.trim();
    const headerMatch = trimmedLine.match(/^#+\s+(.+)$/) || trimmedLine.match(/^\*\*([^*]+)\*\*:?\s*$/);
    if (headerMatch) {
      if (currentContent.trim()) {
        sections[currentSection] = currentContent.trim();
      }
      currentSection = headerMatch[1];
      currentContent = '';
    } else {
      currentContent += line + '\n';
    }
  }
  if (currentContent.trim()) {
    sections[currentSection] = currentContent.trim();
  }
  return sections;
}

export function createTemplate(config: {
  id: string;
  name: string;
  description: string;
  template: string;
  role: string;
  tags?: string[];
  requiredFields?: string[];
  optionalFields?: string[];
}): PromptTemplate {
  const templateVariables = extractTemplateVariables(config.template);
  return {
    id: config.id,
    name: config.name,
    description: config.description,
    template: config.template,
    role: config.role,
    tags: config.tags || [],
    requiredFields: config.requiredFields || templateVariables,
    optionalFields: config.optionalFields || [],
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date()
  };
}
