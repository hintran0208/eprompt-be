# @eprompt/prompt-engine

A comprehensive Node.js + TypeScript library and API for intelligent prompt generation, refinement, and AI integration. Designed for production use with robust error handling, comprehensive testing, and OpenAI integration.

## 🌟 Features

### Core Functionality
- **Template-based prompt generation** using Handlebars syntax
- **Context variable substitution** with validation and type safety
- **Missing field detection** and comprehensive error reporting
- **AI-powered prompt refinement** with multiple refinement strategies
- **OpenAI API integration** with streaming support and custom configurations
- **Production-ready Express API** with comprehensive error handling

### Refinement Tools
- **Concise**: Remove unnecessary words while preserving meaning
- **Specific**: Add clarity and specificity to reduce ambiguity
- **Structured**: Improve organization with better sections and flow
- **Context**: Add relevant background information and examples
- **Constraints**: Add technical constraints and output specifications
- **Roleplay**: Transform prompts with role-playing instructions

### Developer Experience
- **Full TypeScript support** with comprehensive type definitions
- **Comprehensive test suite** (unit, integration, E2E)
- **Development server** with hot reload
- **Production build** with optimized output
- **Library and API modes** for flexible usage

## 🚀 Quick Start

### Installation
```bash
npm install @eprompt/prompt-engine
```

### Basic Usage as a Library
```typescript
import { generatePrompt, createTemplate, refinePrompt } from '@eprompt/prompt-engine';

// Create a template
const template = createTemplate({
  id: 'code-review',
  name: 'Code Review Template',
  description: 'Generate code review prompts',
  template: `As a {{role}}, review the following {{language}} code:

\`\`\`{{language}}
{{code}}
\`\`\`

Please provide feedback on:
- Correctness
- Performance
- Best practices
- Potential improvements`,
  role: 'Code Reviewer',
  useCase: 'Code Review'
});

// Generate a prompt
const context = {
  role: 'Senior Software Engineer',
  language: 'JavaScript',
  code: 'function sum(arr) { return arr.reduce((a, b) => a + b, 0); }'
};

const result = generatePrompt(template, context);
console.log(result.prompt);
// Output: Fully formatted prompt with context variables substituted

// Check for missing fields
if (result.missingFields.length > 0) {
  console.log('Missing required fields:', result.missingFields);
}

// Refine a prompt using AI
const refinementResult = await refinePrompt('Write something about AI', 'specific');
console.log(refinementResult.refinedPrompt); // AI-enhanced, much more detailed prompt
console.log(refinementResult.tokensUsed); // Tokens consumed by the AI
console.log(refinementResult.latencyMs); // Response time in milliseconds
```

### Running as an API Server
```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

## 📚 API Documentation

### REST Endpoints

#### POST /generate
Generate a prompt from a template and context.

**Request:**
```json
{
  "template": {
    "id": "greeting",
    "name": "Greeting Template",
    "description": "Generate personalized greetings",
    "template": "Hello {{name}}! Welcome to {{platform}}. As a {{role}}, you have access to {{features}}.",
    "role": "Assistant",
    "useCase": "User Onboarding",
    "requiredFields": ["name", "platform"],
    "optionalFields": ["role", "features"]
  },
  "context": {
    "name": "Alice",
    "platform": "ePrompt",
    "role": "developer",
    "features": "advanced AI tools"
  }
}
```

**Response:**
```json
{
  "prompt": "Hello Alice! Welcome to ePrompt. As a developer, you have access to advanced AI tools.",
  "missingFields": [],
  "contextUsed": ["name", "platform", "role", "features"],
  "metadata": {
    "templateId": "greeting",
    "templateName": "Greeting Template",
    "generatedAt": "2025-07-09T10:30:00.000Z",
    "hasRequiredFields": true
  }
}
```

#### POST /refine
Refine and optimize a prompt using AI-powered refinement tools.

**Request:**
```json
{
  "prompt": "Write something about AI",
  "refinementType": "specific",
  "modelConfig": {
    "provider": "openai",
    "model": "GPT-4o",
    "temperature": 0.7,
    "maxTokens": 2000
  }
}
```

**Response:**
```json
{
  "refinedPrompt": "Create a comprehensive guide about artificial intelligence that covers the following aspects: 1) Definition and core concepts of AI, 2) Historical development and key milestones, 3) Current applications across various industries, 4) Future potential and implications for society, 5) Ethical considerations and challenges. Please provide specific examples for each section and ensure the content is accessible to a general audience while maintaining technical accuracy.",
  "originalPrompt": "Write something about AI",
  "refinementTool": {
    "id": "specific",
    "name": "More Specific",
    "icon": "🎯",
    "description": "Add clarity and specificity to reduce ambiguity",
    "color": "green"
  },
  "tokensUsed": 156,
  "latencyMs": 1250
}
```

