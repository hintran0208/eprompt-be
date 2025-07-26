import { generateAndRunPrompt, createTemplate } from './generator';
import type { ModelConfig } from './types';
import { DEFAULT_OPENAI_CONFIG } from './openai';
import { updateVaultItem } from './vault';

export async function refinePrompt(
  prompt: string,
  refinementType: string = 'specific',
  vaultId?: string,
  modelConfig?: ModelConfig
): Promise<{
  refinedPrompt: string;
  originalPrompt: string;
  refinementTool: PromptRefinerTool;
  tokensUsed?: number;
  latencyMs?: number;
}> {
  const tool = promptRefinerTools.find(t => t.id === refinementType);
  if (!tool) {
    throw new Error(`Unknown prompt refinement type: ${refinementType}. Available types: ${promptRefinerTools.map(t => t.id).join(', ')}`);
  }

  const config = modelConfig || {
    provider: 'openai' as const,
    model: DEFAULT_OPENAI_CONFIG.model!,
    temperature: DEFAULT_OPENAI_CONFIG.temperature!,
    maxTokens: DEFAULT_OPENAI_CONFIG.maxTokens!,
    customApiHost: DEFAULT_OPENAI_CONFIG.apiHost,
    customApiKey: DEFAULT_OPENAI_CONFIG.apiKey
  };

  const metaPrompt = `${tool.prompt}

Original Prompt:
"""
${prompt}
"""

CRITICAL INSTRUCTIONS:
- Return ONLY the refined prompt text
- Do NOT include any explanations, commentary, or meta-text
- Do NOT add phrases like "Here is the refined prompt:", "Refined prompt:", or similar
- Do NOT add quotation marks around the response
- Do NOT include any introduction or conclusion
- Output the prompt improvement directly without any wrapper text`;

  const template = createTemplate({
    id: 'refine-prompt',
    name: 'Prompt Refinement',
    description: `Refine prompt using ${tool.name}`,
    template: metaPrompt,
    role: 'Prompt Engineer',
    tags: ['Prompt Refinement']
  });

  const result = await generateAndRunPrompt(template, {}, config);

  if (vaultId) {
    // Update the vault item with the refined prompt
    await updateVaultItem(vaultId, {
      refinedPrompt: result.result.trim(),
    });
  }

  return {
    refinedPrompt: result.result.trim(),
    originalPrompt: prompt,
    refinementTool: tool,
    tokensUsed: result.tokensUsed,
    latencyMs: result.latencyMs
  };
}

export async function refineContent(
  content: string,
  refinementType: string = 'clarity',
  vaultId?: string,
  modelConfig?: ModelConfig
): Promise<{
  refinedContent: string;
  originalContent: string;
  refinementTool: ContentRefinerTool;
  tokensUsed?: number;
  latencyMs?: number;
}> {
  const tool = contentRefinerTools.find(t => t.id === refinementType);
  if (!tool) {
    throw new Error(`Unknown content refinement type: ${refinementType}. Available types: ${contentRefinerTools.map(t => t.id).join(', ')}`);
  }

  const config = modelConfig || {
    provider: 'openai' as const,
    model: DEFAULT_OPENAI_CONFIG.model!,
    temperature: DEFAULT_OPENAI_CONFIG.temperature!,
    maxTokens: DEFAULT_OPENAI_CONFIG.maxTokens!,
    customApiHost: DEFAULT_OPENAI_CONFIG.apiHost,
    customApiKey: DEFAULT_OPENAI_CONFIG.apiKey
  };

  const metaPrompt = `${tool.prompt}

Original Content:
"""
${content}
"""

CRITICAL INSTRUCTIONS:
- Return ONLY the refined content text
- Do NOT include any explanations, commentary, or meta-text
- Do NOT add phrases like "Here is the refined content:", "Refined content:", or similar
- Do NOT add quotation marks around the response
- Do NOT include any introduction or conclusion
- Output the content improvement directly without any wrapper text`;

  const template = createTemplate({
    id: 'refine-content',
    name: 'Content Refinement',
    description: `Refine content using ${tool.name}`,
    template: metaPrompt,
    role: 'Content Editor',
    tags: ['Content Refinement']
  });

  const result = await generateAndRunPrompt(template, {}, config);

  if (vaultId) {
    // Update the vault item with the refined prompt
    await updateVaultItem(vaultId, {
      generatedContent: result.result.trim(),
    });
  }

  return {
    refinedContent: result.result.trim(),
    originalContent: content,
    refinementTool: tool,
    tokensUsed: result.tokensUsed,
    latencyMs: result.latencyMs
  };
}

export function getPromptRefinementTypes(): string[] {
  return promptRefinerTools.map(tool => tool.id);
}

export function getContentRefinementTypes(): string[] {
  return contentRefinerTools.map(tool => tool.id);
}

export interface PromptRefinerTool {
  id: string;
  name: string;
  icon: string;
  prompt: string;
  description: string;
  color: string;
}

