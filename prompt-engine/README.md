# @eprompt/prompt-engine

A comprehensive Node.js + TypeScript library and API for intelligent prompt generation, refinement, and AI integration. Designed for production use with robust error handling, comprehensive testing, and OpenAI integration.

## 🌟 Features

## 🌟 Features

### Core Functionality

- **Template-based prompt generation** using Handlebars syntax with full variable substitution
- **Context variable validation** with comprehensive type safety and missing field detection
- **AI content generation** from raw text using OpenAI API with streaming support
- **AI-powered prompt refinement** with 8 specialized refinement strategies for prompts
- **AI-powered content refinement** with 8 specialized refinement strategies for general content
- **MongoDB integration** with Mongoose ODM for template storage and retrieval
- **OpenAI API integration** with custom configurations, error handling, and token tracking
- **Production-ready Express API** with comprehensive error handling and Swagger documentation

### Refinement Tools

**Prompt Refinement (8 tools):**
- **🎯 Specific**: Add clarity and specificity to reduce ambiguity and improve precision
- **✂️ Concise**: Remove unnecessary words while preserving core meaning and intent
- **🏗️ Structured**: Improve organization with better sections, flow, and readability
- **📋 Context**: Add relevant background information, examples, and supporting details
- **⚙️ Constraints**: Add technical constraints, output specifications, and format guidance
- **🎭 Roleplay**: Transform prompts with role-playing instructions and persona definitions
- **📝 Examples**: Include practical examples, demonstrations, and sample outputs
- **🛡️ Error Handling**: Add robustness, edge case handling, and error prevention guidance

**Content Refinement (8 tools):**
- **💎 Clarity**: Make content clearer, more understandable, and easier to follow
- **💼 Professional**: Convert to professional business tone with appropriate terminology
- **🎉 Engaging**: Make content more engaging, captivating, and audience-focused
- **✂️ Concise**: Reduce length while preserving key information and impact
- **📖 Detailed**: Add more depth, comprehensive details, and thorough explanations
- **🔧 Technical**: Enhance technical accuracy, precision, and specialized terminology
- **🎨 Creative**: Add creativity, artistic flair, and innovative expression
- **🎯 Persuasive**: Make content more persuasive, compelling, and action-oriented

### Template Management

- **Database storage** with MongoDB for persistent template management
- **CRUD operations** via REST API with full validation and error handling
- **Template validation** with schema enforcement and field requirement checking
- **Automatic timestamps** for creation and update tracking
- **Template search** and retrieval by ID or criteria

### Developer Experience

- **Full TypeScript support** with comprehensive type definitions and IntelliSense
- **Comprehensive test suite** covering unit, integration, and end-to-end scenarios
- **Development server** with hot reload and automatic restart on file changes
- **Production build** with optimized output and minification
- **Interactive API documentation** with Swagger UI for testing and exploration
- **Library and API modes** for flexible usage in different contexts
- **Example code** and usage demonstrations for quick onboarding

## 🚀 Quick Start

## 🚀 Quick Start

### Installation

```bash
# Install as a dependency
npm install @eprompt/prompt-engine

# Or clone and set up for development
git clone <repository-url>
cd eprompt-be/prompt-engine
npm install
```

### Basic Usage as a Library

```typescript
import { 
  generatePrompt, 
  createTemplate, 
  refinePrompt, 
  refineContent,
  generateAIContent 
} from "@eprompt/prompt-engine";

// Create a template
const template = createTemplate({
  id: "code-review",
  name: "Code Review Template",
  description: "Generate code review prompts with context",
  template: `As a {{role}}, review the following {{language}} code:

\`\`\`{{language}}
{{code}}
\`\`\`

Please provide feedback on:
- Code correctness and logic
- Performance considerations  
- Best practices adherence
- Security implications
- Potential improvements and optimizations`,
  role: "Code Reviewer",
  useCase: "Code Review",
  requiredFields: ["role", "language", "code"],
  optionalFields: ["complexity", "focus_areas"]
});

// Generate a prompt from template
const context = {
  role: "Senior Software Engineer",
  language: "JavaScript",
  code: `function sum(arr) { 
    return arr.reduce((a, b) => a + b, 0); 
  }`,
  complexity: "beginner"
};

const result = generatePrompt(template, context);
console.log(result.prompt);
// Output: Fully formatted prompt with context variables substituted

// Check for validation
if (result.missingFields.length > 0) {
  console.log("Missing required fields:", result.missingFields);
}
console.log("Fields used:", result.contextUsed);
console.log("Generation metadata:", result.metadata);

// Refine a prompt using AI
const promptRefinement = await refinePrompt(
  "Write something about AI", 
  "specific",
  {
    provider: "openai",
    model: "GPT-4o",
    temperature: 0.7,
    maxTokens: 2000
  }
);
console.log("Original:", promptRefinement.originalPrompt);
console.log("Refined:", promptRefinement.refinedPrompt);
console.log("Tokens used:", promptRefinement.tokensUsed);
console.log("Response time:", promptRefinement.latencyMs + "ms");

