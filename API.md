# ePrompt API Documentation

This document provides comprehensive API documentation for the ePrompt backend services.

## Base URLs

- **Development**: `http://localhost:3000`
- **Production**: `https://your-app.herokuapp.com`

## Authentication

Currently, no authentication is required for API endpoints. This may change in future versions.

## Content Type

All requests and responses use `application/json` content type.

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message describing what went wrong",
  "details": "Additional details about the error (optional)"
}
```

### HTTP Status Codes

- `200 OK` - Request successful
- `400 Bad Request` - Invalid request data
- `500 Internal Server Error` - Server error

---

## Endpoints

### POST /generate

Generate a prompt from a template and context variables.

#### Request Body

```json
{
  "template": {
    "id": "string",
    "name": "string", 
    "description": "string",
    "template": "string",
    "role": "string",
    "useCase": "string",
    "requiredFields": ["string"],
    "optionalFields": ["string"] // optional
  },
  "context": {
    "variable1": "value1",
    "variable2": "value2"
  }
}
```

#### Template Object Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | string | Yes | Unique identifier for the template |
| `name` | string | Yes | Human-readable name |
| `description` | string | Yes | Description of template purpose |
| `template` | string | Yes | Template string with {{variables}} |
| `role` | string | Yes | Role context for the template |
| `useCase` | string | Yes | Use case description |
| `requiredFields` | string[] | Yes | List of required context variables |
| `optionalFields` | string[] | No | List of optional context variables |

#### Context Object

The context object should contain key-value pairs where keys match the variables in the template string (e.g., `{{variableName}}`).

#### Response

```json
{
  "prompt": "string",
  "missingFields": ["string"],
  "contextUsed": ["string"],
  "metadata": {
    "templateId": "string",
    "templateName": "string", 
    "generatedAt": "string",
    "hasRequiredFields": boolean,
    "error": "string" // only present if error occurred
  }
}
```

#### Response Properties

| Property | Type | Description |
|----------|------|-------------|
| `prompt` | string | Generated prompt with variables substituted |
| `missingFields` | string[] | List of required fields missing from context |
| `contextUsed` | string[] | List of context variables actually used |
| `metadata.templateId` | string | ID of the template used |
| `metadata.templateName` | string | Name of the template used |
| `metadata.generatedAt` | string | ISO timestamp of generation |
| `metadata.hasRequiredFields` | boolean | Whether all required fields were provided |

#### Example Request

```bash
curl -X POST http://localhost:3000/generate \
  -H "Content-Type: application/json" \
  -d '{
    "template": {
      "id": "greeting",
      "name": "User Greeting",
      "description": "Generate personalized user greetings",
      "template": "Hello {{name}}! Welcome to {{platform}}. As a {{role}}, you can {{action}}.",
      "role": "Assistant",
      "useCase": "User Onboarding",
      "requiredFields": ["name", "platform"],
      "optionalFields": ["role", "action"]
    },
    "context": {
      "name": "Alice",
      "platform": "ePrompt",
      "role": "developer", 
      "action": "access advanced AI tools"
    }
  }'
