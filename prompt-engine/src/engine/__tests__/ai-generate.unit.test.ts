import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import aiGenerateRoute from '../../routes/ai-generate';
import { DEFAULT_OPENAI_CONFIG } from '../openai';

// Mock the OpenAI client
jest.mock('../openai');
import { createOpenAIClient } from '../openai';

const mockCreateOpenAIClient = createOpenAIClient as jest.MockedFunction<typeof createOpenAIClient>;

// Mock OpenAI client instance with proper typing
const mockOpenAIClient = {
  generateCompletion: jest.fn()
} as any;

const app = express();
app.use(express.json());
app.use('/ai-generate', aiGenerateRoute);

describe('unit: POST /ai-generate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateOpenAIClient.mockReturnValue(mockOpenAIClient);
    
    // Default mock implementation
    mockOpenAIClient.generateCompletion.mockResolvedValue({
      content: 'This is a mock AI response generated for testing purposes.',
      tokensUsed: 42
    });
  });

  describe('successful requests', () => {
    it('generates AI response with minimal parameters', async () => {
      const res = await request(app)
        .post('/ai-generate')
        .send({ text: 'What is AI?' });

      expect(res.status).toBe(200);
      expect(res.body).toEqual(expect.objectContaining({
        text: 'What is AI?',
        result: 'This is a mock AI response generated for testing purposes.',
        tokensUsed: 42,
        latencyMs: expect.any(Number),
        modelConfig: expect.objectContaining({
          provider: 'openai',
          model: DEFAULT_OPENAI_CONFIG.model,
          temperature: DEFAULT_OPENAI_CONFIG.temperature,
          maxTokens: DEFAULT_OPENAI_CONFIG.maxTokens,
          customApiHost: DEFAULT_OPENAI_CONFIG.apiHost,
          customApiKey: DEFAULT_OPENAI_CONFIG.apiKey
        }),
        timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
      }));

      expect(mockCreateOpenAIClient).toHaveBeenCalledWith({
        apiHost: DEFAULT_OPENAI_CONFIG.apiHost,
        apiKey: DEFAULT_OPENAI_CONFIG.apiKey,
        model: DEFAULT_OPENAI_CONFIG.model,
        temperature: DEFAULT_OPENAI_CONFIG.temperature,
        maxTokens: DEFAULT_OPENAI_CONFIG.maxTokens
      });

      expect(mockOpenAIClient.generateCompletion).toHaveBeenCalledWith('What is AI?', {
        temperature: DEFAULT_OPENAI_CONFIG.temperature,
        maxTokens: DEFAULT_OPENAI_CONFIG.maxTokens,
        systemPrompt: undefined
      });
    });

    it('generates AI response with custom model config', async () => {
      const customConfig = {
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        temperature: 0.5,
        maxTokens: 1500,
        customApiHost: 'https://custom-api.example.com/v1',
        customApiKey: 'Bearer custom-key'
      };

      const res = await request(app)
        .post('/ai-generate')
        .send({ 
          text: 'Explain quantum computing.',
          modelConfig: customConfig
        });

      expect(res.status).toBe(200);
      expect(res.body.modelConfig).toEqual(customConfig);

      expect(mockCreateOpenAIClient).toHaveBeenCalledWith({
        apiHost: 'https://custom-api.example.com/v1',
        apiKey: 'Bearer custom-key',
        model: 'gpt-3.5-turbo',
        temperature: 0.5,
        maxTokens: 1500
      });

      expect(mockOpenAIClient.generateCompletion).toHaveBeenCalledWith('Explain quantum computing.', {
        temperature: 0.5,
        maxTokens: 1500,
        systemPrompt: undefined
      });
    });

    it('generates AI response with system prompt', async () => {
      const systemPrompt = 'You are a helpful science teacher. Explain concepts clearly.';

      const res = await request(app)
        .post('/ai-generate')
        .send({ 
          text: 'What is photosynthesis?',
          systemPrompt
        });

      expect(res.status).toBe(200);
      expect(mockOpenAIClient.generateCompletion).toHaveBeenCalledWith('What is photosynthesis?', {
        temperature: DEFAULT_OPENAI_CONFIG.temperature,
        maxTokens: DEFAULT_OPENAI_CONFIG.maxTokens,
        systemPrompt
      });
    });

    it('trims whitespace from input text', async () => {
      const res = await request(app)
        .post('/ai-generate')
        .send({ text: '  \n  What is machine learning?  \t  ' });

      expect(res.status).toBe(200);
      expect(res.body.text).toBe('What is machine learning?');
      expect(mockOpenAIClient.generateCompletion).toHaveBeenCalledWith('What is machine learning?', expect.any(Object));
    });

    it('measures latency correctly', async () => {
      // Simulate a delayed response
      mockOpenAIClient.generateCompletion.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          content: 'Delayed response',
          tokensUsed: 30
        }), 100))
      );

      const res = await request(app)
        .post('/ai-generate')
        .send({ text: 'Test latency.' });

      expect(res.status).toBe(200);
      expect(res.body.latencyMs).toBeGreaterThanOrEqual(100);
    });

    it('merges partial model config with defaults', async () => {
      const partialConfig = {
        temperature: 0.8,
        maxTokens: 500
      };

      const res = await request(app)
        .post('/ai-generate')
        .send({ 
          text: 'Test partial config.',
          modelConfig: partialConfig
        });

      expect(res.status).toBe(200);
      expect(res.body.modelConfig).toEqual({
        provider: 'openai',
        model: DEFAULT_OPENAI_CONFIG.model,
        temperature: 0.8,
        maxTokens: 500,
        customApiHost: DEFAULT_OPENAI_CONFIG.apiHost,
        customApiKey: DEFAULT_OPENAI_CONFIG.apiKey
      });
    });
  });

  describe('validation errors', () => {
    it('returns 400 for missing text', async () => {
      const res = await request(app)
        .post('/ai-generate')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Missing or invalid text - must be a non-empty string');
      expect(mockOpenAIClient.generateCompletion).not.toHaveBeenCalled();
    });

    it('returns 400 for null text', async () => {
      const res = await request(app)
        .post('/ai-generate')
        .send({ text: null });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Missing or invalid text - must be a non-empty string');
    });

    it('returns 400 for empty string text', async () => {
      const res = await request(app)
        .post('/ai-generate')
        .send({ text: '' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Missing or invalid text - must be a non-empty string');
    });

    it('returns 400 for whitespace-only text', async () => {
      const res = await request(app)
        .post('/ai-generate')
        .send({ text: '   \n\t   ' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Missing or invalid text - must be a non-empty string');
    });

    it('returns 400 for non-string text', async () => {
      const testCases = [123, true, [], {}];

      for (const testCase of testCases) {
        const res = await request(app)
          .post('/ai-generate')
          .send({ text: testCase });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Missing or invalid text - must be a non-empty string');
      }
    });

    it('returns 400 for invalid model config type', async () => {
      const invalidConfigs = ['string', 123, true, []];

      for (const invalidConfig of invalidConfigs) {
        const res = await request(app)
          .post('/ai-generate')
          .send({ 
            text: 'Test text',
            modelConfig: invalidConfig
          });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Invalid modelConfig - must be an object');
      }
    });

    it('returns 400 for invalid system prompt type', async () => {
      const invalidPrompts = [123, true, [], {}];

      for (const invalidPrompt of invalidPrompts) {
        const res = await request(app)
          .post('/ai-generate')
          .send({ 
            text: 'Test text',
            systemPrompt: invalidPrompt
          });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Invalid systemPrompt - must be a string');
      }
    });

    it('returns 400 for unsupported provider', async () => {
      const unsupportedProviders = ['anthropic', 'google', 'local', 'unknown'];

      for (const provider of unsupportedProviders) {
        const res = await request(app)
          .post('/ai-generate')
          .send({ 
            text: 'Test text',
            modelConfig: { provider }
          });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Only OpenAI provider is currently supported');
      }
    });
  });
  describe('error handling', () => {
    it('handles OpenAI API errors gracefully', async () => {
      const apiError = new Error('OpenAI API error: 429 - Rate limit exceeded');
      mockOpenAIClient.generateCompletion.mockImplementation(() => {
        // Simulate some processing time
        return new Promise((_, reject) => {
          setTimeout(() => reject(apiError), 10);
        });
      });

      const res = await request(app)
        .post('/ai-generate')
        .send({ text: 'Test API error.' });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('OpenAI API error');
      expect(res.body.details).toBe('OpenAI API error: 429 - Rate limit exceeded');
      expect(res.body.latencyMs).toBeGreaterThan(0);
      expect(res.body.timestamp).toBeDefined();
    });

    it('handles network errors gracefully', async () => {
      const networkError = new Error('Network connection failed');
      mockOpenAIClient.generateCompletion.mockImplementation(() => {
        // Simulate some processing time
        return new Promise((_, reject) => {
          setTimeout(() => reject(networkError), 10);
        });
      });

      const res = await request(app)
        .post('/ai-generate')
        .send({ text: 'Test network error.' });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Network connection failed');
      expect(res.body.latencyMs).toBeGreaterThan(0);
      expect(res.body.timestamp).toBeDefined();
    });

    it('handles unknown errors gracefully', async () => {
      mockOpenAIClient.generateCompletion.mockImplementation(() => {
        // Simulate some processing time
        return new Promise((_, reject) => {
          setTimeout(() => reject('Unknown error'), 10);
        });
      });

      const res = await request(app)
        .post('/ai-generate')
        .send({ text: 'Test unknown error.' });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Internal error');
      expect(res.body.latencyMs).toBeGreaterThan(0);
      expect(res.body.timestamp).toBeDefined();
    });

    it('includes latency in error responses', async () => {
      mockOpenAIClient.generateCompletion.mockImplementation(() => 
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 50))
      );

      const res = await request(app)
        .post('/ai-generate')
        .send({ text: 'Test error latency.' });

      expect(res.status).toBe(500);
      expect(res.body.latencyMs).toBeGreaterThanOrEqual(50);
    });
  });

  describe('edge cases', () => {    it('handles very long text input', async () => {
      const longText = 'This is a very long text input. '.repeat(1000);
      
      const res = await request(app)
        .post('/ai-generate')
        .send({ text: longText });

      expect(res.status).toBe(200);
      expect(res.body.text).toBe(longText.trim());
    });

    it('handles special characters and Unicode', async () => {
      const specialText = 'Special chars: @#$%^&*()_+{}|:"<>?[]\\;\'.,/`~\nUnicode: 🤖💡🚀éñτẽ★';

      const res = await request(app)
        .post('/ai-generate')
        .send({ text: specialText });

      expect(res.status).toBe(200);
      expect(res.body.text).toBe(specialText);
    });

    it('handles JSON-like text content', async () => {
      const jsonText = '{"question": "What is AI?", "context": "machine learning", "format": "simple"}';

      const res = await request(app)
        .post('/ai-generate')
        .send({ text: jsonText });

      expect(res.status).toBe(200);
      expect(res.body.text).toBe(jsonText);
    });

    it('handles code-like text content', async () => {
      const codeText = `function generateAI(prompt) {
        return fetch('/api/openai', {
          method: 'POST',
          body: JSON.stringify({ prompt })
        });
      }`;

      const res = await request(app)
        .post('/ai-generate')
        .send({ text: codeText });

      expect(res.status).toBe(200);
      expect(res.body.text).toBe(codeText);
    });

    it('handles empty system prompt gracefully', async () => {
      const res = await request(app)
        .post('/ai-generate')
        .send({ 
          text: 'Test empty system prompt.',
          systemPrompt: ''
        });

      expect(res.status).toBe(200);
      expect(mockOpenAIClient.generateCompletion).toHaveBeenCalledWith('Test empty system prompt.', {
        temperature: DEFAULT_OPENAI_CONFIG.temperature,
        maxTokens: DEFAULT_OPENAI_CONFIG.maxTokens,
        systemPrompt: ''
      });
    });
  });
});