// Refine content using AI
const contentRefinement = await refineContent(
  "Our app is good and helps users", 
  "professional"
);
console.log("Original content:", contentRefinement.originalContent);
console.log("Professional version:", contentRefinement.refinedContent);
console.log("Tool used:", contentRefinement.refinementTool);

// Generate AI content directly
const aiResponse = await generateAIContent(
  "Explain quantum computing in simple terms", 
  {
    provider: "openai",
    model: "GPT-4o",
    temperature: 0.7,
    maxTokens: 1000
  },
  "You are a helpful educational assistant. Explain concepts clearly with examples."
);
console.log("AI response:", aiResponse.result);
console.log("Tokens consumed:", aiResponse.tokensUsed);
console.log("Response time:", aiResponse.latencyMs + "ms");
```



### Running as an API Server

```bash
# Set up environment (MongoDB recommended)
# See DATABASE_SETUP.md for MongoDB setup instructions

# Development mode with hot reload
npm run dev

# Production mode
npm run build
npm start
```

The API server provides comprehensive REST endpoints:

**Core Endpoints:**
- `GET /` - Welcome page with API information and endpoint overview
- `GET /health` - Health check with database connectivity status
- `GET /api-docs` - Interactive Swagger documentation with live testing

**Template Management:**
- `GET /template/all` - Retrieve all available prompt templates
- `GET /template/:id` - Get a specific template by ID
- `POST /template/add` - Add a new template to the database

**Prompt Operations:**
- `POST /generate` - Generate prompts from templates with context validation
- `POST /ai-generate` - Generate AI content directly from text using OpenAI
- `POST /refine/prompt` - Refine prompts using AI (8 specialized tools)
- `POST /refine/content` - Refine general content using AI (8 specialized tools)
- `GET /refine/types` - Get available refinement types and tool information
- `POST /search` - Perform semantic search for prompts and content

**Interactive Features:**
- **Swagger UI**: Visit `http://localhost:3000/api-docs` for complete interactive documentation
- **Live Testing**: Test all endpoints directly from the documentation interface
- **Request/Response Examples**: See real examples for every endpoint
- **Schema Validation**: Full request and response schema documentation

## 📚 API Documentation

### Interactive Documentation

The complete API documentation is available through Swagger UI at `http://localhost:3000/api-docs` when the server is running. This provides:

- **Live testing interface** for all endpoints
- **Request/response schemas** with validation details
- **Example requests and responses** for every operation
- **Authentication requirements** and parameter descriptions
- **Error response details** with status codes and messages

### Base URLs

- **Development**: `http://localhost:3000`
- **Production**: Configure based on your deployment

### Authentication

Currently, no authentication is required for API endpoints. This may change in future versions.

### Content Type

All requests and responses use `application/json` content type unless specified otherwise.

### Error Handling

All endpoints return consistent error responses with appropriate HTTP status codes:

```json
{
  "error": "Descriptive error message",
  "details": "Additional context about the error (when applicable)"
}
```

**Common HTTP Status Codes:**
- `200 OK` - Request successful
- `400 Bad Request` - Invalid request data or missing required fields
- `404 Not Found` - Resource not found (for template endpoints)
- `500 Internal Server Error` - Server error or external API failure

### REST Endpoints

#### GET /

Welcome endpoint that provides API information and available endpoints.

**Response:**

```json
{
  "message": "Welcome to ePrompt API - Prompt Generation & Refinement Engine",
  "version": "1.0.0",
  "description": "A powerful API for generating and refining prompts using AI",
  "endpoints": {
    "health": "/health",
    "generate": "/generate",
    "ai-generate": "/ai-generate",
    "refine": "/refine",
    "search": "/search",
    "template": "/template",
    "docs": "/api-docs"
  },
  "timestamp": "2025-07-16T12:00:00.000Z"
}
```

#### GET /health

Health check endpoint to verify API status and database connectivity.

**Response (Healthy):**

```json
{
  "status": "OK",
  "timestamp": "2025-07-16T12:00:00.000Z",
  "database": {
    "status": "connected",
    "name": "eprompt",
    "ping": "success"
  }
}
```

**Response (Degraded):**

```json
{
  "status": "DEGRADED",
  "timestamp": "2025-07-16T12:00:00.000Z",
  "database": {
    "status": "disconnected",
    "name": "unknown",
    "ping": "failed"
  }
}
```

**Status Codes:**
- `200` - System is fully operational
- `503` - System is degraded or experiencing issues

#### GET /api-docs

Interactive Swagger UI documentation for the API. Visit this endpoint in your browser to explore and test all available endpoints.

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

#### POST /ai-generate

Generate AI results from text content using OpenAI API. This endpoint allows you to send text directly to OpenAI and get AI-generated responses.

**Request:**

