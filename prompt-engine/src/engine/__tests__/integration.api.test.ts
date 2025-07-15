import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import dotenv from 'dotenv';
import generateRoute from '../../routes/generate';
import refineRoute from '../../routes/refine';
import aiGenerateRoute from '../../routes/ai-generate';
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

// Configure the mocks for prompts with dynamic responses
mockRefinePrompt.mockImplementation(async (prompt: string, refinementType: string = 'specific') => {
  const toolMap: Record<string, any> = {
    'specific': { id: 'specific', name: 'More Specific', icon: '🎯', description: 'Add clarity and specificity to reduce ambiguity', color: 'green' },
    'concise': { id: 'concise', name: 'Make Concise', icon: '✂️', description: 'Remove unnecessary words and make it shorter', color: 'blue' },
    'structured': { id: 'structured', name: 'Better Structure', icon: '🏗️', description: 'Improve organization and readability', color: 'yellow' },
    'context': { id: 'context', name: 'Add Context', icon: '📋', description: 'Add more comprehensive context and examples', color: 'orange' },
    'constraints': { id: 'constraints', name: 'Add Constraints', icon: '⚙️', description: 'Add technical constraints and output format guidance', color: 'gray' },
    'roleplay': { id: 'roleplay', name: 'Role-based', icon: '🎭', description: 'Add role-playing elements and persona guidance', color: 'purple' },
    'examples': { id: 'examples', name: 'Add Examples', icon: '💡', description: 'Include practical examples and demonstrations', color: 'cyan' },
    'error-handling': { id: 'error-handling', name: 'Error Handling', icon: '🛡️', description: 'Add robustness and error handling guidance', color: 'red' }
  };
  
  return {
    refinedPrompt: 'This is a refined and improved prompt with better clarity and structure.',
    originalPrompt: prompt,
    refinementTool: toolMap[refinementType] || toolMap['specific'],
    tokensUsed: 75,
    latencyMs: 1200
  };
});

// Configure the mocks for content with dynamic responses
mockRefineContent.mockImplementation(async (content: string, refinementType: string = 'clarity') => {
  const toolMap: Record<string, any> = {
    'clarity': { id: 'clarity', name: 'Improve Clarity', icon: '💎', description: 'Make content clearer and easier to understand', color: 'blue' },
    'professional': { id: 'professional', name: 'Professional Tone', icon: '💼', description: 'Transform content to have a professional business tone', color: 'navy' },
    'engaging': { id: 'engaging', name: 'More Engaging', icon: '✨', description: 'Make content more interesting and captivating', color: 'purple' },
    'concise': { id: 'concise', name: 'Make Concise', icon: '✂️', description: 'Reduce length while maintaining key messages', color: 'green' },
    'detailed': { id: 'detailed', name: 'Add Detail', icon: '🔍', description: 'Expand content with more comprehensive information', color: 'orange' },
    'technical': { id: 'technical', name: 'Technical Precision', icon: '⚙️', description: 'Add technical accuracy and specialized terminology', color: 'gray' },
    'creative': { id: 'creative', name: 'Creative Enhancement', icon: '🎨', description: 'Add creativity and innovative expression', color: 'pink' },
    'persuasive': { id: 'persuasive', name: 'Persuasive Impact', icon: '🎯', description: 'Make content more convincing and influential', color: 'red' }
  };
  
  return {
    refinedContent: 'This is refined and improved content with better clarity and structure.',
    originalContent: content,
    refinementTool: toolMap[refinementType] || toolMap['clarity'],
    tokensUsed: 65,
    latencyMs: 1100
  };
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
    },
    {
      id: 'examples',
      name: 'Add Examples',
      icon: '💡',
      description: 'Include practical examples and demonstrations',
      color: 'cyan'
    },
    {
      id: 'error-handling',
      name: 'Error Handling',
      icon: '🛡️',
      description: 'Add robustness and error handling guidance',
      color: 'red'
    }
  ])
});