#### GET /refine/types
Get all available refinement types and tools.

**Response:**
```json
{
  "types": ["concise", "specific", "structured", "context", "constraints", "roleplay"],
  "tools": [
    {
      "id": "concise",
      "name": "Make Concise",
      "icon": "✂️",
      "description": "Remove unnecessary words and make it shorter",
      "color": "blue"
    },
    {
      "id": "specific",
      "name": "More Specific", 
      "icon": "🎯",
      "description": "Add clarity and specificity to reduce ambiguity",
      "color": "green"
    },
    {
      "id": "structured",
      "name": "Better Structure",
      "icon": "🏗️", 
      "description": "Improve organization and readability",
      "color": "indigo"
    },
    {
      "id": "context",
      "name": "Add Context",
      "icon": "📋",
      "description": "Add more comprehensive context and examples", 
      "color": "orange"
    },
    {
      "id": "constraints",
      "name": "Add Constraints",
      "icon": "⚙️",
      "description": "Add technical constraints and output format guidance",
      "color": "gray"
    },
    {
      "id": "roleplay",
      "name": "Role-based",
      "icon": "🎭",
      "description": "Add role-playing elements and persona guidance",
      "color": "purple"
    }
  ]
}
}
```

### Error Responses
All endpoints return consistent error formats:

```json
{
  "error": "Missing or invalid template",
  "details": "The template object must include a 'template' field"
}
```

**Status Codes:**
- `200`: Success
- `400`: Bad Request (invalid input)
- `500`: Internal Server Error

## 🔧 Advanced Usage

### AI-Powered Prompt Generation
```typescript
import { generateAndRunPrompt, createTemplate, DEFAULT_OPENAI_CONFIG } from '@eprompt/prompt-engine';

const template = createTemplate({
  id: 'blog-post',
  name: 'Blog Post Generator',
  description: 'Generate blog post outlines',
  template: 'Create a comprehensive blog post outline about {{topic}} for {{audience}}. Include {{sections}} main sections.',
  role: 'Content Creator',
  useCase: 'Content Generation'
});

const context = {
  topic: 'machine learning',
  audience: 'beginners',
  sections: '5'
};

const modelConfig = {
  provider: 'openai' as const,
  model: 'GPT-4o',
  temperature: 0.7,
  maxTokens: 1000
};

const result = await generateAndRunPrompt(template, context, modelConfig);
console.log('Generated content:', result.result);
console.log('Tokens used:', result.tokensUsed);
console.log('Latency:', result.latencyMs, 'ms');
```

### Using Refinement Tools
```typescript
import { refinerTools } from '@eprompt/prompt-engine';

// Get all available refinement tools
console.log('Available tools:', refinerTools.map(t => t.name));

// Use a specific refinement tool
const specificTool = refinerTools.find(t => t.id === 'specific');
const originalPrompt = 'Write something about AI';
const metaPrompt = `${specificTool.prompt}\n\nOriginal Prompt: "${originalPrompt}"`;

// Use with AI to get refined prompt
const refinedResult = await generateAndRunPrompt(
  createTemplate({
    id: 'refinement',
    name: 'Prompt Refinement',
    description: 'Refine prompts',
    template: metaPrompt,
    role: 'Prompt Engineer',
    useCase: 'Refinement'
  }),
  {},
  modelConfig
);
```

### Custom Template Creation
```typescript
import { createTemplate, extractTemplateVariables } from '@eprompt/prompt-engine';

// Extract variables from template string
const templateString = 'Hello {{name}}, your {{item}} is ready for {{action}}.';
const variables = extractTemplateVariables(templateString);
console.log(variables); // ['name', 'item', 'action']

// Create template with automatic variable detection
const template = createTemplate({
  id: 'notification',
  name: 'Notification Template',
  description: 'Generic notification template',
  template: templateString,
  role: 'System',
  useCase: 'Notifications'
  // requiredFields automatically set to extracted variables
});
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run specific test suites
npm test -- --testNamePattern="unit"
npm test -- --testNamePattern="integration" 
npm test -- --testNamePattern="e2e"

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Structure
```
src/engine/__tests__/
├── generator.unit.test.ts      # Core generation logic
├── refiner.unit.test.ts        # AI-powered refinement (unit tests)
├── refinerTools.unit.test.ts   # Refinement tool definitions
├── openai.unit.test.ts         # OpenAI client functionality
├── openai.integration.test.ts  # OpenAI integration tests
├── integration.api.test.ts     # API endpoint integration
├── e2e.userFlow.test.ts        # Complete user workflows
└── e2e.refiner.test.ts         # E2E refinement tests with real AI calls
```
```