```json
{
  "text": "Write a brief introduction about artificial intelligence.",
  "modelConfig": {
    "provider": "openai",
    "model": "GPT-4o",
    "temperature": 0.7,
    "maxTokens": 2000,
    "customApiHost": "https://api.openai.com/v1",
    "customApiKey": "Bearer sk-..."
  },
  "systemPrompt": "You are a helpful AI assistant that provides clear and informative responses."
}
```

**Response:**

```json
{
  "text": "Write a brief introduction about artificial intelligence.",
  "result": "Artificial Intelligence (AI) is a branch of computer science that focuses on creating systems capable of performing tasks that typically require human intelligence. These tasks include learning, reasoning, problem-solving, perception, and language understanding. AI has revolutionized numerous industries and continues to shape our digital future through applications like machine learning, natural language processing, and computer vision.",
  "tokensUsed": 156,
  "latencyMs": 1250,
  "modelConfig": {
    "provider": "openai",
    "model": "GPT-4o",
    "temperature": 0.7,
    "maxTokens": 2000,
    "customApiHost": "https://api.openai.com/v1",
    "customApiKey": "Bearer sk-..."
  },
  "timestamp": "2025-07-12T10:30:00.000Z"
}
```

#### POST /refine/prompt

Refine and optimize a prompt using AI-powered prompt refinement tools.

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

#### POST /refine/content

Refine and optimize general content using AI-powered content refinement tools.

**Request:**

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
  "refinedContent": "Our application delivers exceptional value by providing users with intuitive, reliable solutions that streamline their workflow and enhance productivity. Through carefully designed features and user-centric functionality, we enable our clients to achieve their goals more efficiently and effectively.",
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

Get all available refinement types and tools for both prompts and content.

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
      },
      {
        "id": "structured",
        "name": "Better Structure",
        "icon": "🏗️",
        "description": "Improve organization and readability",
        "color": "yellow"
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
      },
      {
        "id": "examples",
        "name": "Add Examples",
        "icon": "💡",
        "description": "Include practical examples and demonstrations",
        "color": "cyan"
      },
      {
        "id": "error-handling",
        "name": "Error Handling",
        "icon": "🛡️",
        "description": "Add robustness and error handling guidance",
        "color": "red"
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
      },
      {
        "id": "engaging",
        "name": "More Engaging",
        "icon": "✨",
        "description": "Make content more interesting and captivating",
        "color": "purple"
      },
      {
        "id": "concise",
        "name": "Make Concise",
        "icon": "✂️",
        "description": "Reduce length while maintaining key messages",
        "color": "green"
      },
      {
        "id": "detailed",
        "name": "Add Detail",
        "icon": "🔍",
        "description": "Expand content with more comprehensive information",
        "color": "orange"
      },
      {
        "id": "technical",
        "name": "Technical Precision",
        "icon": "⚙️",
        "description": "Add technical accuracy and specialized terminology",
        "color": "gray"
      },
      {
        "id": "creative",
        "name": "Creative Enhancement",
        "icon": "🎨",
        "description": "Add creativity and innovative expression",
        "color": "pink"
      },
      {
        "id": "persuasive",
        "name": "Persuasive Impact",
        "icon": "🎯",
        "description": "Make content more convincing and influential",
        "color": "red"
      }
    ]
  }
}
```

#### POST /search

Semantic search from a database using a natural language query.

**Request:**

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
      "text": "This is the result",
      "score": 0.69
    },
  ],
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

## 🌐 API Usage Examples

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
    "description": "Generate comprehensive blog post outlines",
    "template": "Create a blog post about {{topic}} for {{audience}}. Include {{sections}} main sections with {{tone}} tone.",
    "role": "Content Creator",
    "useCase": "Content Generation",
    "requiredFields": ["topic", "audience", "sections"],
    "optionalFields": ["tone", "length"]
  }'
```

### Prompt Generation

#### Generate from Template

```bash
curl -X POST http://localhost:3000/generate \
  -H "Content-Type: application/json" \
  -d '{
    "template": {
      "id": "code-review",
      "name": "Code Review Template",
      "description": "Generate code review prompts",
      "template": "As a {{role}}, review this {{language}} code:\n\n```{{language}}\n{{code}}\n```\n\nFocus on:\n- Code correctness\n- Performance considerations\n- Best practices\n- Security implications",
      "role": "Code Reviewer", 
      "useCase": "Code Review",
      "requiredFields": ["role", "language", "code"]
    },
    "context": {
      "role": "Senior Software Engineer",
      "language": "JavaScript",
      "code": "function calculateTotal(items) { return items.reduce((sum, item) => sum + item.price, 0); }"
    }
  }'
```

### AI Content Generation

#### Generate AI Content Directly

```bash
curl -X POST http://localhost:3000/ai-generate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Explain quantum computing in simple terms with practical examples",
    "modelConfig": {
      "provider": "openai",
      "model": "GPT-4o",
      "temperature": 0.7,
      "maxTokens": 1000
    },
    "systemPrompt": "You are a helpful educational assistant. Explain complex concepts clearly with real-world examples."
  }'
```

### Prompt Refinement

#### Refine a Prompt for Specificity