// Mock contentRefinerTools as a property
Object.defineProperty(mockContentRefinerTools, 'length', { value: 8 });
Object.defineProperty(mockContentRefinerTools, 'map', {
  value: jest.fn().mockReturnValue([
    {
      id: 'clarity',
      name: 'Improve Clarity',
      icon: '💎',
      description: 'Make content clearer and easier to understand',
      color: 'blue'
    },
    {
      id: 'professional',
      name: 'Professional Tone',
      icon: '💼',
      description: 'Transform content to have a professional business tone',
      color: 'navy'
    },
    {
      id: 'engaging',
      name: 'More Engaging',
      icon: '✨',
      description: 'Make content more interesting and captivating',
      color: 'purple'
    },
    {
      id: 'concise',
      name: 'Make Concise',
      icon: '✂️',
      description: 'Reduce length while maintaining key messages',
      color: 'green'
    },
    {
      id: 'detailed',
      name: 'Add Detail',
      icon: '🔍',
      description: 'Expand content with more comprehensive information',
      color: 'orange'
    },
    {
      id: 'technical',
      name: 'Technical Precision',
      icon: '⚙️',
      description: 'Add technical accuracy and specialized terminology',
      color: 'gray'
    },
    {
      id: 'creative',
      name: 'Creative Enhancement',
      icon: '🎨',
      description: 'Add creativity and innovative expression',
      color: 'pink'
    },
    {
      id: 'persuasive',
      name: 'Persuasive Impact',
      icon: '🎯',
      description: 'Make content more convincing and influential',
      color: 'red'
    }
  ])
});

dotenv.config({ path: '../../.env.example' });