```

#### Example Response

```json
{
  "prompt": "Hello Alice! Welcome to ePrompt. As a developer, you can access advanced AI tools.",
  "missingFields": [],
  "contextUsed": ["name", "platform", "role", "action"],
  "metadata": {
    "templateId": "greeting",
    "templateName": "User Greeting",
    "generatedAt": "2025-07-09T10:30:00.000Z",
    "hasRequiredFields": true
  }
}
```

#### Error Examples

**Missing Template:**
```json
{
  "error": "Missing or invalid template"
}
```

**Missing Context:**
```json
{
  "error": "Missing or invalid context"
}
```

---

### POST /refine

Refine and optimize a prompt using AI-powered refinement tools.

#### Request Body

```json
{
  "prompt": "string",
  "refinementType": "string", // optional, defaults to "specific"
  "modelConfig": {            // optional, uses default OpenAI config if not provided
    "provider": "openai",
    "model": "GPT-4o",
    "temperature": 0.7,
    "maxTokens": 2000,
    "customApiHost": "string", // optional
    "customApiKey": "string"   // optional
  }
}
```

#### Request Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `prompt` | string | Yes | The prompt text to refine |
| `refinementType` | string | No | Type of refinement ("concise", "specific", "structured", "context", "constraints", "roleplay") |
| `modelConfig` | object | No | AI model configuration (uses default OpenAI config if not provided) |

#### Response

```json
{
  "refinedPrompt": "string",
  "originalPrompt": "string",
  "refinementTool": {
    "id": "string",
    "name": "string",
    "icon": "string",
    "description": "string",
    "color": "string"
  },
  "tokensUsed": "number",
  "latencyMs": "number"
}
```

#### Response Properties

| Property | Type | Description |
|----------|------|-------------|
| `refinedPrompt` | string | The AI-refined and optimized prompt |
| `originalPrompt` | string | The original input prompt |
| `refinementTool` | object | Information about the refinement tool used |
| `tokensUsed` | number | Number of AI tokens consumed |
| `latencyMs` | number | Response time in milliseconds |

---

### GET /refine/types

Get all available refinement types and tools.

#### Response

```json
{
  "types": ["string"],
  "tools": [
    {
      "id": "string",
      "name": "string", 
      "icon": "string",
      "description": "string",
      "color": "string"
    }
  ]
}
```

#### Available Refinement Tools

| ID | Name | Icon | Description | Color |
|-----|------|------|-------------|-------|
| `concise` | Make Concise | ✂️ | Remove unnecessary words and make it shorter | blue |
| `specific` | More Specific | 🎯 | Add clarity and specificity to reduce ambiguity | green |
| `structured` | Better Structure | 🏗️ | Improve organization and readability | indigo |
| `context` | Add Context | 📋 | Add more comprehensive context and examples | orange |
| `constraints` | Add Constraints | ⚙️ | Add technical constraints and output format guidance | gray |
| `roleplay` | Role-based | 🎭 | Add role-playing elements and persona guidance | purple |

#### Example Request

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

#### Example Response

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

#### Error Examples

**Missing Prompt:**
```json
{
  "error": "Missing or invalid prompt"
}
```

---

## Template Syntax

Templates use Handlebars syntax for variable substitution:

### Basic Variables

```
Hello {{name}}!
```

### Nested Objects (if context supports it)

```
Welcome {{user.name}} from {{user.company}}!
```

### Escaping

Variables are automatically HTML-escaped for security. Original content is preserved in the prompt generation process.

---

## Advanced Usage Examples

### Code Review Template

```json
{
  "template": {
    "id": "code-review",
    "name": "Code Review Template",
    "description": "Generate comprehensive code review prompts",
    "template": "As a {{role}}, review the following {{language}} code:\n\n```{{language}}\n{{code}}\n```\n\nPlease provide feedback on:\n- Correctness\n- Performance\n- Best practices\n- Security considerations\n\nFocus particularly on {{focus_areas}}.",
    "role": "Code Reviewer",
    "useCase": "Code Review",
    "requiredFields": ["role", "language", "code"],
    "optionalFields": ["focus_areas"]
  },
  "context": {
    "role": "Senior Software Engineer",
    "language": "JavaScript",
    "code": "function calculateTotal(items) {\n  return items.reduce((sum, item) => sum + item.price, 0);\n}",
    "focus_areas": "error handling and edge cases"
  }
}
```

### Blog Post Template

```json
{
  "template": {
    "id": "blog-post",
    "name": "Blog Post Outline",
    "description": "Generate blog post outlines",
    "template": "Create a comprehensive blog post outline about {{topic}} for {{audience}}.\n\nInclude:\n- {{sections}} main sections\n- Key points for each section\n- Call-to-action ideas\n\nTone: {{tone}}\nLength: {{length}} words",
    "role": "Content Creator",
    "useCase": "Content Generation",
    "requiredFields": ["topic", "audience", "sections"],
    "optionalFields": ["tone", "length"]
  },
  "context": {
    "topic": "machine learning for beginners",
    "audience": "software developers new to ML",
    "sections": "5",
    "tone": "friendly and educational",
    "length": "1500"
  }
}
```

### Email Template

```json
{
  "template": {
    "id": "email",
    "name": "Professional Email",
    "description": "Generate professional email content",
    "template": "Subject: {{subject}}\n\nDear {{recipient}},\n\n{{opening}}\n\n{{main_content}}\n\n{{closing}}\n\nBest regards,\n{{sender}}",
    "role": "Professional Communicator",
    "useCase": "Email Communication", 
    "requiredFields": ["subject", "recipient", "main_content", "sender"],
    "optionalFields": ["opening", "closing"]
  },
  "context": {
    "subject": "Project Update",
    "recipient": "Team",
    "opening": "I hope this email finds you well.",
    "main_content": "I wanted to provide you with an update on our current project status and next steps.",
    "closing": "Please let me know if you have any questions or concerns.",
    "sender": "Alice Johnson"
  }
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. This may be added in future versions.

## Versioning

The API follows semantic versioning. Current version: 1.0.0

Breaking changes will result in a major version bump.

---

## SDKs and Libraries

### JavaScript/TypeScript

```bash
npm install @eprompt/prompt-engine
```

```typescript
import { generatePrompt, createTemplate } from '@eprompt/prompt-engine';

const template = createTemplate({...});
const result = generatePrompt(template, context);
```

### cURL Examples

See individual endpoint documentation above for cURL examples.

---

## Support

For API support:
- Check the comprehensive test suite in the repository
- Review the example scripts in `/examples`
- Contact the development team

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history and changes.