```bash
curl -X POST http://localhost:3000/refine/prompt \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write code documentation",
    "refinementType": "specific",
    "modelConfig": {
      "provider": "openai",
      "model": "GPT-4o",
      "temperature": 0.7,
      "maxTokens": 2000
    }
  }'
```

#### Make a Prompt More Structured

```bash
curl -X POST http://localhost:3000/refine/prompt \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Analyze this business proposal and provide feedback on feasibility, market potential, and risks",
    "refinementType": "structured"
  }'
```

### Content Refinement

#### Make Content Professional

```bash
curl -X POST http://localhost:3000/refine/content \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Our app is really good and helps users do stuff better",
    "refinementType": "professional"
  }'
```

#### Make Content More Engaging

```bash
curl -X POST http://localhost:3000/refine/content \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This report covers quarterly sales data and shows performance metrics.",
    "refinementType": "engaging"
  }'
```

### Utility Endpoints

#### Get Available Refinement Types

```bash
curl -X GET http://localhost:3000/refine/types
```

#### Perform Semantic Search

```bash
curl -X POST http://localhost:3000/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": {
      "text": "prompt for writing technical documentation"
    },
    "options": {
      "topK": 5
    }
  }'
```

#### Check System Health

```bash
curl -X GET http://localhost:3000/health
```

## 🔧 Advanced Usage

### Complete Library Integration

```typescript
import {
  generatePrompt,
  createTemplate,
  refinePrompt,
  refineContent,
  generateAIContent,
  PromptTemplate,
  ModelConfig
} from "@eprompt/prompt-engine";

// Advanced template with validation
const template: PromptTemplate = createTemplate({
  id: "technical-writer",
  name: "Technical Documentation Generator",
  description: "Generate comprehensive technical documentation",
  template: `# {{title}}

## Overview
Create technical documentation for {{product}} targeting {{audience}}.

## Requirements
- Technical depth: {{complexity}}
- Documentation type: {{doc_type}}
- Include {{sections}} main sections
- Format: {{format}}

## Context
{{context}}

## Deliverables
Provide:
1. Structured outline
2. Detailed sections with examples
3. Code snippets where applicable
4. Best practices and guidelines`,
  role: "Technical Writer",
  useCase: "Documentation Generation",
  requiredFields: ["title", "product", "audience", "complexity", "doc_type"],
  optionalFields: ["sections", "format", "context"],
  metadata: {
    version: "1.0",
    category: "technical",
    estimatedTokens: 300
  }
});

// Complex context with validation
const context = {
  title: "API Integration Guide",
  product: "ePrompt REST API",
  audience: "software developers",
  complexity: "intermediate",
  doc_type: "integration guide",
  sections: "6",
  format: "markdown",
  context: "RESTful API with authentication and rate limiting"
};

// Generate prompt with full validation
const result = generatePrompt(template, context);

if (result.missingFields.length > 0) {
  console.error("Missing required fields:", result.missingFields);
  throw new Error("Template validation failed");
}

console.log("Generated prompt:", result.prompt);
console.log("Context used:", result.contextUsed);
console.log("Template metadata:", result.metadata);

// Advanced AI configuration
const modelConfig: ModelConfig = {
  provider: "openai",
  model: "GPT-4o",
  temperature: 0.3, // Lower for technical content
  maxTokens: 3000,  // Higher for comprehensive output
  // Optional custom configuration
  customApiHost: process.env.OPENAI_API_HOST,
  customApiKey: process.env.OPENAI_API_KEY
};

// Multi-step refinement workflow
async function generateTechnicalContent(prompt: string): Promise<string> {
  try {
    // Step 1: Make prompt more specific
    const specificRefinement = await refinePrompt(prompt, "specific", modelConfig);
    console.log("Specificity refinement:", specificRefinement.tokensUsed, "tokens");
    
    // Step 2: Add structure
    const structuredRefinement = await refinePrompt(
      specificRefinement.refinedPrompt, 
      "structured", 
      modelConfig
    );
    console.log("Structure refinement:", structuredRefinement.tokensUsed, "tokens");
    
    // Step 3: Generate final content
    const aiContent = await generateAIContent(
      structuredRefinement.refinedPrompt,
      modelConfig,
      "You are an expert technical writer. Create clear, comprehensive documentation with practical examples."
    );
    
    console.log("Content generation:", aiContent.tokensUsed, "tokens");
    console.log("Total response time:", 
      specificRefinement.latencyMs + structuredRefinement.latencyMs + aiContent.latencyMs, "ms");
    
    return aiContent.result;
  } catch (error) {
    console.error("AI generation failed:", error);
    throw new Error("Failed to generate technical content");
  }
}

// Content refinement pipeline
async function refineContentPipeline(content: string): Promise<string> {
  // Step 1: Improve clarity
  const clarityRefinement = await refineContent(content, "clarity");
  
  // Step 2: Make it more professional
  const professionalRefinement = await refineContent(
    clarityRefinement.refinedContent, 
    "professional"
  );
  
  // Step 3: Add technical precision
  const technicalRefinement = await refineContent(
    professionalRefinement.refinedContent,
    "technical"
  );
  
  console.log("Content refinement pipeline completed");
  console.log("Total tokens used:", 
    clarityRefinement.tokensUsed + 
    professionalRefinement.tokensUsed + 
    technicalRefinement.tokensUsed
  );
  
  return technicalRefinement.refinedContent;
}

// Complete workflow
async function completeWorkflow(): Promise<void> {
  try {
    // Generate initial content
    const initialContent = await generateTechnicalContent(result.prompt);
    
    // Refine the content
    const refinedContent = await refineContentPipeline(initialContent);
    
    console.log("Final refined content:", refinedContent);
  } catch (error) {
    console.error("Workflow failed:", error);
  }
}

// Execute workflow
completeWorkflow();
```

