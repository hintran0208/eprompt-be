# ePrompt Backend

This repository contains the backend services and core prompt engine for the ePrompt platform. It provides a production-ready API for prompt generation, refinement, template management, and AI integration built with Node.js and TypeScript.

## 🏗️ Repository Structure

```
eprompt-be/
├── prompt-engine/          # Core prompt engine package
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   │   └── swagger.ts      # Swagger/OpenAPI documentation setup
│   │   ├── engine/         # Core prompt generation logic
│   │   │   ├── generator.ts    # Prompt generation and AI integration
│   │   │   ├── refiner.ts      # Prompt refinement tools
│   │   │   ├── search.ts       # Prompt semantic search tools
│   │   │   ├── openai.ts       # OpenAI API client
│   │   │   ├── types.ts        # TypeScript type definitions
│   │   │   ├── index.ts        # Main engine exports
│   │   │   └── __tests__/      # Comprehensive test suite
│   │   ├── model/          # Database models
│   │   │   └── PromptTemplate.ts   # Mongoose template model
│   │   ├── routes/         # Express API routes
│   │   │   ├── generate.ts     # POST /generate endpoint
│   │   │   ├── refine.ts       # POST /refine/prompt and /refine/content endpoints
│   │   │   ├── search.ts       # POST /search endpoint
│   │   │   ├── ai-generate.ts  # POST /ai-generate endpoint
│   │   │   ├── template.ts     # Template management endpoints
│   │   │   └── index.ts        # Route registration
│   │   └── server.ts       # Express server setup with MongoDB
│   ├── examples/           # Usage examples
│   │   └── basic-usage.ts      # Basic library usage example
│   ├── package.json        # Dependencies and scripts
│   ├── tsconfig.json       # TypeScript configuration
│   ├── tsconfig.build.json # Build-specific TypeScript configuration
│   └── jest.config.js      # Test configuration
├── package.json           # Root package.json for deployment
├── app.json               # Heroku app configuration
├── Procfile               # Heroku process configuration
├── deploy.sh              # Deployment script
├── start.sh               # Local startup script
├── API.md                 # Detailed API documentation
├── DATABASE_SETUP.md      # Database setup instructions
├── DEPLOYMENT.md          # Deployment instructions
├── CHANGELOG.md           # Project changelog
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- MongoDB database (local or remote)
- OpenAI API key (default configuration provided for development)

### 1. Install Dependencies

```bash
# Install root dependencies (for deployment)
npm install

# Install prompt-engine dependencies
cd prompt-engine
npm install
```

### 2. Set Up Environment

The application comes with default configuration that works out of the box for development. Create a `.env` file in the `prompt-engine` directory to customize settings:

```bash
# Copy environment template (if available)
cp .env.example .env

# Edit .env file with your configuration (all optional - defaults provided)
# OPENAI_API_KEY=your_api_key_here
# OPENAI_API_HOST=https://aiportalapi.stu-platform.live/jpe/v1
# OPENAI_MODEL=GPT-4o
# OPENAI_TEMPERATURE=0.7
# OPENAI_MAX_TOKENS=2000
# PORT=3000
# MONGODB_URI=mongodb://localhost:27017/eprompt
# NODE_ENV=development
```

### 3. Set Up Database

The application uses MongoDB for template storage. See [DATABASE_SETUP.md](DATABASE_SETUP.md) for detailed setup instructions.

For quick local setup:
```bash
# Using Docker (recommended)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or install MongoDB locally
# Visit: https://docs.mongodb.com/manual/installation/
```

### 4. Run the Server

From the root directory:

```bash
# Development mode with auto-reload
npm run dev

# Production build and start
npm run build
npm start
```

Or from the prompt-engine directory:

```bash
cd prompt-engine

# Development mode with auto-reload
npm run dev

# Production build and start
npm run build
npm start
```

The server will start on `http://localhost:3000`

**Available endpoints:**
- `GET /` - Welcome page and API information
- `GET /health` - Health check with database status
- `GET /api-docs` - Interactive Swagger documentation

### 5. Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:e2e

# Generate coverage report
npm run test:coverage

# Run basic usage example
npm run example
```

## 📚 API Documentation

### Base URL

- Development: `http://localhost:3000`
- Production: `https://your-app.herokuapp.com`

### Interactive Documentation

Visit `http://localhost:3000/api-docs` for complete interactive Swagger documentation with example requests and responses.

### Core Endpoints

#### General Endpoints