const app = express();
app.use(express.json());
app.use('/generate', generateRoute);
app.use('/ai-generate', aiGenerateRoute);
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

    describe('POST /refine/prompt - Enhanced Edge Cases', () => {
      it('handles empty prompt string', async () => {
        const res = await request(app)
          .post('/refine/prompt')
          .send({ prompt: '' });
        expect(res.status).toBe(200);
        expect(res.body.refinedPrompt).toBeDefined();
        expect(res.body.originalPrompt).toBe('');
      });

      it('handles extremely long prompts', async () => {
        const longPrompt = 'This is a very long prompt. '.repeat(100);
        const res = await request(app)
          .post('/refine/prompt')
          .send({ prompt: longPrompt });
        expect(res.status).toBe(200);
        expect(res.body.originalPrompt).toBe(longPrompt);
        expect(res.body.refinedPrompt).toBeDefined();
      });

      it('handles prompts with special characters and unicode', async () => {
        const specialPrompt = 'Create a prompt with émojis 🚀, symbols ©®™, and spëcial châractèrs! @#$%^&*()';
        const res = await request(app)
          .post('/refine/prompt')
          .send({ prompt: specialPrompt });
        expect(res.status).toBe(200);
        expect(res.body.originalPrompt).toBe(specialPrompt);
        expect(res.body.refinedPrompt).toBeDefined();
      });

      it('tests all available prompt refinement types', async () => {
        const promptTypes = ['specific', 'concise', 'structured', 'context', 'constraints', 'roleplay', 'examples', 'error-handling'];
        
        for (const type of promptTypes) {
          const res = await request(app)
            .post('/refine/prompt')
            .send({ 
              prompt: 'Test prompt for validation',
              refinementType: type 
            });
          expect(res.status).toBe(200);
          expect(res.body.refinementTool.id).toBe(type);
          expect(res.body.refinedPrompt).toBeDefined();
        }
      });

      it('handles unknown refinement type error properly', async () => {
        mockRefinePrompt.mockRejectedValueOnce(new Error('Unknown prompt refinement type: unknown. Available types: specific, concise, structured, context, constraints, roleplay, examples, error-handling'));
        
        const res = await request(app)
          .post('/refine/prompt')
          .send({ 
            prompt: 'Test prompt',
            refinementType: 'unknown' 
          });
        expect(res.status).toBe(400);
        expect(res.body.error).toContain('Unknown prompt refinement type');
      });

      it('handles server errors gracefully', async () => {
        mockRefinePrompt.mockRejectedValueOnce(new Error('Internal server error'));
        
        const res = await request(app)
          .post('/refine/prompt')
          .send({ prompt: 'Test prompt' });
        expect(res.status).toBe(500);
        expect(res.body.error).toBe('Internal server error');
      });
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
        .post('/refine/content')
        .send({ 
          content: 'This content needs improvement',
          refinementType: 'technical',
          modelConfig
        });
      expect(res.status).toBe(200);
      expect(res.body.refinedContent).toBeDefined();
    });

    it('returns 400 for missing content', async () => {
      const res = await request(app)
        .post('/refine/content')
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Missing or invalid content');
    });

    it('returns 400 for invalid refinement type', async () => {
      const res = await request(app)
        .post('/refine/content')
        .send({ 
          content: 'This content needs improvement',
          refinementType: 123
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid refinementType - must be a string');
    });

    it('returns 400 for invalid model config', async () => {
      const res = await request(app)
        .post('/refine/content')
        .send({ 
          content: 'This content needs improvement',
          modelConfig: 'invalid'
        });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid modelConfig - must be an object');
    });

    describe('POST /refine/content - Enhanced Edge Cases', () => {
      it('handles empty content string', async () => {
        const res = await request(app)
          .post('/refine/content')
          .send({ content: '' });
        expect(res.status).toBe(200);
        expect(res.body.refinedContent).toBeDefined();
        expect(res.body.originalContent).toBe('');
      });

      it('handles extremely long content', async () => {
        const longContent = 'This is very long content that needs refinement. '.repeat(150);
        const res = await request(app)
          .post('/refine/content')
          .send({ content: longContent });
        expect(res.status).toBe(200);
        expect(res.body.originalContent).toBe(longContent);
        expect(res.body.refinedContent).toBeDefined();
      });

      it('handles content with special characters and formatting', async () => {
        const specialContent = `Content with:
        - Bullet points
        - Line breaks
        - Special chars: @#$%^&*()
        - Unicode: émojis 🎯, accënts
        - JSON: {"key": "value"}
        - Code: function test() { return true; }`;
        
        const res = await request(app)
          .post('/refine/content')
          .send({ content: specialContent });
        expect(res.status).toBe(200);
        expect(res.body.originalContent).toBe(specialContent);
        expect(res.body.refinedContent).toBeDefined();
      });

      it('tests all available content refinement types', async () => {
        const contentTypes = ['clarity', 'professional', 'engaging', 'concise', 'detailed', 'technical', 'creative', 'persuasive'];
        
        for (const type of contentTypes) {
          const res = await request(app)
            .post('/refine/content')
            .send({ 
              content: 'Test content for validation',
              refinementType: type 
            });
          expect(res.status).toBe(200);
          expect(res.body.refinementTool.id).toBe(type);
          expect(res.body.refinedContent).toBeDefined();
        }
      });

      it('handles unknown refinement type error properly', async () => {
        mockRefineContent.mockRejectedValueOnce(new Error('Unknown content refinement type: unknown. Available types: clarity, professional, engaging, concise, detailed, technical, creative, persuasive'));
        
        const res = await request(app)
          .post('/refine/content')
          .send({ 
            content: 'Test content',
            refinementType: 'unknown' 
          });
        expect(res.status).toBe(400);
        expect(res.body.error).toContain('Unknown content refinement type');
      });

      it('handles server errors gracefully', async () => {
        mockRefineContent.mockRejectedValueOnce(new Error('Internal server error'));
        
        const res = await request(app)
          .post('/refine/content')
          .send({ content: 'Test content' });
        expect(res.status).toBe(500);
        expect(res.body.error).toBe('Internal server error');
      });
    });
  });

  describe('GET /refine/types - Enhanced Coverage', () => {
    it('validates the complete structure of refinement types response', async () => {
      const res = await request(app)
        .get('/refine/types');
      
      expect(res.status).toBe(200);
      
      // Validate prompt refinement types structure
      expect(res.body.prompt.types).toEqual(
        expect.arrayContaining(['specific', 'concise', 'structured', 'context', 'constraints', 'roleplay', 'examples', 'error-handling'])
      );
      expect(res.body.prompt.types).toHaveLength(8);
      
      // Validate content refinement types structure
      expect(res.body.content.types).toEqual(
        expect.arrayContaining(['clarity', 'professional', 'engaging', 'concise', 'detailed', 'technical', 'creative', 'persuasive'])
      );
      expect(res.body.content.types).toHaveLength(8);
      
      // Validate tools structure for prompts
      expect(res.body.prompt.tools).toHaveLength(8);
      res.body.prompt.tools.forEach((tool: any) => {
        expect(tool).toHaveProperty('id');
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('icon');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('color');
        expect(typeof tool.id).toBe('string');
        expect(typeof tool.name).toBe('string');
        expect(typeof tool.icon).toBe('string');
        expect(typeof tool.description).toBe('string');
        expect(typeof tool.color).toBe('string');
      });
      
      // Validate tools structure for content
      expect(res.body.content.tools).toHaveLength(8);
      res.body.content.tools.forEach((tool: any) => {
        expect(tool).toHaveProperty('id');
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('icon');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('color');
        expect(typeof tool.id).toBe('string');
        expect(typeof tool.name).toBe('string');
        expect(typeof tool.icon).toBe('string');
        expect(typeof tool.description).toBe('string');
        expect(typeof tool.color).toBe('string');
      });
    });    it('ensures tool IDs match the types arrays', async () => {
      const res = await request(app)
        .get('/refine/types');
      
      // Extract tool IDs from tools arrays
      const promptToolIds = res.body.prompt.tools.map((tool: any) => tool.id);
      const contentToolIds = res.body.content.tools.map((tool: any) => tool.id);
      
      // Verify tool IDs match the types arrays
      expect(promptToolIds.sort()).toEqual(res.body.prompt.types.sort());
      expect(contentToolIds.sort()).toEqual(res.body.content.types.sort());
    });
  });
  describe('POST /ai-generate', () => {
    it.skip('generates AI response from simple text', async () => {
      const res = await request(app)
        .post('/ai-generate')
        .send({ text: 'Write a brief introduction about artificial intelligence.' });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('text');
      expect(res.body).toHaveProperty('result');
      expect(res.body).toHaveProperty('tokensUsed');
      expect(res.body).toHaveProperty('latencyMs');
      expect(res.body).toHaveProperty('modelConfig');
      expect(res.body).toHaveProperty('timestamp');
      
      expect(res.body.text).toBe('Write a brief introduction about artificial intelligence.');
      expect(typeof res.body.result).toBe('string');
      expect(res.body.result.length).toBeGreaterThan(0);
      expect(typeof res.body.tokensUsed).toBe('number');
      expect(typeof res.body.latencyMs).toBe('number');
      expect(res.body.modelConfig.provider).toBe('openai');
      expect(res.body.modelConfig.model).toBe(DEFAULT_OPENAI_CONFIG.model);
    });

    it.skip('accepts custom model configuration', async () => {
      const modelConfig = {
        provider: 'openai',
        model: 'GPT-4o',
        temperature: 0.5,
        maxTokens: 1500,
        customApiHost: DEFAULT_OPENAI_CONFIG.apiHost,
        customApiKey: DEFAULT_OPENAI_CONFIG.apiKey
      };
      
      const res = await request(app)
        .post('/ai-generate')
        .send({ 
          text: 'Explain machine learning in simple terms.',
          modelConfig 
        });
      
      expect(res.status).toBe(200);
      expect(res.body.modelConfig.temperature).toBe(0.5);
      expect(res.body.modelConfig.maxTokens).toBe(1500);
      expect(res.body.modelConfig.model).toBe('GPT-4o');
    });

    it.skip('accepts system prompt', async () => {
      const res = await request(app)
        .post('/ai-generate')
        .send({ 
          text: 'What is the capital of France?',
          systemPrompt: 'You are a helpful geography teacher. Provide clear and educational answers.'
        });
      
      expect(res.status).toBe(200);
      expect(res.body.result).toBeDefined();
      expect(typeof res.body.result).toBe('string');
    });

    it('returns 400 for missing text', async () => {
      const res = await request(app)
        .post('/ai-generate')
        .send({});
      
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Missing or invalid text - must be a non-empty string');
    });

    it('returns 400 for empty text', async () => {
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

    it('returns 400 for invalid text type', async () => {
      const res = await request(app)
        .post('/ai-generate')
        .send({ text: 123 });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Missing or invalid text - must be a non-empty string');
    });

    it('returns 400 for invalid model config', async () => {
      const res = await request(app)
        .post('/ai-generate')
        .send({ 
          text: 'Test text',
          modelConfig: 'invalid'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid modelConfig - must be an object');
    });

    it('returns 400 for invalid system prompt type', async () => {
      const res = await request(app)
        .post('/ai-generate')
        .send({ 
          text: 'Test text',
          systemPrompt: 123
        });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid systemPrompt - must be a string');
    });

    it('returns 400 for unsupported provider', async () => {
      const res = await request(app)
        .post('/ai-generate')
        .send({ 
          text: 'Test text',
          modelConfig: { provider: 'anthropic' }
        });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Only OpenAI provider is currently supported');
    });    it.skip('handles various text content types', async () => {
      const testCases = [
        'Simple question: What is AI?',
        'Multi-line\ncontent\nwith breaks',
        'Special chars: @#$%^&*()',
        'Unicode: émojis 🤖, accënts',
        'JSON: {"key": "value", "number": 42}',
        'Code: function test() { return "hello"; }',
        'Very long content that exceeds normal prompt length. '.repeat(50)
      ];

      for (const testText of testCases) {
        const res = await request(app)
          .post('/ai-generate')
          .send({ text: testText });
          expect(res.status).toBe(200);
        expect(res.body.text).toBe(testText.trim());
        expect(res.body.result).toBeDefined();
        expect(typeof res.body.result).toBe('string');
      }
    }, 30000); // Increase timeout to 30 seconds

    it.skip('trims whitespace from input text', async () => {      const res = await request(app)
        .post('/ai-generate')
        .send({ text: '  \n  What is machine learning?  \t  ' });
      
      expect(res.status).toBe(200);
      expect(res.body.text).toBe('What is machine learning?');
    }, 10000); // Increase timeout to 10 seconds

    it.skip('includes latency measurement', async () => {
      const res = await request(app)
        .post('/ai-generate')
        .send({ text: 'Quick test.' });
      
      expect(res.status).toBe(200);
      expect(typeof res.body.latencyMs).toBe('number');
      expect(res.body.latencyMs).toBeGreaterThan(0);
    });

    it.skip('includes timestamp in ISO format', async () => {
      const res = await request(app)
        .post('/ai-generate')
        .send({ text: 'Test timestamp.' });
      
      expect(res.status).toBe(200);
      expect(res.body.timestamp).toBeDefined();
      expect(new Date(res.body.timestamp)).toBeInstanceOf(Date);
      expect(res.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it.skip('uses default OpenAI configuration when no model config provided', async () => {
      const res = await request(app)
        .post('/ai-generate')
        .send({ text: 'Test default config.' });
      
      expect(res.status).toBe(200);
      expect(res.body.modelConfig.provider).toBe('openai');
      expect(res.body.modelConfig.model).toBe(DEFAULT_OPENAI_CONFIG.model);
      expect(res.body.modelConfig.temperature).toBe(DEFAULT_OPENAI_CONFIG.temperature);
      expect(res.body.modelConfig.maxTokens).toBe(DEFAULT_OPENAI_CONFIG.maxTokens);
      expect(res.body.modelConfig.customApiHost).toBe(DEFAULT_OPENAI_CONFIG.apiHost);
      expect(res.body.modelConfig.customApiKey).toBe(DEFAULT_OPENAI_CONFIG.apiKey);
    });
  });
});