### Custom Template Validation

```typescript
import { PromptTemplate, validateTemplate } from "@eprompt/prompt-engine";

// Custom validation function
function validateBusinessTemplate(template: PromptTemplate): string[] {
  const errors: string[] = [];
  
  if (!template.requiredFields.includes("business_context")) {
    errors.push("Business templates must include business_context field");
  }
  
  if (!template.metadata?.category) {
    errors.push("Template must have a category in metadata");
  }
  
  if (template.template.length > 2000) {
    errors.push("Template too long for efficient processing");
  }
  
  return errors;
}

// Template with custom validation
const businessTemplate = createTemplate({
  id: "business-analysis",
  name: "Business Analysis Template",
  description: "Analyze business scenarios",
  template: "Analyze {{scenario}} for {{company}} considering {{business_context}}",
  role: "Business Analyst",
  useCase: "Business Analysis",
  requiredFields: ["scenario", "company", "business_context"],
  metadata: {
    category: "business",
    industry: "general"
  }
});

const validationErrors = validateBusinessTemplate(businessTemplate);
if (validationErrors.length > 0) {
  console.error("Template validation failed:", validationErrors);
}
```

### Error Handling and Retry Logic

```typescript
import { generateAIContent, ModelConfig } from "@eprompt/prompt-engine";

async function robustAIGeneration(
  text: string, 
  config: ModelConfig, 
  maxRetries: number = 3
): Promise<string> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await generateAIContent(text, config);
      return result.result;
    } catch (error) {
      console.warn(`Attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        throw new Error(`AI generation failed after ${maxRetries} attempts`);
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  throw new Error("Unexpected error in robustAIGeneration");
}

// Usage with error handling
try {
  const content = await robustAIGeneration(
    "Generate a product roadmap for an AI startup",
    {
      provider: "openai",
      model: "GPT-4o",
      temperature: 0.7,
      maxTokens: 2000
    }
  );
  console.log("Generated content:", content);
} catch (error) {
  console.error("All retry attempts failed:", error);
}
```
  temperature: 0.7,
  maxTokens: 1000,
};

const result = await generateAndRunPrompt(template, context, modelConfig);
console.log("Generated content:", result.result);
console.log("Tokens used:", result.tokensUsed);
console.log("Latency:", result.latencyMs, "ms");
```

### Using Refinement Tools

```typescript
import { 
  promptRefinerTools, 
  contentRefinerTools,
  refinePrompt,
  refineContent
} from "@eprompt/prompt-engine";

// Get all available prompt refinement tools
console.log(
  "Available prompt tools:",
  promptRefinerTools.map((t) => `${t.name} (${t.id})`)
);

// Get all available content refinement tools
console.log(
  "Available content tools:",
  contentRefinerTools.map((t) => `${t.name} (${t.id})`)
);

// Refine a prompt for better structure
const promptResult = await refinePrompt(
  "Create a function that processes data",
  "structured"
);
console.log("Refined prompt:", promptResult.refinedPrompt);

// Refine content for professional tone
const contentResult = await refineContent(
  "Hey! Our app is super cool and does amazing stuff",
  "professional"
);
console.log("Professional content:", contentResult.refinedContent);

// Use a specific refinement tool manually
const specificTool = promptRefinerTools.find((t) => t.id === "examples");
const originalPrompt = "Write unit tests";
const metaPrompt = `${specificTool.prompt}\n\nOriginal Prompt: "${originalPrompt}"`;

// Use with AI to get refined prompt
const refinedResult = await generateAndRunPrompt(
  createTemplate({
    id: "refinement",
    name: "Prompt Refinement",
    description: "Refine prompts",
    template: metaPrompt,
    role: "Prompt Engineer",
    useCase: "Refinement",
  }),
  {},
  modelConfig
);
```

### Content Refinement Examples

