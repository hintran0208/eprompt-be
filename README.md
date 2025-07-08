# ePrompt Backend

This repository contains the backend services and core prompt engine for the ePrompt/PromptVerse platform. It provides a production-ready API for prompt generation, refinement, and AI integration built with Node.js and TypeScript.

## 🏗️ Repository Structure

```
eprompt-be/
├── prompt-engine/          # Core prompt engine package
│   ├── src/
│   │   ├── engine/         # Core prompt generation logic
│   │   │   ├── generator.ts    # Prompt generation and AI integration
│   │   │   ├── refiner.ts      # Prompt refinement tools
│   │   │   ├── openai.ts       # OpenAI API client
│   │   │   ├── types.ts        # TypeScript type definitions
│   │   │   └── __tests__/      # Comprehensive test suite
│   │   ├── routes/         # Express API routes
│   │   │   ├── generate.ts     # POST /generate endpoint
│   │   │   └── refine.ts       # POST /refine endpoint
│   │   └── server.ts       # Express server setup
│   ├── package.json        # Dependencies and scripts
│   ├── tsconfig.json       # TypeScript configuration
│   └── jest.config.js      # Test configuration
├── app.json               # Heroku app configuration
├── Procfile               # Heroku process configuration
├── deploy.sh              # Deployment script
├── start.sh               # Local startup script
├── DEPLOYMENT.md          # Deployment instructions
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm 9+
- OpenAI API key (default provided for development)

### 1. Install Dependencies
```bash
cd prompt-engine
npm install
```

### 2. Set Up Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration (optional - defaults provided)
# OPENAI_API_KEY=your_api_key_here
# PORT=3000
```

### 3. Run the Server
```bash
# Development mode with auto-reload
npm run dev

# Production build and start
npm run build
npm start
```

The server will start on `http://localhost:3000`

### 4. Run Tests
```bash
# Run all tests
npm test

# Run specific test types
npm test -- --testNamePattern="unit"
npm test -- --testNamePattern="integration"
npm test -- --testNamePattern="e2e"
```

## 📚 API Documentation

### Base URL
- Development: `http://localhost:3000`
- Production: `https://your-app.herokuapp.com`

### Endpoints

#### POST /generate
Generates a prompt from a template and context variables.

**Request Body:**
```json
{
  "template": {
    "id": "greeting",
    "name": "Greeting Template",
    "description": "Generate a friendly greeting",
    "template": "Hello {{name}}! Welcome to {{platform}}.",
    "role": "Assistant",
    "useCase": "Greeting",
    "requiredFields": ["name", "platform"],
    "optionalFields": []
  },
  "context": {
    "name": "Alice",
    "platform": "ePrompt"
  }
}
```

**Response:**
```json
{
  "prompt": "Hello Alice! Welcome to ePrompt.",
  "missingFields": [],
  "contextUsed": ["name", "platform"],
  "metadata": {
    "templateId": "greeting",
    "templateName": "Greeting Template",
    "generatedAt": "2025-07-09T10:30:00.000Z",
    "hasRequiredFields": true
  }
}
```

**Error Responses:**
- `400`: Missing or invalid template/context
- `500`: Internal server error

#### POST /refine
Refines a prompt using AI-powered refinement tools to improve clarity, structure, and effectiveness.

**Request Body:**
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
  "refinedPrompt": "Create a comprehensive guide about artificial intelligence that covers the following aspects: 1) Definition and core concepts, 2) Historical development and milestones, 3) Current applications across industries, 4) Future potential and implications, 5) Ethical considerations and challenges. Please provide specific examples and ensure the content is accessible to a general audience.",
  "originalPrompt": "Write something about AI",
  "refinementTool": {
    "id": "specific",
    "name": "More Specific",
    "icon": "🎯",
    "description": "Add clarity and specificity to reduce ambiguity",
    "color": "green"
  },
  "tokensUsed": 150,
  "latencyMs": 1200
}
```

#### GET /refine/types
Gets all available refinement types and tools.

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
    }
  ]
}
```

## 🔧 Usage Examples

### Basic Prompt Generation
```bash
curl -X POST http://localhost:3000/generate \
  -H "Content-Type: application/json" \
  -d '{
    "template": {
      "id": "code-review",
      "name": "Code Review",
      "description": "Review code snippet",
      "template": "As a {{role}}, review this code:\n\n```{{language}}\n{{code}}\n```\n\nProvide feedback on:\n- Correctness\n- Performance\n- Best practices",
      "role": "Code Reviewer",
      "useCase": "Code Review",
      "requiredFields": ["role", "language", "code"]
    },
    "context": {
      "role": "Senior Developer",
      "language": "javascript",
      "code": "function sum(arr) { return arr.reduce((a, b) => a + b, 0); }"
    }
  }'
```