### Example Test Output
```
--- OPENAI CONFIG ---
API Host: https://aiportalapi.stu-platform.live/jpe/v1
API Key: Bearer sk-dwFEogyru-tSQqgObMgpKw
Model: GPT-4o
Temperature: 0.7
Max Tokens: 2000

--- INPUT TO AI ---
Prompt: Say hello to the world.

--- AI RESPONSE ---
Content: Hello, World! 🌍✨
Tokens Used: 21
```

## 🔐 Configuration

### Environment Variables
```env
# OpenAI Configuration (defaults provided)
OPENAI_API_KEY=sk-dwFEogyru-tSQqgObMgpKw
OPENAI_API_HOST=https://aiportalapi.stu-platform.live/jpe/v1
OPENAI_MODEL=GPT-4o
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=2000

# Server Configuration
PORT=3000
NODE_ENV=development
```

### Custom OpenAI Configuration
```typescript
import { createOpenAIClient, OpenAIConfig } from '@eprompt/prompt-engine';

const customConfig: OpenAIConfig = {
  apiHost: 'https://your-custom-api.com/v1',
  apiKey: 'Bearer your-api-key',
  model: 'gpt-4',
  temperature: 0.5,
  maxTokens: 1500
};

const client = createOpenAIClient(customConfig);
```

## 📦 TypeScript Types

### Core Types
```typescript
// Template definition
type PromptTemplate = {
  id: string;
  name: string;
  description: string;
  template: string;
  role: string;
  useCase: string;
  requiredFields: string[];
  optionalFields?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
};

// Context for variable substitution
type PromptContext = {
  [key: string]: string | number | boolean | Date | undefined;
};

// Generation result
type PromptOutput = {
  prompt: string;
  missingFields: string[];
  contextUsed: string[];
  metadata?: Record<string, any>;
};

// AI model configuration
type ModelConfig = {
  provider: 'openai' | 'anthropic' | 'google' | 'local';
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  customApiHost?: string;
  customApiKey?: string;
};

// AI generation result
type PromptResult = {
  prompt: string;
  result: string;
  sections?: Record<string, string>;
  tokensUsed?: number;
  latencyMs?: number;
  modelConfig: ModelConfig;
  timestamp: Date;
};

// Refinement tool definition
type RefinerTool = {
  id: string;
  name: string;
  icon: string;
  prompt: string;
  description: string;
  color: string;
};

// Refinement result
type RefinementResult = {
  refinedPrompt: string;
  originalPrompt: string;
  refinementTool: RefinerTool;
  tokensUsed?: number;
  latencyMs?: number;
};
```

## 🛠️ Development

### Available Scripts
```bash
npm run dev      # Start development server with hot reload
npm run build    # Build TypeScript to JavaScript
npm start        # Run production server
npm test         # Run comprehensive test suite
npm run clean    # Clean build artifacts
```

### Project Structure
```
src/
├── engine/              # Core engine logic
│   ├── generator.ts     # Prompt generation functions
│   ├── refiner.ts       # Prompt refinement tools
│   ├── openai.ts        # OpenAI API integration
│   ├── types.ts         # TypeScript type definitions
│   ├── index.ts         # Public API exports
│   └── __tests__/       # Test suite
├── routes/              # Express API routes
│   ├── generate.ts      # /generate endpoint
│   └── refine.ts        # /refine endpoint
└── server.ts           # Express server setup
```

### Building and Publishing
```bash
# Build for production
npm run build

# Publish to npm (if configured)
npm publish

# Create distributable package
npm pack
```

## 🚀 Deployment

### Heroku
```bash
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set OPENAI_API_KEY=your_key

# Deploy
git push heroku main
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/
COPY tsconfig.json ./
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### PM2 (Production)
```json
{
  "name": "prompt-engine",
  "script": "dist/server.js",
  "instances": "max",
  "exec_mode": "cluster",
  "env": {
    "NODE_ENV": "production",
    "PORT": 3000
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for new functionality
5. Run the test suite: `npm test`
6. Build the project: `npm run build`
7. Commit your changes: `git commit -m 'Add amazing feature'`
8. Push to the branch: `git push origin feature/amazing-feature`
9. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Add tests for all new functionality
- Update documentation for API changes
- Use conventional commit messages
- Ensure all tests pass before submitting

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Related Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Handlebars Template Documentation](https://handlebarsjs.com/guide/)
- [Express.js Documentation](https://expressjs.com/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)

## 📞 Support

For questions, issues, or contributions:
- 📧 Contact the ePrompt team
- 🐛 [Open an issue](https://github.com/your-org/eprompt-be/issues)
- 📖 Check the comprehensive test suite for usage examples
- 🔍 Review the source code for implementation details
