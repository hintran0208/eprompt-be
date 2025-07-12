import { describe, it, expect } from '@jest/globals';
import { OpenAIClient, DEFAULT_OPENAI_CONFIG } from '../openai';

describe('openai module', () => {
  it('should generate a completion from OpenAI API (smoke test)', async () => {
    // Ensure we're using the default API token
    console.log('\n--- OPENAI CONFIG ---');
    console.log('API Host:', DEFAULT_OPENAI_CONFIG.apiHost);
    console.log('API Key:', DEFAULT_OPENAI_CONFIG.apiKey);
    console.log('Model:', DEFAULT_OPENAI_CONFIG.model);
    console.log('Temperature:', DEFAULT_OPENAI_CONFIG.temperature);
    console.log('Max Tokens:', DEFAULT_OPENAI_CONFIG.maxTokens);
    console.log('--- END CONFIG ---\n');

    const client = new OpenAIClient(DEFAULT_OPENAI_CONFIG);
    const prompt = 'Say hello to the world.';
    
    console.log('\n--- INPUT TO AI ---');
    console.log('Prompt:', prompt);
    console.log('--- END INPUT ---\n');
    
    const result = await client.generateCompletion(prompt);
    
    console.log('\n--- AI RESPONSE ---');
    console.log('Content:', result.content);
    console.log('Tokens Used:', result.tokensUsed);
    console.log('--- END RESPONSE ---\n');
    
    expect(typeof result.content).toBe('string');
    expect(result.content.length).toBeGreaterThan(0);
    expect(typeof result.tokensUsed).toBe('number');
  }, 20000);
});
