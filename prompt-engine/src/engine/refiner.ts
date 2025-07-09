import { generateAndRunPrompt, createTemplate } from './generator';
import type { ModelConfig } from './types';
import { DEFAULT_OPENAI_CONFIG } from './openai';

export async function refinePrompt(
  prompt: string,
  refinementType: string = 'specific',
  modelConfig?: ModelConfig
): Promise<{
  refinedPrompt: string;
  originalPrompt: string;
  refinementTool: RefinerTool;
  tokensUsed?: number;
  latencyMs?: number;
}> {
  const tool = refinerTools.find(t => t.id === refinementType);
  if (!tool) {
    throw new Error(`Unknown refinement type: ${refinementType}. Available types: ${refinerTools.map(t => t.id).join(', ')}`);
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

Please provide only the improved prompt as your response, without any explanations or additional text. Focus on making it a better prompt for AI systems while maintaining the original intent.`;

  const template = createTemplate({
    id: 'refine-prompt',
    name: 'Prompt Refinement',
    description: `Refine prompt using ${tool.name}`,
    template: metaPrompt,
    role: 'Prompt Engineer',
    useCase: 'Prompt Refinement'
  });

  const result = await generateAndRunPrompt(template, {}, config);

  return {
    refinedPrompt: result.result.trim(),
    originalPrompt: prompt,
    refinementTool: tool,
    tokensUsed: result.tokensUsed,
    latencyMs: result.latencyMs
  };
}

export function getRefinementTypes(): string[] {
  return refinerTools.map(tool => tool.id);
}

export interface RefinerTool {
  id: string;
  name: string;
  icon: string;
  prompt: string;
  description: string;
  color: string;
}

export const refinerTools: RefinerTool[] = [
  {
    id: 'concise',
    name: 'Make Concise',
    icon: '✂️',
    prompt: 'Optimize the following prompt to be more concise while preserving all key information and instructions:',
    description: 'Remove unnecessary words and make it shorter',
    color: 'blue'
  },
  {
    id: 'specific',
    name: 'More Specific',
    icon: '🎯',
    prompt: 'Enhance the following prompt with more specific instructions and clearer expectations:',
    description: 'Add clarity and specificity to reduce ambiguity',
    color: 'green'
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
  }
];

export function getRefinerTools(): RefinerTool[] {
  return refinerTools;
}
