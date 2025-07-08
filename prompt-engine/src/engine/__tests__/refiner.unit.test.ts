import { refinePrompt, getRefinementTypes, refinerTools } from '../refiner';
import { DEFAULT_OPENAI_CONFIG } from '../openai';

// Mock the generateAndRunPrompt to avoid actual API calls in unit tests
jest.mock('../generator', () => ({
  ...jest.requireActual('../generator'),
  generateAndRunPrompt: jest.fn().mockResolvedValue({
    result: 'This is a refined and improved prompt with better clarity.',
    tokensUsed: 50,
    latencyMs: 1000
  })
}));

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
    });

    it('throws error for unknown refinement type', async () => {
      await expect(refinePrompt(originalPrompt, 'unknown')).rejects.toThrow(
        'Unknown refinement type: unknown. Available types: concise, specific, structured, context, constraints, roleplay'
      );
    });    it('accepts custom model configuration using default OpenAI config', async () => {
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
