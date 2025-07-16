import { describe, it, expect } from '@jest/globals';
import { generateAndRunPrompt, createTemplate } from '../generator';
import { DEFAULT_OPENAI_CONFIG } from '../openai';
import type { ModelConfig } from '../types';

describe.skip('openai integration: generateAndRunPrompt', () => {
  it('should generate and run a prompt with OpenAI API using default config', async () => {
    // Ensure we're using the default API token
    console.log('\n--- OPENAI INTEGRATION TEST CONFIG ---');
    console.log('API Host:', DEFAULT_OPENAI_CONFIG.apiHost);
    console.log('API Key:', DEFAULT_OPENAI_CONFIG.apiKey);
    console.log('Model:', DEFAULT_OPENAI_CONFIG.model);
    console.log('Temperature:', DEFAULT_OPENAI_CONFIG.temperature);
    console.log('Max Tokens:', DEFAULT_OPENAI_CONFIG.maxTokens);
    console.log('--- END CONFIG ---\n');

    const template = createTemplate({
      id: 'greeting',
      name: 'Simple Greeting',
      description: 'Generate a simple greeting',
      template: 'Write a friendly greeting for {{name}} who works as a {{job}}.',
      role: 'Assistant',
    });

    const context = {
      name: 'Alice',
      job: 'software engineer'
    };

    const modelConfig: ModelConfig = {
      provider: 'openai',
      model: DEFAULT_OPENAI_CONFIG.model!,
      temperature: DEFAULT_OPENAI_CONFIG.temperature!,
      maxTokens: DEFAULT_OPENAI_CONFIG.maxTokens!,
      customApiHost: DEFAULT_OPENAI_CONFIG.apiHost,
      customApiKey: DEFAULT_OPENAI_CONFIG.apiKey
    };

    console.log('\n--- INPUT TO AI (Integration Test) ---');
    console.log('Template:', template.template);
    console.log('Context:', context);
    console.log('Model Config:', JSON.stringify(modelConfig, null, 2));
    console.log('--- END INPUT ---\n');

    const result = await generateAndRunPrompt(template, context, modelConfig);

    console.log('\n--- AI RESPONSE (Integration Test) ---');
    console.log('Generated Prompt:', result.prompt);
    console.log('AI Result Content:', result.result);
    console.log('Tokens Used:', result.tokensUsed);
    console.log('Latency (ms):', result.latencyMs);
    console.log('Sections:', JSON.stringify(result.sections, null, 2));
    console.log('Timestamp:', result.timestamp);
    console.log('--- END RESPONSE ---\n');

    // Verify the results
    expect(result.prompt).toContain('Write a friendly greeting for Alice who works as a software engineer.');
    expect(typeof result.result).toBe('string');
    expect(result.result.length).toBeGreaterThan(0);
    expect(typeof result.tokensUsed).toBe('number');
    expect(result.tokensUsed).toBeGreaterThan(0);
    expect(typeof result.latencyMs).toBe('number');
    expect(result.latencyMs).toBeGreaterThan(0);
    expect(result.modelConfig).toEqual(modelConfig);
    expect(result.timestamp).toBeInstanceOf(Date);
  }, 30000);
});