**GET /** - Welcome page with API information and available endpoints
**GET /health** - Health check with database connectivity status  
**GET /api-docs** - Interactive Swagger API documentation

#### Template Management

#### GET /template/all

Gets all available prompt templates from the database.

**Response:**

```json
[
  {
    "id": "greeting",
    "name": "Greeting Template",
    "description": "Generate a friendly greeting",
    "template": "Hello {{name}}! Welcome to {{platform}}.",
    "role": "Assistant",
    "useCase": "Greeting",
    "requiredFields": ["name", "platform"],
    "optionalFields": [],
    "metadata": {},
    "createdAt": "2025-07-09T10:30:00.000Z",
    "updatedAt": "2025-07-09T10:30:00.000Z"
  }
]
```

#### GET /template/:id

Gets a specific prompt template by ID.

**Response:**

```json
{
  "id": "greeting",
  "name": "Greeting Template",
  "description": "Generate a friendly greeting",
  "template": "Hello {{name}}! Welcome to {{platform}}.",
  "role": "Assistant",
  "useCase": "Greeting",
  "requiredFields": ["name", "platform"],
  "optionalFields": [],
  "metadata": {},
  "createdAt": "2025-07-09T10:30:00.000Z",
  "updatedAt": "2025-07-09T10:30:00.000Z"
}
```

**Error Responses:**

- `404`: Template not found
- `500`: Internal server error

#### POST /template/add

Adds a new prompt template to the database.

**Request Body:**

```json
{
  "id": "unique-template-id",
  "name": "Template Name",
  "description": "Description of template",
  "template": "Template string with {{variables}}",
  "role": "Assistant",
  "useCase": "General",
  "requiredFields": ["variable1"],
  "optionalFields": ["variable2"],
  "metadata": {}
}
```

**Response:**

```json
{
  "id": "unique-template-id",
  "name": "Template Name",
  "description": "Description of template",
  "template": "Template string with {{variables}}",
  "role": "Assistant",
  "useCase": "General",
  "requiredFields": ["variable1"],
  "optionalFields": ["variable2"],
  "metadata": {},
  "createdAt": "2025-07-09T10:30:00.000Z",
  "updatedAt": "2025-07-09T10:30:00.000Z"
}
```

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

#### POST /refine/prompt
Refines a prompt using AI-powered prompt refinement tools to improve clarity, structure, and effectiveness.

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

#### POST /refine/content
Refines general content using AI-powered content refinement tools to improve tone, style, and effectiveness.

**Request Body:**
```json
{
  "content": "Our app is good and helps users",
  "refinementType": "professional",
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
  "refinedContent": "Our application delivers exceptional value by providing users with intuitive, reliable solutions that streamline their workflow and enhance productivity.",
  "originalContent": "Our app is good and helps users",
  "refinementTool": {
    "id": "professional",
    "name": "Professional Tone",
    "icon": "💼",
    "description": "Transform content to have a professional business tone",
    "color": "blue"
  },
  "tokensUsed": 89,
  "latencyMs": 980
}
```

#### GET /refine/types
Gets all available refinement types and tools for both prompts and content.

**Response:**
```json
{
  "prompt": {
    "types": ["specific", "concise", "structured", "context", "constraints", "roleplay", "examples", "error-handling"],
    "tools": [
      {
        "id": "specific",
        "name": "More Specific",
        "icon": "🎯",
        "description": "Add clarity and specificity to reduce ambiguity",
        "color": "green"
      },
      {
        "id": "concise",
        "name": "Make Concise",
        "icon": "✂️",
        "description": "Remove unnecessary words and make it shorter",
        "color": "blue"
      }
    ]
  },
  "content": {
    "types": ["clarity", "professional", "engaging", "concise", "detailed", "technical", "creative", "persuasive"],
    "tools": [
      {
        "id": "clarity",
        "name": "Improve Clarity",
        "icon": "💎",
        "description": "Make content clearer and easier to understand",
        "color": "blue"
      },
      {
        "id": "professional",
        "name": "Professional Tone",
        "icon": "💼",
        "description": "Transform content to have a professional business tone",
        "color": "navy"
      }
    ]
  }
}
```

#### POST /ai-generate
Generates AI responses from text content using OpenAI API. Accepts raw text or refined prompts and returns AI-generated content.

**Request Body:**
```json
{
  "text": "Explain quantum computing in simple terms",
  "modelConfig": {
    "provider": "openai",
    "model": "GPT-4o",
    "temperature": 0.7,
    "maxTokens": 1000
  },
  "systemPrompt": "You are a helpful educational assistant. Explain concepts clearly and provide examples."
}
```

**Response:**
```json
{
  "response": "Quantum computing is a revolutionary approach to processing information that harnesses the strange properties of quantum mechanics...",
  "originalText": "Explain quantum computing in simple terms",
  "modelConfig": {
    "provider": "openai",
    "model": "GPT-4o",
    "temperature": 0.7,
    "maxTokens": 1000
  },
  "systemPrompt": "You are a helpful educational assistant. Explain concepts clearly and provide examples.",
  "tokensUsed": 245,
  "latencyMs": 1850,
  "timestamp": "2025-07-09T10:30:00.000Z"
}
```

**Error Responses:**
- `400`: Missing or invalid text, invalid modelConfig, unsupported provider
- `500`: OpenAI API error, internal server error

#### POST /search
Performs semantic search for prompts and content using advanced search algorithms.

**Request Body:**
```json
{
  "query": {
    "text": "Prompt for text summarization"
  },
  "options": {
    "topK": 5
  }
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "summary-1",
      "content": "Summarize the following text...",
      "score": 0.95,
      "metadata": {
        "type": "prompt",
        "category": "summarization"
      }
    }
  ],
  "totalResults": 1,
  "query": "text summarization"
}
```

## 🔧 Usage Examples

### Template Management

#### Get All Templates

```bash
curl -X GET http://localhost:3000/template/all
```

#### Get Specific Template

```bash
curl -X GET http://localhost:3000/template/greeting
```

#### Add New Template

```bash
curl -X POST http://localhost:3000/template/add \
  -H "Content-Type: application/json" \
  -d '{
    "id": "blog-post",
    "name": "Blog Post Generator",
    "description": "Generate blog post outlines",
    "template": "Create a blog post about {{topic}} for {{audience}}. Include {{sections}} main sections.",
    "role": "Content Creator",
    "useCase": "Content Generation",
    "requiredFields": ["topic", "audience", "sections"],
    "optionalFields": ["tone", "length"]
  }'
```

### Basic Prompt Generation

````bash
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
````

### Prompt Refinement

```bash
curl -X POST http://localhost:3000/refine/prompt \
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

### Content Refinement
```bash
curl -X POST http://localhost:3000/refine/content \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Our app is good and helps users",
    "refinementType": "professional",
    "modelConfig": {
      "provider": "openai",
      "model": "GPT-4o",
      "temperature": 0.7,
      "maxTokens": 2000
    }
  }'
```

### AI Content Generation
```bash
curl -X POST http://localhost:3000/ai-generate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Explain quantum computing in simple terms",
    "modelConfig": {
      "provider": "openai",
      "model": "GPT-4o",
      "temperature": 0.7,
      "maxTokens": 1000
    },
    "systemPrompt": "You are a helpful educational assistant. Explain concepts clearly and provide examples."
  }'
```

### Prompt Search
```bash
curl -X POST http://localhost:3000/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": {
      "text": "Prompt for text summarization"
    },
    "options": {
      "topK": 5
    }
  }'

```

### Get Available Refinement Types

```bash
curl -X GET http://localhost:3000/refine/types
```

### Using as a Library

```typescript
import { generatePrompt, createTemplate, refinePrompt } from "@eprompt/prompt-engine";

// Create a template
const template = createTemplate({
  id: "greeting",
  name: "Greeting Template",
  description: "Generate a friendly greeting",
  template: "Hello {{name}}! Welcome to {{platform}}.",
  role: "Assistant",
  useCase: "Greeting",
});

// Generate a prompt
const context = { name: "Alice", platform: "ePrompt" };
const result = await generatePrompt(template, context);
console.log(result.prompt); // "Hello Alice! Welcome to ePrompt."

// Refine a prompt using AI
const refined = await refinePrompt("Write something about AI", "specific");
console.log(refined.refinedPrompt); // Much more detailed and specific prompt
console.log(refined.tokensUsed); // Number of tokens used by AI

// Generate AI content directly
const aiResponse = await generateAIContent('Explain quantum computing', {
  provider: 'openai',
  model: 'GPT-4o',
  temperature: 0.7,
  maxTokens: 1000
});
console.log(aiResponse.response); // AI-generated explanation
console.log(aiResponse.tokensUsed); // Tokens consumed
```

## 🧪 Testing

The project includes comprehensive tests covering all major functionality:

- **Unit Tests**: Test individual functions and modules in isolation
- **Integration Tests**: Test API endpoints and database interactions
- **E2E Tests**: Test complete user flows with real OpenAI API calls

### Test Structure

```
src/engine/__tests__/
├── generator.unit.test.ts      # Prompt generation logic tests
├── refiner.unit.test.ts        # AI-powered refinement (unit tests)
├── refinerTools.unit.test.ts   # Refinement tool definitions and logic
├── search.unit.test.ts         # Semantic search functionality tests
├── template.unit.test.ts       # Template operations and validation
├── openai.unit.test.ts         # OpenAI API client (unit tests)
├── ai-generate.unit.test.ts    # AI content generation (unit tests)
├── ai-generate.e2e.test.ts     # AI content generation (E2E with real API)
├── openai.integration.test.ts  # OpenAI integration tests
├── integration.api.test.ts     # API endpoint integration tests
├── e2e.userFlow.test.ts        # End-to-end user workflow tests
└── e2e.refiner.test.ts         # E2E refinement tests with real AI calls
```

### Running Tests

```bash
# Run all tests
npm test

# Run in watch mode for development
npm run test:watch

# Run specific test types
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only  
npm run test:e2e           # End-to-end tests only

# Generate coverage report
npm run test:coverage

# Run basic usage example
npm run example
```

### Test Coverage

The test suite includes:
- **Unit tests** for all core functions and utilities
- **API endpoint tests** for all routes with various input scenarios  
- **Database integration tests** for template CRUD operations
- **OpenAI integration tests** with real API calls (when API key is available)
- **End-to-end workflow tests** simulating complete user interactions
- **Error handling tests** for various failure scenarios

## 🌟 Features

### Core Engine

- **Template-based prompt generation** with Handlebars syntax and variable substitution
- **Context variable validation** with missing field detection and error handling
- **AI-powered prompt refinement** with 8 specialized refinement strategies
- **AI content generation** from raw text using OpenAI API
- **Semantic search** for prompts and content discovery
- **OpenAI API integration** with custom configurations and streaming support
- **Comprehensive error handling** and logging throughout the application

### Database & Template Management

- **MongoDB integration** with Mongoose ODM for robust data persistence
- **Template CRUD operations** via REST API with full validation
- **Template storage and retrieval** from database with query capabilities
- **Schema enforcement** with automatic timestamps and data validation
- **Database health monitoring** with connection status reporting

### AI-Powered Refinement Tools

**Prompt Refinement (8 tools):**
- **🎯 Specific**: Add clarity and specificity to reduce ambiguity
- **✂️ Concise**: Remove unnecessary words while preserving meaning
- **🏗️ Structured**: Improve organization with better sections and flow
- **📋 Context**: Add comprehensive context and relevant examples
- **⚙️ Constraints**: Add technical constraints and output format guidance
- **🎭 Roleplay**: Transform prompts with role-playing instructions
- **📝 Examples**: Include practical examples and demonstrations
- **🛡️ Error Handling**: Add robustness and error handling guidance

**Content Refinement (8 tools):**
- **💎 Clarity**: Make content clearer and more understandable
- **💼 Professional**: Convert to professional business tone
- **🎉 Engaging**: Make content more engaging and captivating
- **✂️ Concise**: Reduce length while keeping key information
- **📖 Detailed**: Add more depth and comprehensive details
- **🔧 Technical**: Enhance technical accuracy and terminology
- **🎨 Creative**: Add creativity and artistic flair
- **🎯 Persuasive**: Make content more persuasive and compelling

### API Features

- **RESTful endpoints** for all prompt operations with consistent interface
- **JSON request/response** format with comprehensive error handling
- **Interactive Swagger documentation** with live testing capabilities
- **Request validation** and sanitization for security
- **CORS support** with configurable origins (currently permissive for development)
- **Health monitoring** with database connectivity checks

## 🔐 Configuration

### Environment Variables

All environment variables are optional for development as the application comes with working defaults:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/eprompt

# OpenAI API Configuration (pre-configured for development)
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

The application includes production-ready defaults for immediate development:

- **MongoDB**: `mongodb://localhost:27017/eprompt`
- **OpenAI API**: Pre-configured with working credentials and endpoint
- **Default model**: GPT-4o with temperature 0.7 and max tokens 2000
- **Server port**: 3000
- **CORS**: Permissive for development (configure for production)

### Production Configuration

For production deployment, override environment variables as needed:

```bash
# Example production environment variables
export MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/eprompt"
export OPENAI_API_KEY="your_production_api_key"
export NODE_ENV="production"
export PORT="443"
```

## 📦 Deployment

### Heroku Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

Quick deployment:

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app (or use existing)
heroku create your-app-name

# Set environment variables (optional - defaults work for testing)
heroku config:set MONGODB_URI="your_mongodb_connection_string"
heroku config:set OPENAI_API_KEY="your_production_api_key"
heroku config:set NODE_ENV="production"

# Deploy
git push heroku main
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prompt-engine/package*.json ./prompt-engine/

# Install dependencies
RUN npm ci --only=production
RUN cd prompt-engine && npm ci --only=production

# Copy source code
COPY prompt-engine/ ./prompt-engine/

# Build application
RUN cd prompt-engine && npm run build

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]
```

### Environment-Specific Configuration

The application is designed to work out-of-the-box for development and can be easily configured for production:

- **Development**: Uses default MongoDB and pre-configured OpenAI credentials
- **Staging**: Override `MONGODB_URI` and optionally `OPENAI_API_KEY`
- **Production**: Set all environment variables and enable security features

## 🛠️ Development

### Available Scripts

```bash
# Root level (for deployment and coordination)
npm run build    # Build the prompt-engine package
npm start        # Start production server
npm run dev      # Start development server with auto-reload
npm test         # Run the full test suite

# Prompt-engine level (detailed development)
cd prompt-engine
npm run dev         # Start development server with auto-reload
npm run build       # Build TypeScript to JavaScript
npm start           # Run production server
npm test            # Run test suite
npm run test:watch  # Run tests in watch mode
npm run test:unit   # Run only unit tests
npm run test:integration  # Run only integration tests
npm run test:e2e    # Run only end-to-end tests
npm run test:coverage     # Generate coverage report
npm run clean       # Clean build artifacts
npm run lint        # Run ESLint
npm run lint:fix    # Fix linting issues automatically
npm run example     # Run basic usage example
```

### Development Workflow

1. **Setup**: Install dependencies and set up environment
2. **Development**: Make changes with auto-reload (`npm run dev`)
3. **Testing**: Run tests continuously (`npm run test:watch`)
4. **Build**: Create production build (`npm run build`)
5. **Quality**: Check linting and coverage
6. **Deploy**: Test locally then deploy to staging/production

### Project Structure

- **`src/server.ts`** - Main Express application with MongoDB connection
- **`src/config/`** - Configuration files (Swagger setup)
- **`src/engine/`** - Core prompt generation and AI logic  
- **`src/routes/`** - Express API route handlers
- **`src/model/`** - Database models and schemas
- **`examples/`** - Usage examples and demonstrations
- **`__tests__/`** - Comprehensive test suite

### Development Features

- **Hot reload** with nodemon for instant feedback
- **TypeScript** with strict type checking
- **Jest testing** with comprehensive coverage reporting
- **ESLint** for code quality and consistency
- **Swagger documentation** automatically generated from code
- **MongoDB integration** with automatic connection management

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

### Documentation
- [API.md](API.md) - Detailed API endpoint documentation
- [DATABASE_SETUP.md](DATABASE_SETUP.md) - Database setup and configuration
- [DEPLOYMENT.md](DEPLOYMENT.md) - Complete deployment guide
- [CHANGELOG.md](CHANGELOG.md) - Project version history and changes

### External Resources
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Handlebars Template Guide](https://handlebarsjs.com/guide/)
- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose ODM Guide](https://mongoosejs.com/docs/guide.html)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)

### Interactive Documentation
- **Swagger UI**: Visit `http://localhost:3000/api-docs` when server is running
- **Health Check**: `http://localhost:3000/health` for system status
- **API Overview**: `http://localhost:3000/` for endpoint summary

## 📞 Support

### Getting Help

For issues, questions, and contributions:

1. **Issues**: Create an issue in this repository with detailed information
2. **Documentation**: Check the `/api-docs` endpoint for interactive API documentation
3. **Examples**: Review the test suite and `examples/` directory for usage patterns
4. **Health Check**: Use `/health` endpoint to verify system status

### Troubleshooting

**Common Issues:**
- **MongoDB Connection**: Ensure MongoDB is running and accessible
- **OpenAI API**: Check API key and endpoint configuration
- **Port Conflicts**: Default port 3000 can be changed via `PORT` environment variable
- **Dependencies**: Run `npm install` in both root and `prompt-engine` directories

**Debug Mode:**
```bash
DEBUG=* npm run dev  # Enable verbose logging
```

### Development Support

- **Test Suite**: Run tests to verify your changes work correctly
- **Type Safety**: TypeScript provides compile-time error checking
- **Hot Reload**: Development server automatically restarts on file changes
- **API Testing**: Use Swagger UI for interactive endpoint testing
