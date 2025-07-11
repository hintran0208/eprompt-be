import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import dotenv from 'dotenv';
import generateRoute from '../../routes/generate';
import refineRoute from '../../routes/refine';
import { createTemplate } from '../generator';
import { DEFAULT_OPENAI_CONFIG } from '../openai';

// Mock the refiner module functions
jest.mock('../refiner');

// Import the mocked module
import { 
  refinePrompt, 
  refineContent,
  getPromptRefinementTypes, 
  getContentRefinementTypes,
  promptRefinerTools,
  contentRefinerTools
} from '../refiner';

// Setup the mocks
const mockRefinePrompt = refinePrompt as jest.MockedFunction<typeof refinePrompt>;
const mockRefineContent = refineContent as jest.MockedFunction<typeof refineContent>;
const mockGetPromptRefinementTypes = getPromptRefinementTypes as jest.MockedFunction<typeof getPromptRefinementTypes>;
const mockGetContentRefinementTypes = getContentRefinementTypes as jest.MockedFunction<typeof getContentRefinementTypes>;
const mockPromptRefinerTools = promptRefinerTools as any;
const mockContentRefinerTools = contentRefinerTools as any;

// Configure the mocks for prompts
mockRefinePrompt.mockResolvedValue({
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
});

// Configure the mocks for content
mockRefineContent.mockResolvedValue({
  refinedContent: 'This is refined and improved content with better clarity and structure.',
  originalContent: 'This content needs improvement',
  refinementTool: {
    id: 'clarity',
    name: 'Improve Clarity',
    icon: '💎',
    prompt: 'Improve the clarity and readability of the following content:',
    description: 'Make content clearer and easier to understand',
    color: 'blue'
  },
  tokensUsed: 65,
  latencyMs: 1100
});

mockGetPromptRefinementTypes.mockReturnValue(['specific', 'concise', 'structured', 'context', 'constraints', 'roleplay', 'examples', 'error-handling']);
mockGetContentRefinementTypes.mockReturnValue(['clarity', 'professional', 'engaging', 'concise', 'detailed', 'technical', 'creative', 'persuasive']);

// Mock promptRefinerTools as a property
Object.defineProperty(mockPromptRefinerTools, 'length', { value: 8 });
Object.defineProperty(mockPromptRefinerTools, 'map', {
  value: jest.fn().mockReturnValue([
    {
      id: 'concise',
      name: 'Make Concise',
      icon: '✂️',
      description: 'Remove unnecessary words and make it shorter',
      color: 'blue'
    },
    {
      id: 'specific',
      name: 'More Specific',
      icon: '🎯',
      description: 'Add clarity and specificity to reduce ambiguity',
      color: 'green'
    },
    {
      id: 'structured',
      name: 'Better Structure',
      icon: '🏗️',
      description: 'Improve organization and readability',
      color: 'yellow'
    },
    {
      id: 'context',
      name: 'Add Context',
      icon: '📋',
      description: 'Add more comprehensive context and examples',
      color: 'orange'
    },
    {
      id: 'constraints',
      name: 'Add Constraints',
      icon: '⚙️',
      description: 'Add technical constraints and output format guidance',
      color: 'gray'
    },
    {
      id: 'roleplay',
      name: 'Role-based',
      icon: '🎭',
      description: 'Add role-playing elements and persona guidance',
      color: 'purple'
    }
  ])
});

// Mock contentRefinerTools as a property
Object.defineProperty(mockContentRefinerTools, 'length', { value: 8 });
Object.defineProperty(mockContentRefinerTools, 'map', {
  value: jest.fn().mockReturnValue([])
});

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
      expect(res.body).toHaveProperty('prompt');
      expect(res.body).toHaveProperty('content');
      expect(res.body.prompt).toHaveProperty('types');
      expect(res.body.prompt).toHaveProperty('tools');
      expect(res.body.content).toHaveProperty('types');
      expect(res.body.content).toHaveProperty('tools');
      expect(Array.isArray(res.body.prompt.types)).toBe(true);
      expect(Array.isArray(res.body.prompt.tools)).toBe(true);
      expect(res.body.prompt.types).toContain('specific');
      expect(res.body.prompt.types).toContain('concise');
      expect(res.body.prompt.tools[0]).toHaveProperty('id');
      expect(res.body.prompt.tools[0]).toHaveProperty('name');
      expect(res.body.prompt.tools[0]).toHaveProperty('icon');
      expect(res.body.prompt.tools[0]).toHaveProperty('description');
    });
  });

  describe('POST /refine/prompt', () => {
    it('refines a prompt with default refinement type', async () => {
      const res = await request(app)
        .post('/refine/prompt')
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
        .post('/refine/prompt')
        .send({ 
          prompt: 'Write something about AI',
          refinementType: 'concise'
        });
      expect(res.status).toBe(200);
      expect(res.body.refinedPrompt).toBeDefined();
      expect(res.body.originalPrompt).toBe('Write something about AI');
      expect(res.body.refinementTool).toBeDefined();
    });

    it('accepts model configuration using default OpenAI config', async () => {
      const modelConfig = {
        provider: 'openai',
        model: DEFAULT_OPENAI_CONFIG.model!,
        temperature: DEFAULT_OPENAI_CONFIG.temperature!,
        maxTokens: DEFAULT_OPENAI_CONFIG.maxTokens!,
        customApiHost: DEFAULT_OPENAI_CONFIG.apiHost,
        customApiKey: DEFAULT_OPENAI_CONFIG.apiKey
      };
      const res = await request(app)
        .post('/refine/prompt')
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
        .post('/refine/prompt')
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Missing or invalid prompt');
    });

    it('returns 400 for invalid refinement type', async () => {
      const res = await request(app)
        .post('/refine/prompt')
        .send({ 
          prompt: 'Write something about AI',
          refinementType: 123
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid refinementType - must be a string');
    });

    it('returns 400 for invalid model config', async () => {
      const res = await request(app)
        .post('/refine/prompt')
        .send({ 
          prompt: 'Write something about AI',
          modelConfig: 'invalid'
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid modelConfig - must be an object');
    });
  });

  describe('POST /refine/content', () => {
    it('refines content with default refinement type', async () => {
      const res = await request(app)
        .post('/refine/content')
        .send({ content: 'This content needs improvement' });
      expect(res.status).toBe(200);
      expect(res.body.refinedContent).toBe('This is refined and improved content with better clarity and structure.');
      expect(res.body.originalContent).toBe('This content needs improvement');
      expect(res.body.refinementTool).toBeDefined();
      expect(res.body.refinementTool.id).toBe('clarity');
      expect(typeof res.body.tokensUsed).toBe('number');
      expect(typeof res.body.latencyMs).toBe('number');
    });

    it('refines content with specific refinement type', async () => {
      const res = await request(app)
        .post('/refine/content')
        .send({ 
          content: 'This content needs improvement',
          refinementType: 'professional'
        });
      expect(res.status).toBe(200);
      expect(res.body.refinedContent).toBeDefined();
      expect(res.body.originalContent).toBe('This content needs improvement');
      expect(res.body.refinementTool).toBeDefined();
    });

    it('returns 400 for missing content', async () => {
      const res = await request(app)
        .post('/refine/content')
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Missing or invalid content');
    });
  });
});
