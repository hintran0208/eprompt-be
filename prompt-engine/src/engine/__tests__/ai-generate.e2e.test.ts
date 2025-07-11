import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import aiGenerateRoute from '../../routes/ai-generate';
import { DEFAULT_OPENAI_CONFIG } from '../openai';

const app = express();
app.use(express.json());
app.use('/ai-generate', aiGenerateRoute);

describe('e2e: POST /ai-generate (Real OpenAI Integration)', () => {
  it('should generate real AI response from OpenAI API', async () => {
    console.log('\n--- AI-GENERATE E2E TEST CONFIG ---');
    console.log('API Host:', DEFAULT_OPENAI_CONFIG.apiHost);
    console.log('API Key:', DEFAULT_OPENAI_CONFIG.apiKey);
    console.log('Model:', DEFAULT_OPENAI_CONFIG.model);
    console.log('Temperature:', DEFAULT_OPENAI_CONFIG.temperature);
    console.log('Max Tokens:', DEFAULT_OPENAI_CONFIG.maxTokens);
    console.log('--- END CONFIG ---\n');

    const testText = 'Write a brief, friendly greeting for a new user joining a software development platform.';

    console.log('\n--- INPUT TO AI-GENERATE ---');
    console.log('Text:', testText);
    console.log('--- END INPUT ---\n');

    const res = await request(app)
      .post('/ai-generate')
      .send({ text: testText });

    console.log('\n--- AI-GENERATE RESPONSE (E2E Test) ---');
    console.log('Status:', res.status);
    console.log('Input Text:', res.body.text);
    console.log('AI Result:', res.body.result);
    console.log('Tokens Used:', res.body.tokensUsed);
    console.log('Latency (ms):', res.body.latencyMs);
    console.log('Model Config:', JSON.stringify(res.body.modelConfig, null, 2));
    console.log('Timestamp:', res.body.timestamp);
    console.log('--- END RESPONSE ---\n');

    // Verify the response structure
    expect(res.status).toBe(200);
    expect(res.body.text).toBe(testText);
    expect(typeof res.body.result).toBe('string');
    expect(res.body.result.length).toBeGreaterThan(0);
    expect(typeof res.body.tokensUsed).toBe('number');
    expect(res.body.tokensUsed).toBeGreaterThan(0);
    expect(typeof res.body.latencyMs).toBe('number');
    expect(res.body.latencyMs).toBeGreaterThan(0);

    // Verify model configuration
    expect(res.body.modelConfig.provider).toBe('openai');
    expect(res.body.modelConfig.model).toBe(DEFAULT_OPENAI_CONFIG.model);
    expect(res.body.modelConfig.temperature).toBe(DEFAULT_OPENAI_CONFIG.temperature);
    expect(res.body.modelConfig.maxTokens).toBe(DEFAULT_OPENAI_CONFIG.maxTokens);
    expect(res.body.modelConfig.customApiHost).toBe(DEFAULT_OPENAI_CONFIG.apiHost);
    expect(res.body.modelConfig.customApiKey).toBe(DEFAULT_OPENAI_CONFIG.apiKey);

    // Verify timestamp format
    expect(res.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(new Date(res.body.timestamp)).toBeInstanceOf(Date);

    // Verify the AI response is contextual and relevant
    expect(res.body.result.toLowerCase()).toMatch(/(welcome|hello|hi|greeting|join|platform|software|development)/);
  }, 30000); // 30 second timeout for real API call

  it('should handle custom model configuration with real API', async () => {
    const customConfig = {
      provider: 'openai',
      model: DEFAULT_OPENAI_CONFIG.model,
      temperature: 0.3,
      maxTokens: 150,
      customApiHost: DEFAULT_OPENAI_CONFIG.apiHost,
      customApiKey: DEFAULT_OPENAI_CONFIG.apiKey
    };

    const testText = 'Explain the concept of recursion in programming in exactly one sentence.';

    console.log('\n--- CUSTOM CONFIG TEST ---');
    console.log('Text:', testText);
    console.log('Custom Config:', JSON.stringify(customConfig, null, 2));
    console.log('--- END INPUT ---\n');

    const res = await request(app)
      .post('/ai-generate')
      .send({ 
        text: testText,
        modelConfig: customConfig
      });

    console.log('\n--- CUSTOM CONFIG RESPONSE ---');
    console.log('AI Result:', res.body.result);
    console.log('Tokens Used:', res.body.tokensUsed);
    console.log('Actual Config Used:', JSON.stringify(res.body.modelConfig, null, 2));
    console.log('--- END RESPONSE ---\n');

    expect(res.status).toBe(200);
    expect(res.body.modelConfig.temperature).toBe(0.3);
    expect(res.body.modelConfig.maxTokens).toBe(150);
    expect(res.body.tokensUsed).toBeLessThanOrEqual(150);
    expect(res.body.result.toLowerCase()).toMatch(/(recursion|function|call|itself)/);
  }, 30000);

  it('should handle system prompt with real API', async () => {
    const systemPrompt = 'You are a concise technical writer. Provide clear, brief explanations without fluff.';
    const testText = 'What is an API?';

    console.log('\n--- SYSTEM PROMPT TEST ---');
    console.log('System Prompt:', systemPrompt);
    console.log('Text:', testText);
    console.log('--- END INPUT ---\n');

    const res = await request(app)
      .post('/ai-generate')
      .send({ 
        text: testText,
        systemPrompt
      });

    console.log('\n--- SYSTEM PROMPT RESPONSE ---');
    console.log('AI Result:', res.body.result);
    console.log('Tokens Used:', res.body.tokensUsed);
    console.log('--- END RESPONSE ---\n');

    expect(res.status).toBe(200);
    expect(res.body.result.toLowerCase()).toMatch(/(api|application|programming|interface)/);
    // With the system prompt, response should be concise
    expect(res.body.result.length).toBeLessThan(500);
  }, 30000);

  it('should handle complex multi-line input with real API', async () => {
    const complexText = `Please help me with the following:

1. Explain what machine learning is
2. Give me one practical example
3. Keep it beginner-friendly

Format your response with clear headings.`;

    console.log('\n--- COMPLEX INPUT TEST ---');
    console.log('Complex Text:', complexText);
    console.log('--- END INPUT ---\n');

    const res = await request(app)
      .post('/ai-generate')
      .send({ text: complexText });

    console.log('\n--- COMPLEX INPUT RESPONSE ---');
    console.log('AI Result:', res.body.result);
    console.log('Tokens Used:', res.body.tokensUsed);
    console.log('--- END RESPONSE ---\n');

    expect(res.status).toBe(200);
    expect(res.body.text).toBe(complexText);
    expect(res.body.result.toLowerCase()).toMatch(/(machine learning|example|beginner)/);
    expect(res.body.tokensUsed).toBeGreaterThan(50); // Complex queries should use more tokens
  }, 30000);

  it('should measure realistic latency for API calls', async () => {
    const startTime = Date.now();
    
    const res = await request(app)
      .post('/ai-generate')
      .send({ text: 'What is the capital of France?' });

    const actualLatency = Date.now() - startTime;

    console.log('\n--- LATENCY TEST ---');
    console.log('Actual API latency:', actualLatency, 'ms');
    console.log('Reported latency:', res.body.latencyMs, 'ms');
    console.log('--- END LATENCY TEST ---\n');

    expect(res.status).toBe(200);
    expect(res.body.latencyMs).toBeGreaterThan(0);
    expect(res.body.latencyMs).toBeLessThan(actualLatency + 100); // Allow some margin for processing
    expect(res.body.latencyMs).toBeGreaterThan(100); // Real API calls should take at least 100ms
  }, 30000);

  it('should handle various text encoding and special characters', async () => {
    const specialText = 'Explain AI using emojis: 🤖💡🧠. Also include accented characters: café, naïve, résumé.';

    const res = await request(app)
      .post('/ai-generate')
      .send({ text: specialText });

    console.log('\n--- SPECIAL CHARACTERS TEST ---');
    console.log('Input:', specialText);
    console.log('Output:', res.body.result);
    console.log('--- END SPECIAL CHARACTERS TEST ---\n');

    expect(res.status).toBe(200);
    expect(res.body.text).toBe(specialText);
    expect(res.body.result).toBeDefined();
    expect(res.body.result.length).toBeGreaterThan(0);
  }, 30000);
});