export interface ContentRefinerTool {
  id: string;
  name: string;
  icon: string;
  prompt: string;
  description: string;
  color: string;
}

// Legacy interface for backward compatibility
export interface RefinerTool extends PromptRefinerTool {}

export const promptRefinerTools: PromptRefinerTool[] = [
  {
    id: 'specific',
    name: 'More Specific',
    icon: '🎯',
    prompt: 'Enhance the following prompt with more specific instructions and clearer expectations:',
    description: 'Add clarity and specificity to reduce ambiguity',
    color: 'green'
  },
  {
    id: 'concise',
    name: 'Make Concise',
    icon: '✂️',
    prompt: 'Optimize the following prompt to be more concise while preserving all key information and instructions:',
    description: 'Remove unnecessary words and make it shorter',
    color: 'blue'
  },
  {
    id: 'structured',
    name: 'Better Structure',
    icon: '🏗️',
    prompt: 'Restructure the following prompt with better organization, clear sections, and logical flow:',
    description: 'Improve organization and readability',
    color: 'indigo'
  },
  {
    id: 'context',
    name: 'Add Context',
    icon: '📋',
    prompt: 'Enhance the following prompt by adding relevant context, background information, and examples:',
    description: 'Add more comprehensive context and examples',
    color: 'orange'
  },
  {
    id: 'constraints',
    name: 'Add Constraints',
    icon: '⚙️',
    prompt: 'Improve the following prompt by adding appropriate constraints, format requirements, and output specifications:',
    description: 'Add technical constraints and output format guidance',
    color: 'gray'
  },
  {
    id: 'roleplay',
    name: 'Role-based',
    icon: '🎭',
    prompt: 'Transform the following prompt to include role-playing instructions and persona-based guidance:',
    description: 'Add role-playing elements and persona guidance',
    color: 'purple'
  },
  {
    id: 'examples',
    name: 'Add Examples',
    icon: '💡',
    prompt: 'Enhance the following prompt by adding relevant examples and sample outputs to clarify expectations:',
    description: 'Include practical examples and demonstrations',
    color: 'yellow'
  },
  {
    id: 'error-handling',
    name: 'Error Handling',
    icon: '🛡️',
    prompt: 'Improve the following prompt by adding instructions for handling edge cases, errors, and unexpected inputs:',
    description: 'Add robustness and error handling guidance',
    color: 'red'
  }
];

export const contentRefinerTools: ContentRefinerTool[] = [
  {
    id: 'clarity',
    name: 'Improve Clarity',
    icon: '🔍',
    prompt: 'Enhance the following content to make it clearer, more understandable, and easier to read:',
    description: 'Make content clearer and more understandable',
    color: 'blue'
  },
  {
    id: 'professional',
    name: 'Professional Tone',
    icon: '💼',
    prompt: 'Rewrite the following content with a professional, formal tone suitable for business communication:',
    description: 'Convert to professional business tone',
    color: 'navy'
  },
  {
    id: 'engaging',
    name: 'More Engaging',
    icon: '✨',
    prompt: 'Transform the following content to be more engaging, interesting, and compelling for readers:',
    description: 'Make content more engaging and captivating',
    color: 'purple'
  },
  {
    id: 'concise',
    name: 'Make Concise',
    icon: '✂️',
    prompt: 'Condense the following content to be more concise while retaining all important information:',
    description: 'Reduce length while keeping key information',
    color: 'green'
  },
  {
    id: 'detailed',
    name: 'Add Detail',
    icon: '📝',
    prompt: 'Expand the following content with more detail, examples, and comprehensive information:',
    description: 'Add more depth and comprehensive details',
    color: 'orange'
  },
  {
    id: 'technical',
    name: 'Technical Accuracy',
    icon: '⚙️',
    prompt: 'Improve the following content for technical accuracy, precision, and proper terminology:',
    description: 'Enhance technical accuracy and terminology',
    color: 'gray'
  },
  {
    id: 'creative',
    name: 'Creative Style',
    icon: '🎨',
    prompt: 'Rewrite the following content with a more creative, imaginative, and artistic approach:',
    description: 'Add creativity and artistic flair',
    color: 'pink'
  },
  {
    id: 'persuasive',
    name: 'Persuasive',
    icon: '🎯',
    prompt: 'Transform the following content to be more persuasive, convincing, and action-oriented:',
    description: 'Make content more persuasive and compelling',
    color: 'red'
  }
];

// Legacy exports for backward compatibility
export const refinerTools: RefinerTool[] = promptRefinerTools;

export function getRefinementTypes(): string[] {
  return getPromptRefinementTypes();
}

export function getRefinerTools(): RefinerTool[] {
  return promptRefinerTools;
}

export function getPromptRefinerTools(): PromptRefinerTool[] {
  return promptRefinerTools;
}

export function getContentRefinerTools(): ContentRefinerTool[] {
  return contentRefinerTools;
}
