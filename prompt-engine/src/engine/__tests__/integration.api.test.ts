import request from 'supertest';
import express from 'express';
import dotenv from 'dotenv';
import generateRoute from '../../routes/generate';
import refineRoute from '../../routes/refine';
import { createTemplate } from '../generator';
import { DEFAULT_OPENAI_CONFIG } from '../openai';

// Mock the refinePrompt function to avoid actual API calls in integration tests
jest.mock('../refiner', () => ({
  ...jest.requireActual('../refiner'),
  refinePrompt: jest.fn().mockResolvedValue({
    refinedPrompt: 'This is a refined and improved prompt with better clarity and structure.',
    originalPrompt: 'Write something about AI',
    refinementTool: {
      id: 'specific',
      name: 'More Specific',
      icon: '🎯',
      prompt: 'Enhance the following prompt with more specific instructions and clearer expectations:',
      description: 'Add clarity and specificity to reduce ambiguity',
      color: 'green'
    },
    tokensUsed: 75,
    latencyMs: 1200
  })
}));

dotenv.config({ path: '../../.env.example' });

const app = express();
app.use(express.json());
app.use('/generate', generateRoute);
app.use('/refine', refineRoute);

describe('integration: API Endpoints', () => {
  describe('POST /generate', () => {
    it('returns prompt and metadata', async () => {
      const template = createTemplate({
        id: 'test',
        name: 'Test',
        description: 'Test',
        template: 'Hello {{name}} from {{company}}',
        role: 'Dev',
        useCase: 'Test'
      });
      const context = { name: 'Alice', company: 'Acme' };
      const res = await request(app)
        .post('/generate')
        .send({ template, context });
      expect(res.status).toBe(200);
      expect(res.body.prompt).toBe('Hello Alice from Acme');
      expect(Array.isArray(res.body.missingFields)).toBe(true);
      expect(Array.isArray(res.body.contextUsed)).toBe(true);
      expect(res.body.metadata).toBeDefined();
    });
  });

  describe('GET /refine/types', () => {
    it('returns available refinement types and tools', async () => {
      const res = await request(app)
        .get('/refine/types');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('types');
      expect(res.body).toHaveProperty('tools');
      expect(Array.isArray(res.body.types)).toBe(true);
      expect(Array.isArray(res.body.tools)).toBe(true);
      expect(res.body.types).toContain('specific');
      expect(res.body.types).toContain('concise');
      expect(res.body.tools[0]).toHaveProperty('id');
      expect(res.body.tools[0]).toHaveProperty('name');
      expect(res.body.tools[0]).toHaveProperty('icon');
      expect(res.body.tools[0]).toHaveProperty('description');
    });
  });

  describe('POST /refine', () => {
    it('refines a prompt with default refinement type', async () => {
      const res = await request(app)
        .post('/refine')
        .send({ prompt: 'Write something about AI' });
      expect(res.status).toBe(200);
      expect(res.body.refinedPrompt).toBe('This is a refined and improved prompt with better clarity and structure.');
      expect(res.body.originalPrompt).toBe('Write something about AI');
      expect(res.body.refinementTool).toBeDefined();
      expect(res.body.refinementTool.id).toBe('specific');
      expect(typeof res.body.tokensUsed).toBe('number');
      expect(typeof res.body.latencyMs).toBe('number');
    });

    it('refines a prompt with specific refinement type', async () => {
      const res = await request(app)
        .post('/refine')
        .send({ 
          prompt: 'Write something about AI',
          refinementType: 'concise'
        });
      expect(res.status).toBe(200);
      expect(res.body.refinedPrompt).toBeDefined();
      expect(res.body.originalPrompt).toBe('Write something about AI');
      expect(res.body.refinementTool).toBeDefined();
    });    it('accepts model configuration using default OpenAI config', async () => {
      const modelConfig = {
        provider: 'openai',
        model: DEFAULT_OPENAI_CONFIG.model!,
        temperature: DEFAULT_OPENAI_CONFIG.temperature!,
        maxTokens: DEFAULT_OPENAI_CONFIG.maxTokens!,
        customApiHost: DEFAULT_OPENAI_CONFIG.apiHost,
        customApiKey: DEFAULT_OPENAI_CONFIG.apiKey
      };
      const res = await request(app)
        .post('/refine')
        .send({ 
          prompt: 'Write something about AI',
          refinementType: 'structured',
          modelConfig
        });
      expect(res.status).toBe(200);
      expect(res.body.refinedPrompt).toBeDefined();
    });

    it('returns 400 for missing prompt', async () => {
      const res = await request(app)
        .post('/refine')
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Missing or invalid prompt');
    });

    it('returns 400 for invalid refinement type', async () => {
      const res = await request(app)
        .post('/refine')
        .send({ 
          prompt: 'Write something about AI',
          refinementType: 123
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid refinementType - must be a string');
    });

    it('returns 400 for invalid model config', async () => {
      const res = await request(app)
        .post('/refine')
        .send({ 
          prompt: 'Write something about AI',
          modelConfig: 'invalid'
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid modelConfig - must be an object');
    });
  });
});