### Prompt Refinement
```bash
curl -X POST http://localhost:3000/refine \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write something about AI",
    "refinementType": "specific",
    "modelConfig": {
      "provider": "openai",
      "model": "GPT-4o",
      "temperature": 0.7,
      "maxTokens": 2000
    }
  }'
```

### Get Available Refinement Types
```bash
curl -X GET http://localhost:3000/refine/types
```

### Using as a Library
```typescript
import { generatePrompt, createTemplate, refinePrompt } from '@eprompt/prompt-engine';

// Create a template
const template = createTemplate({
  id: 'greeting',
  name: 'Greeting Template',
  description: 'Generate a friendly greeting',
  template: 'Hello {{name}}! Welcome to {{platform}}.',
  role: 'Assistant',
  useCase: 'Greeting'
});

// Generate a prompt
const context = { name: 'Alice', platform: 'ePrompt' };
const result = generatePrompt(template, context);
console.log(result.prompt); // "Hello Alice! Welcome to ePrompt."

// Refine a prompt using AI
const refined = await refinePrompt('Write something about AI', 'specific');
console.log(refined.refinedPrompt); // Much more detailed and specific prompt
console.log(refined.tokensUsed); // Number of tokens used by AI
```

## 🧪 Testing

The project includes comprehensive tests:

- **Unit Tests**: Test individual functions and modules
- **Integration Tests**: Test API endpoints
- **E2E Tests**: Test complete user flows with real OpenAI API calls

### Test Structure
```
src/engine/__tests__/
├── generator.unit.test.ts      # Prompt generation logic
├── refiner.unit.test.ts        # AI-powered refinement (unit tests)
├── refinerTools.unit.test.ts   # Refinement tool definitions
├── openai.unit.test.ts         # OpenAI API client
├── openai.integration.test.ts  # OpenAI integration tests
├── integration.api.test.ts     # API endpoint tests
├── e2e.userFlow.test.ts        # End-to-end user flows
└── e2e.refiner.test.ts         # E2E refinement tests with real AI calls
```

### Running Tests
```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# Coverage report
npm run test:coverage

# Run example usage
npm run example
```

## 🌟 Features

### Core Engine
- **Template-based prompt generation** with Handlebars syntax
- **Context variable substitution** with validation
- **Missing field detection** and error handling
- **AI-powered prompt refinement** with 6 refinement strategies
- **OpenAI API integration** with streaming support and real AI calls
- **Comprehensive error handling** and logging

### AI-Powered Refinement Tools
- **✂️ Concise**: Remove unnecessary words and make shorter
- **🎯 Specific**: Add clarity and specificity to reduce ambiguity  
- **🏗️ Structured**: Improve organization and readability
- **📋 Context**: Add comprehensive context and examples
- **⚙️ Constraints**: Add technical constraints and output format guidance
- **🎭 Roleplay**: Add role-playing elements and persona guidance

### API Features
- **RESTful endpoints** for prompt operations
- **JSON request/response** format
- **Comprehensive error handling**
- **Request validation**
- **CORS support** (when configured)

## 🔐 Configuration

### Environment Variables
```env
# OpenAI API Configuration
OPENAI_API_KEY=sk-dwFEogyru-tSQqgObMgpKw  # Default provided
OPENAI_API_HOST=https://aiportalapi.stu-platform.live/jpe/v1
OPENAI_MODEL=GPT-4o
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=2000

# Server Configuration
PORT=3000
NODE_ENV=development
```

### Default Configuration
The application comes with sensible defaults:
- OpenAI API key and host pre-configured
- Default model: GPT-4o
- Default temperature: 0.7
- Default max tokens: 2000
- Default port: 3000

## 📦 Deployment

### Heroku Deployment
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set OPENAI_API_KEY=your_key_here

# Deploy
git push heroku main
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY prompt-engine/package*.json ./
RUN npm ci --only=production
COPY prompt-engine/src ./src
COPY prompt-engine/tsconfig.json ./
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🛠️ Development

### Available Scripts
```bash
npm run dev      # Start development server with auto-reload
npm run build    # Build TypeScript to JavaScript
npm start        # Run production server
npm test         # Run test suite
npm run clean    # Clean build artifacts
```

### Development Workflow
1. Make changes to source code
2. Tests run automatically (or run `npm test`)
3. Build with `npm run build`
4. Test locally with `npm start`
5. Deploy to staging/production

### Code Structure
- `src/engine/` - Core prompt generation logic
- `src/routes/` - Express API routes
- `src/server.ts` - Main server application
- `src/engine/__tests__/` - Test suite

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Related Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Handlebars Template Guide](https://handlebarsjs.com/guide/)
- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 📞 Support

For issues and questions:
- Create an issue in this repository
- Contact the ePrompt team
- Check the test suite for usage examples