```typescript
import { refineContent, getContentRefinementTypes } from "@eprompt/prompt-engine";

// Get all available content refinement types
const contentTypes = getContentRefinementTypes();
console.log("Content refinement types:", contentTypes);

// Example: Make technical content more engaging
const technicalContent = "Machine learning algorithms analyze data patterns to make predictions";
const engagingResult = await refineContent(technicalContent, "engaging");
console.log("Engaging version:", engagingResult.refinedContent);

// Example: Convert casual content to professional
const casualContent = "Our startup is doing pretty well and growing fast";
const professionalResult = await refineContent(casualContent, "professional");
console.log("Professional version:", professionalResult.refinedContent);

// Example: Add detail to brief content
const briefContent = "AI helps businesses";
const detailedResult = await refineContent(briefContent, "detailed");
console.log("Detailed version:", detailedResult.refinedContent);

// Example: Make content more persuasive
const plainContent = "Consider using our software solution";
const persuasiveResult = await refineContent(plainContent, "persuasive");
console.log("Persuasive version:", persuasiveResult.refinedContent);
```

### Custom Template Creation

```typescript
import { createTemplate, extractTemplateVariables } from "@eprompt/prompt-engine";

// Extract variables from template string
const templateString = "Hello {{name}}, your {{item}} is ready for {{action}}.";
const variables = extractTemplateVariables(templateString);
console.log(variables); // ['name', 'item', 'action']

// Create template with automatic variable detection
const template = createTemplate({
  id: "notification",
  name: "Notification Template",
  description: "Generic notification template",
  template: templateString,
  role: "System",
  useCase: "Notifications",
  // requiredFields automatically set to extracted variables
});
```

## 🧪 Testing

The project includes a comprehensive test suite covering all major functionality with unit, integration, and end-to-end tests.

### Test Categories

- **Unit Tests**: Test individual functions and modules in isolation
- **Integration Tests**: Test API endpoints and database interactions  
- **E2E Tests**: Test complete user workflows with real OpenAI API calls

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode for development
npm run test:watch

# Run specific test categories
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:e2e           # End-to-end tests only

# Generate coverage report with detailed metrics
npm run test:coverage

# Run specific test files
npm test -- generator.unit.test.ts
npm test -- --testNamePattern="refiner"

# Run with verbose output
npm test -- --verbose

# Run example usage demonstration
npm run example
```

### Test Structure

```
src/engine/__tests__/
├── generator.unit.test.ts      # Template generation and validation logic
├── refiner.unit.test.ts        # AI-powered refinement (unit tests with mocks)
├── refinerTools.unit.test.ts   # Refinement tool definitions and configurations
├── search.unit.test.ts         # Semantic search functionality tests
├── template.unit.test.ts       # Template operations and validation
├── openai.unit.test.ts         # OpenAI client functionality (unit tests)
├── ai-generate.unit.test.ts    # AI content generation (unit tests with mocks)
├── ai-generate.e2e.test.ts     # AI content generation (E2E with real API calls)
├── openai.integration.test.ts  # OpenAI integration tests with real API
├── integration.api.test.ts     # API endpoint integration tests with Express
├── e2e.userFlow.test.ts        # Complete user workflow scenarios
└── e2e.refiner.test.ts         # E2E refinement tests with real AI calls
```

### Test Configuration

The test suite uses Jest with TypeScript support and includes:

- **Mocking strategies** for external APIs during unit tests
- **Real API integration** for E2E tests when API keys are available
- **Database testing** with in-memory MongoDB for isolation
- **Request/response validation** for all API endpoints
- **Error scenario testing** for robust error handling
- **Performance testing** with response time measurements

### Test Coverage

Current test coverage includes:

```bash
# Example coverage report
 PASS  src/engine/__tests__/generator.unit.test.ts
 PASS  src/engine/__tests__/refiner.unit.test.ts
 PASS  src/engine/__tests__/openai.integration.test.ts
 PASS  src/engine/__tests__/integration.api.test.ts

Test Suites: 12 passed, 12 total
Tests:       89 passed, 89 total
Snapshots:   0 total
Time:        12.456 s

----------------------|---------|----------|---------|---------|-------------------
File                  | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------------------|---------|----------|---------|---------|-------------------
All files            |   94.23 |    87.15 |   96.42 |   93.87 |
 engine/              |   95.67 |    89.23 |   97.84 |   95.12 |
  generator.ts        |   98.45 |    92.31 |  100.00 |   98.23 |
  refiner.ts          |   93.21 |    85.67 |   95.43 |   92.89 |
  openai.ts           |   96.78 |    90.12 |   98.67 |   96.34 |
 routes/              |   92.34 |    84.67 |   94.23 |   91.78 |
----------------------|---------|----------|---------|---------|-------------------
```

### Test Environment Setup

```bash
# Environment variables for testing
NODE_ENV=test
MONGODB_URI=mongodb://localhost:27017/eprompt_test

# Optional: Real API testing (when API keys are provided)
OPENAI_API_KEY=your_test_api_key_here
OPENAI_API_HOST=https://aiportalapi.stu-platform.live/jpe/v1

