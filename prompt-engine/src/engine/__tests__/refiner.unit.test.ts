import { describe, it, expect, jest } from '@jest/globals';
import { refinePrompt, getRefinementTypes, refinerTools } from '../refiner';
import { DEFAULT_OPENAI_CONFIG } from '../openai';

// Mock the generateAndRunPrompt to avoid actual API calls in unit tests
jest.mock('../generator');

const mockGeneratedResult = {
  prompt: 'Mock prompt',
  result: 'This is a refined and improved prompt with better clarity.',
  sections: {},
  tokensUsed: 50,
  latencyMs: 1000,
  modelConfig: { provider: 'openai', model: 'gpt-4' },
  timestamp: new Date()
};

// Import and set up the mock after the module is mocked
const { generateAndRunPrompt } = require('../generator');
(generateAndRunPrompt as any).mockResolvedValue(mockGeneratedResult);

describe('refiner module', () => {
  describe('getRefinementTypes', () => {
    it('returns all available refinement type IDs', () => {
      const types = getRefinementTypes();
      expect(Array.isArray(types)).toBe(true);
      expect(types).toContain('concise');
      expect(types).toContain('specific');
      expect(types).toContain('structured');
      expect(types).toContain('context');
      expect(types).toContain('constraints');
      expect(types).toContain('roleplay');
    });
  });

  describe('refinePrompt', () => {
    const originalPrompt = 'Write something about AI';

    it('refines a prompt using the default refinement type (specific)', async () => {
      const result = await refinePrompt(originalPrompt);
      
      expect(result.originalPrompt).toBe(originalPrompt);
      expect(result.refinedPrompt).toBe('This is a refined and improved prompt with better clarity.');
      expect(result.refinementTool.id).toBe('specific');
      expect(result.refinementTool.name).toBe('More Specific');
      expect(typeof result.tokensUsed).toBe('number');
      expect(typeof result.latencyMs).toBe('number');
    });

    it('refines a prompt using a specific refinement type', async () => {
      const result = await refinePrompt(originalPrompt, 'concise');
      
      expect(result.originalPrompt).toBe(originalPrompt);
      expect(result.refinedPrompt).toBe('This is a refined and improved prompt with better clarity.');
      expect(result.refinementTool.id).toBe('concise');
      expect(result.refinementTool.name).toBe('Make Concise');
    });

    it('refines a prompt using structured refinement', async () => {
      const result = await refinePrompt(originalPrompt, 'structured');
      
      expect(result.refinementTool.id).toBe('structured');
      expect(result.refinementTool.name).toBe('Better Structure');
      expect(result.refinementTool.icon).toBe('🏗️');
    });    it('throws error for unknown refinement type', async () => {
      await expect(refinePrompt(originalPrompt, 'unknown')).rejects.toThrow(
        'Unknown prompt refinement type: unknown. Available types: specific, concise, structured, context, constraints, roleplay, examples, error-handling'
      );
    });it('accepts custom model configuration using default OpenAI config', async () => {
      const defaultModelConfig = {
        provider: 'openai' as const,
        model: DEFAULT_OPENAI_CONFIG.model!,
        temperature: DEFAULT_OPENAI_CONFIG.temperature!,
        maxTokens: DEFAULT_OPENAI_CONFIG.maxTokens!,
        customApiHost: DEFAULT_OPENAI_CONFIG.apiHost,
        customApiKey: DEFAULT_OPENAI_CONFIG.apiKey
      };

      const result = await refinePrompt(originalPrompt, 'specific', defaultModelConfig);
      expect(result.refinedPrompt).toBe('This is a refined and improved prompt with better clarity.');
    });

    it('uses default OpenAI config when no model config provided', async () => {
      const result = await refinePrompt(originalPrompt);
      expect(result.refinedPrompt).toBe('This is a refined and improved prompt with better clarity.');
    });
  });
});
