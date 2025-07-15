import { describe, it, expect } from '@jest/globals';
import { refinePrompt, getRefinementTypes, refinerTools } from '../refiner';
import { DEFAULT_OPENAI_CONFIG } from '../openai';

describe.skip('e2e: Refiner with OpenAI', () => {
  it('should refine a prompt using AI with default refinement type', async () => {
    // Ensure we're using the default API token
    console.log('\n--- REFINER E2E TEST CONFIG ---');
    console.log('API Host:', DEFAULT_OPENAI_CONFIG.apiHost);
    console.log('API Key:', DEFAULT_OPENAI_CONFIG.apiKey);
    console.log('Model:', DEFAULT_OPENAI_CONFIG.model);
    console.log('Temperature:', DEFAULT_OPENAI_CONFIG.temperature);
    console.log('Max Tokens:', DEFAULT_OPENAI_CONFIG.maxTokens);
    console.log('--- END CONFIG ---\n');    const originalPrompt = 'Create a function that processes data';

    console.log('\n--- INPUT TO AI (Refiner E2E) ---');
    console.log('Original Prompt:', originalPrompt);
    console.log('Refinement Type: specific (default)');
    console.log('--- END INPUT ---\n');

    const result = await refinePrompt(originalPrompt);

    console.log('\n--- AI RESPONSE (Refiner E2E) ---');
    console.log('Original Prompt:', result.originalPrompt);
    console.log('Refined Prompt:', result.refinedPrompt);
    console.log('Refinement Tool Used:', result.refinementTool.name, `(${result.refinementTool.id})`);
    console.log('Tool Description:', result.refinementTool.description);
    console.log('Tokens Used:', result.tokensUsed);
    console.log('Latency (ms):', result.latencyMs);
    console.log('--- END RESPONSE ---\n');

    // Verify the results
    expect(result.originalPrompt).toBe(originalPrompt);
    expect(typeof result.refinedPrompt).toBe('string');
    expect(result.refinedPrompt.length).toBeGreaterThan(0);
    expect(result.refinedPrompt).not.toBe(originalPrompt); // Should be different from original
    expect(result.refinementTool.id).toBe('specific');
    expect(result.refinementTool.name).toBe('More Specific');
    expect(typeof result.tokensUsed).toBe('number');
    expect(result.tokensUsed).toBeGreaterThan(0);
    expect(typeof result.latencyMs).toBe('number');
    expect(result.latencyMs).toBeGreaterThan(0);
  }, 30000);

  it('should refine a prompt using different refinement types', async () => {
    const originalPrompt = 'Create a function that processes data';
    const refinementTypes = ['concise', 'structured', 'context'];

    for (const type of refinementTypes) {
      console.log(`\n--- TESTING REFINEMENT TYPE: ${type.toUpperCase()} ---`);
      
      const tool = refinerTools.find(t => t.id === type);
      console.log('Tool:', tool?.name, tool?.icon);
      console.log('Description:', tool?.description);
      console.log('Original Prompt:', originalPrompt);

      const result = await refinePrompt(originalPrompt, type);

      console.log('Refined Prompt:', result.refinedPrompt);
      console.log('Tokens Used:', result.tokensUsed);
      console.log('Latency (ms):', result.latencyMs);
      console.log(`--- END ${type.toUpperCase()} TEST ---\n`);

      // Verify each result
      expect(result.originalPrompt).toBe(originalPrompt);
      expect(result.refinementTool.id).toBe(type);
      expect(typeof result.refinedPrompt).toBe('string');
      expect(result.refinedPrompt.length).toBeGreaterThan(0);
      expect(typeof result.tokensUsed).toBe('number');
      expect(typeof result.latencyMs).toBe('number');
    }
  }, 90000); // Longer timeout for multiple API calls
  it('should handle complex prompts with role-based refinement', async () => {
    const complexPrompt = 'Help me create a presentation about renewable energy sources for a business meeting';

    console.log('\n--- COMPLEX PROMPT REFINEMENT ---');
    console.log('Original Complex Prompt:', complexPrompt);
    console.log('Using roleplay refinement type');

    const result = await refinePrompt(complexPrompt, 'roleplay');

    console.log('Refined Complex Prompt:', result.refinedPrompt);
    console.log('Improvement Tool:', result.refinementTool.name);
    console.log('Tokens Used:', result.tokensUsed);
    console.log('--- END COMPLEX REFINEMENT ---\n');

    expect(result.originalPrompt).toBe(complexPrompt);
    expect(result.refinementTool.id).toBe('roleplay');
    expect(result.refinementTool.name).toBe('Role-based');
    expect(result.refinedPrompt.length).toBeGreaterThan(complexPrompt.length); // Should be more detailed
    expect(typeof result.tokensUsed).toBe('number');
    expect(typeof result.latencyMs).toBe('number');
  }, 30000);

  it('should get all available refinement types', () => {
    const types = getRefinementTypes();
    
    console.log('\n--- AVAILABLE REFINEMENT TYPES ---');
    console.log('Types:', types);
      const expectedTypes = ['specific', 'concise', 'structured', 'context', 'constraints', 'roleplay', 'examples', 'error-handling'];
    expectedTypes.forEach(type => {
      const tool = refinerTools.find(t => t.id === type);
      console.log(`${type}: ${tool?.name} ${tool?.icon} - ${tool?.description}`);
    });
    console.log('--- END TYPES ---\n');

    expect(Array.isArray(types)).toBe(true);
    expect(types.length).toBe(8);
    expectedTypes.forEach(type => {
      expect(types).toContain(type);
    });
  });

  it('should throw error for unknown refinement type', async () => {
    const originalPrompt = 'Test prompt';
    
    await expect(refinePrompt(originalPrompt, 'unknown-type')).rejects.toThrow(
      'Unknown prompt refinement type: unknown-type. Available types: specific, concise, structured, context, constraints, roleplay, examples, error-handling'
    );
  });
});