# Test configuration in jest.config.js automatically handles:
# - TypeScript compilation
# - Test environment setup
# - MongoDB memory server for isolated testing
# - Mock configurations for external APIs
```

### Example Test Output

```bash
--- OPENAI CONFIG (E2E Test) ---
API Host: https://aiportalapi.stu-platform.live/jpe/v1
API Key: Bearer sk-dwFEogyru-tSQqgObMgpKw
Model: GPT-4o
Temperature: 0.7
Max Tokens: 2000

--- INPUT TO AI ---
Prompt: Say hello to the world in a creative way.

--- AI RESPONSE ---
Content: 🌍 Greetings, magnificent world! ✨ 
         From every corner of this beautiful planet,
         a warm hello radiates like sunshine! �
Tokens Used: 23
Response Time: 1,247ms

✓ AI generation successful (1247 ms)
✓ Response validation passed
✓ Token usage within expected range
````

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
````

### Custom OpenAI Configuration

```typescript
import { createOpenAIClient, OpenAIConfig } from "@eprompt/prompt-engine";

const customConfig: OpenAIConfig = {
  apiHost: "https://your-custom-api.com/v1",
  apiKey: "Bearer your-api-key",
  model: "gpt-4",
  temperature: 0.5,
  maxTokens: 1500,
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
  provider: "openai" | "anthropic" | "google" | "local";
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
# Development
npm run dev         # Start development server with hot reload and nodemon
npm run build       # Build TypeScript to JavaScript (production)
npm start           # Run production server from built files
npm run clean       # Clean build artifacts and dist folder

# Testing
npm test            # Run comprehensive test suite
npm run test:watch  # Run tests in watch mode for development
npm run test:unit   # Run only unit tests
npm run test:integration  # Run only integration tests
npm run test:e2e    # Run only end-to-end tests
npm run test:coverage     # Generate detailed coverage report

# Code Quality
npm run lint        # Run ESLint for code quality checks
npm run lint:fix    # Fix linting issues automatically

# Examples and Documentation
npm run example     # Run basic usage example from examples/basic-usage.ts
```

### Project Structure

```
src/
├── config/              # Configuration files
│   └── swagger.ts       # Swagger/OpenAPI documentation setup
├── engine/              # Core engine logic
│   ├── generator.ts     # Template-based prompt generation
│   ├── refiner.ts       # AI-powered prompt and content refinement
│   ├── openai.ts        # OpenAI API client and integration
│   ├── search.ts        # Semantic search functionality
│   ├── types.ts         # Comprehensive TypeScript type definitions
│   ├── index.ts         # Public API exports for library usage
│   └── __tests__/       # Comprehensive test suite (unit, integration, E2E)
├── model/               # Database models and schemas
│   └── PromptTemplate.ts # Mongoose model for template persistence
├── routes/              # Express API route handlers
│   ├── generate.ts      # POST /generate - Template-based generation
│   ├── refine.ts        # POST /refine/prompt and /refine/content
│   ├── ai-generate.ts   # POST /ai-generate - Direct AI content generation
│   ├── search.ts        # POST /search - Semantic search
│   ├── template.ts      # Template CRUD operations
│   └── index.ts         # Route registration and middleware
├── examples/            # Usage examples and demonstrations
│   └── basic-usage.ts   # Basic library usage example
└── server.ts           # Express server setup with MongoDB connection
```

### Development Workflow

1. **Setup**: `npm install` to install dependencies
2. **Development**: `npm run dev` for hot reload development server
3. **Testing**: `npm run test:watch` for continuous testing during development
4. **Building**: `npm run build` to create production build
5. **Quality**: `npm run lint` to check code quality
6. **Documentation**: Visit `http://localhost:3000/api-docs` for live API docs

### Building and Distribution

```bash
# Create production build
npm run build

# Verify build output
ls -la dist/

# Test production build locally
npm start

# Create distributable package
npm pack

# Check package contents
tar -tzf eprompt-prompt-engine-*.tgz
```

### Development Features

- **Hot reload** with nodemon for instant feedback during development
- **TypeScript** with strict type checking and comprehensive type definitions
- **Jest testing** with coverage reporting and multiple test categories
- **ESLint** for consistent code style and quality enforcement
- **Swagger documentation** automatically generated from code annotations
- **MongoDB integration** with automatic connection management and health monitoring

## 🚀 Deployment

### Heroku Deployment

For detailed deployment instructions, see the main [DEPLOYMENT.md](../DEPLOYMENT.md) file.

```bash
# Quick Heroku deployment
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI="your_mongodb_connection_string"
heroku config:set OPENAI_API_KEY="your_production_api_key"
git push heroku main
```

### Docker Deployment

```dockerfile
# Multi-stage build for optimized production image
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS production
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code and build
COPY . .
RUN npm run build

# Remove dev dependencies and source files
RUN rm -rf src/ tsconfig.json jest.config.js

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S promptengine -u 1001
USER promptengine

# Expose port and start
EXPOSE 3000
CMD ["npm", "start"]
```

### PM2 Process Manager (Production)

