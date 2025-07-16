import { describe, it, expect } from '@jest/globals';
import { generatePrompt, generateAndRunPrompt, createTemplate } from '../generator';
import { refinerTools } from '../refiner';
import { DEFAULT_OPENAI_CONFIG } from '../openai';

describe.skip('e2e: Full user flow (OpenAI)', () => {
  it('should generate a prompt, refine it, and get real AI output', async () => {
    // Ensure we're using the default API token
    console.log('\n--- OPENAI CONFIG FOR E2E ---');
    console.log('API Host:', DEFAULT_OPENAI_CONFIG.apiHost);
    console.log('API Key:', DEFAULT_OPENAI_CONFIG.apiKey);
    console.log('Model:', DEFAULT_OPENAI_CONFIG.model);
    console.log('Temperature:', DEFAULT_OPENAI_CONFIG.temperature);
    console.log('Max Tokens:', DEFAULT_OPENAI_CONFIG.maxTokens);
    console.log('--- END CONFIG ---\n');

    // Step 1: User selects a template and fills context
    const template = createTemplate({
      id: 'code-review',
      name: 'Code Review Checklist',
      description: 'Generate a checklist for reviewing a code snippet.',
      template: `As a {{role}}, review the following code:\n"""\n{{codeSnippet}}\n"""\nPlease provide feedback on:\n- Correctness\n- Readability\n- Performance\n- Edge cases\n- Suggestions for improvement`,
      role: 'Developer',
      tags: [],
      requiredFields: ['role', 'codeSnippet'],
      optionalFields: []
    });
    const context = {
      role: 'Senior Backend Developer',
      codeSnippet: 'function sum(arr) { return arr.reduce((a, b) => a + b, 0); }'
    };
    // Generate prompt
    const output = generatePrompt(template, context);
    expect(output.prompt).toContain('As a Senior Backend Developer, review the following code:');
    // Accept both raw and HTML-escaped codeSnippet
    const codeSnippetVariants = [
      context.codeSnippet,
      context.codeSnippet.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/=/g, '&#x3D;')
    ];
    expect(codeSnippetVariants.some(snippet => output.prompt.includes(snippet))).toBe(true);
    expect(output.missingFields).toEqual([]);

    // Step 2: User chooses a refiner tool (e.g., 'specific')
    const tool = refinerTools.find(t => t.id === 'specific');
    expect(tool).toBeDefined();
    // Build the meta-prompt for AI refinement
    const metaPrompt = `${tool!.prompt}\n\nOriginal Prompt:\n"""\n${output.prompt}\n"""\n\nPlease provide only the improved prompt as your response, without any explanations or additional text. Focus on making it a better prompt for AI systems while maintaining the original intent.`;

    console.log('\n--- INPUT TO AI (E2E Test) ---');
    console.log('Meta-prompt for refinement:');
    console.log(metaPrompt);
    console.log('--- END INPUT ---\n');

    // Step 3: Call OpenAI API to refine the prompt - Using DEFAULT_OPENAI_CONFIG directly
    const modelConfig = {
      provider: 'openai' as const,
      model: DEFAULT_OPENAI_CONFIG.model!,
      temperature: DEFAULT_OPENAI_CONFIG.temperature!,
      maxTokens: DEFAULT_OPENAI_CONFIG.maxTokens!,
      customApiHost: DEFAULT_OPENAI_CONFIG.apiHost,
      customApiKey: DEFAULT_OPENAI_CONFIG.apiKey
    };

    console.log('\n--- MODEL CONFIG BEING USED ---');
    console.log('Provider:', modelConfig.provider);
    console.log('Model:', modelConfig.model);
    console.log('Temperature:', modelConfig.temperature);
    console.log('Max Tokens:', modelConfig.maxTokens);
    console.log('Custom API Host:', modelConfig.customApiHost);
    console.log('Custom API Key:', modelConfig.customApiKey);
    console.log('--- END MODEL CONFIG ---\n');

    const aiResult = await generateAndRunPrompt(
      createTemplate({
        id: 'refine',
        name: 'Refine',
        description: 'Refine a prompt',
        template: metaPrompt,
        role: 'Prompt Engineer',
        tags: []
      }),
      {},
      modelConfig
    );

    console.log('\n--- AI RESPONSE (E2E Test) ---');
    console.log('Generated Prompt:', aiResult.prompt);
    console.log('AI Result Content:', aiResult.result);
    console.log('Tokens Used:', aiResult.tokensUsed);
    console.log('Latency (ms):', aiResult.latencyMs);
    console.log('Model Config Used:', JSON.stringify(aiResult.modelConfig, null, 2));
    console.log('--- END RESPONSE ---\n');

    expect(typeof aiResult.result).toBe('string');
    expect(aiResult.result.length).toBeGreaterThan(0);
    expect(typeof aiResult.tokensUsed).toBe('number');
  }, 30000);
});