```json
{
  "name": "prompt-engine-api",
  "script": "dist/server.js",
  "instances": "max",
  "exec_mode": "cluster",
  "env": {
    "NODE_ENV": "production",
    "PORT": 3000
  },
  "env_production": {
    "NODE_ENV": "production",
    "PORT": 3000,
    "MONGODB_URI": "mongodb://localhost:27017/eprompt",
    "OPENAI_API_KEY": "your_production_api_key"
  },
  "log_date_format": "YYYY-MM-DD HH:mm Z",
  "error_file": "./logs/err.log",
  "out_file": "./logs/out.log",
  "log_file": "./logs/combined.log"
}
```

```bash
# Deploy with PM2
npm run build
pm2 start ecosystem.config.json
pm2 save
pm2 startup
```

### Environment Configuration

```bash
# Production environment variables
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/eprompt
OPENAI_API_KEY=your_production_api_key
OPENAI_API_HOST=https://api.openai.com/v1
OPENAI_MODEL=gpt-4
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=2000

# Optional: Enhanced logging and monitoring
LOG_LEVEL=info
ENABLE_METRICS=true
CORS_ORIGINS=https://your-frontend-domain.com
```

### Health Monitoring

The API includes built-in health monitoring:

```bash
# Health check endpoint
curl https://your-app.herokuapp.com/health

# Response includes database connectivity
{
  "status": "OK",
  "timestamp": "2025-07-16T12:00:00.000Z",
  "database": {
    "status": "connected",
    "name": "eprompt",
    "ping": "success"
  }
}
```

## 📖 Documentation

### Interactive API Documentation

The complete API documentation is available through Swagger UI:

- **Development**: `http://localhost:3000/api-docs`
- **Production**: `https://your-app.herokuapp.com/api-docs`

### Additional Resources

- **Main README**: [../README.md](../README.md) - Project overview and setup
- **API Documentation**: [../API.md](../API.md) - Detailed endpoint documentation
- **Database Setup**: [../DATABASE_SETUP.md](../DATABASE_SETUP.md) - MongoDB configuration
- **Deployment Guide**: [../DEPLOYMENT.md](../DEPLOYMENT.md) - Production deployment
- **Changelog**: [../CHANGELOG.md](../CHANGELOG.md) - Version history and updates

### External Documentation

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Handlebars Template Guide](https://handlebarsjs.com/guide/)
- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose ODM Guide](https://mongoosejs.com/docs/guide.html)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)

## 🤝 Contributing

### Development Setup

1. **Fork and clone** the repository
2. **Install dependencies**: `npm install`
3. **Set up environment**: Copy `.env.example` to `.env` (optional)
4. **Start development**: `npm run dev`
5. **Run tests**: `npm run test:watch`

### Contribution Guidelines

- **Code Quality**: Follow TypeScript best practices and run `npm run lint`
- **Testing**: Add tests for new functionality and ensure all tests pass
- **Documentation**: Update documentation for API changes
- **Commit Messages**: Use clear, descriptive commit messages
- **Pull Requests**: Include a detailed description of changes

### Areas for Contribution

- **New refinement tools** for prompts and content
- **Additional AI provider integrations** (Anthropic, Google, etc.)
- **Performance optimizations** and caching strategies
- **Enhanced error handling** and recovery mechanisms
- **Additional template management features**
- **Documentation improvements** and examples

## 📞 Support

### Getting Help

- 🐛 **Issues**: Create an issue in the repository with detailed information
- 📖 **Documentation**: Check `/api-docs` for interactive API documentation
- 🧪 **Examples**: Review test suite and `examples/` directory for usage patterns
- 🏥 **Health Check**: Use `/health` endpoint to verify system status

### Troubleshooting

**Common Issues:**

1. **MongoDB Connection**: Ensure MongoDB is running and accessible
   ```bash
   # Check MongoDB status
   brew services list | grep mongodb  # macOS
   systemctl status mongod            # Linux
   ```

2. **OpenAI API**: Verify API key and endpoint configuration
   ```bash
   # Test API connectivity
   curl -H "Authorization: Bearer $OPENAI_API_KEY" \
        "$OPENAI_API_HOST/models"
   ```

3. **Port Conflicts**: Default port 3000 can be changed via `PORT` environment variable
   ```bash
   PORT=8080 npm run dev
   ```

4. **Dependencies**: Ensure all dependencies are installed
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

**Debug Mode:**

```bash
# Enable verbose logging
DEBUG=* npm run dev

# Or set specific debug namespaces
DEBUG=prompt-engine:* npm run dev
```

### Performance Optimization

- **Caching**: Implement Redis caching for frequently used templates
- **Rate Limiting**: Add rate limiting for production API endpoints  
- **Connection Pooling**: Optimize MongoDB connection pool settings
- **Response Compression**: Enable gzip compression for API responses
- **Monitoring**: Add application performance monitoring (APM) tools

---

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details.

---

**Built with ❤️ by the ePrompt Team**

For more information, visit the [main project repository](../README.md) or explore the [interactive API documentation](http://localhost:3000/api-docs).
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
