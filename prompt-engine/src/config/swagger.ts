import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "ePrompt API",
      version: "1.0.0",
      description: "A powerful API for generating and refining prompts using AI",
      contact: {
        name: "ePrompt Team",
        email: "support@eprompt.me",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === "production"
            ? "https://api.eprompt.me"
            : `http://localhost:${process.env.PORT || 3000}`,
        description:
          process.env.NODE_ENV === "production" ? "Production server" : "Development server",
      },
    ],
    components: {
      schemas: {
        PromptTemplate: {
          type: "object",
          required: ["id", "name", "description", "template", "role", "useCase", "requiredFields"],
          properties: {
            id: {
              type: "string",
              description: "Unique identifier for the template",
            },
            name: {
              type: "string",
              description: "Name of the template",
            },
            description: {
              type: "string",
              description: "Description of the template",
            },
            template: {
              type: "string",
              description: "The template string with placeholders",
            },
            role: {
              type: "string",
              description: "Role or persona for the AI",
            },
            useCase: {
              type: "string",
              description: "Use case category for the template",
            },
            requiredFields: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Array of required field names in the template",
            },
            optionalFields: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Array of optional field names in the template",
            },
            metadata: {
              type: "object",
              description: "Additional metadata for the template",
              additionalProperties: true,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Template creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Template last update timestamp",
            },
          },
          example: {
            id: "blog-post-template",
            name: "Blog Post Generator",
            description: "Template for generating blog posts",
            template: "Write a {{type}} blog post about {{topic}} targeting {{audience}}",
            role: "Content Writer",
            useCase: "Content Creation",
            requiredFields: ["type", "topic", "audience"],
            optionalFields: ["tone", "length"],
            metadata: {
              category: "content",
              difficulty: "beginner",
            },
            createdAt: "2025-07-12T10:00:00.000Z",
            updatedAt: "2025-07-12T10:00:00.000Z",
          },
        },
        CreatePromptTemplate: {
          type: "object",
          required: ["id", "name", "description", "template", "role", "useCase", "requiredFields"],
          properties: {
            id: {
              type: "string",
              description: "Unique identifier for the template",
            },
            name: {
              type: "string",
              description: "Name of the template",
            },
            description: {
              type: "string",
              description: "Description of the template",
            },
            template: {
              type: "string",
              description: "The template string with placeholders",
            },
            role: {
              type: "string",
              description: "Role or persona for the AI",
            },
            useCase: {
              type: "string",
              description: "Use case category for the template",
            },
            requiredFields: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Array of required field names in the template",
            },
            optionalFields: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Array of optional field names in the template",
            },
            metadata: {
              type: "object",
              description: "Additional metadata for the template",
              additionalProperties: true,
            },
          },
          example: {
            id: "email-template",
            name: "Professional Email Generator",
            description: "Template for generating professional emails",
            template: "Write a {{tone}} email to {{recipient}} about {{subject}}",
            role: "Professional Communicator",
            useCase: "Business Communication",
            requiredFields: ["tone", "recipient", "subject"],
            optionalFields: ["deadline", "context"],
            metadata: {
              category: "communication",
              formality: "professional",
            },
          },
        },
        PromptContext: {
          type: "object",
          description: "Context object containing values for template variables",
          additionalProperties: true,
          example: {
            type: "blog post",
            topic: "artificial intelligence",
          },
        },
        GeneratedPrompt: {
          type: "object",
          properties: {
            prompt: {
              type: "string",
              description: "The generated prompt",
            },
            missingFields: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Fields that were missing from the context",
            },
            contextUsed: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Fields that were used from the context",
            },
            metadata: {
              type: "object",
              description: "Additional metadata about the generation",
            },
          },
          example: {
            prompt: "Generate a blog post about artificial intelligence",
            missingFields: [],
            contextUsed: ["type", "topic"],
            metadata: {
              generatedAt: "2025-07-10T12:00:00.000Z",
              templateUsed: "Generate a {{type}} about {{topic}}",
            },
          },
        },
        ModelConfig: {
          type: "object",
          properties: {
            provider: {
              type: "string",
              enum: ["openai", "anthropic", "google", "local"],
              description: "AI provider",
              default: "openai",
            },
            model: {
              type: "string",
              description: "Model name",
              example: "GPT-4o",
            },
            temperature: {
              type: "number",
              minimum: 0,
              maximum: 2,
              description: "Sampling temperature",
              example: 0.7,
            },
            maxTokens: {
              type: "number",
              minimum: 1,
              description: "Maximum tokens to generate",
              example: 2000,
            },
            topP: {
              type: "number",
              minimum: 0,
              maximum: 1,
              description: "Top-p sampling parameter",
              example: 1,
            },
            frequencyPenalty: {
              type: "number",
              minimum: -2,
              maximum: 2,
              description: "Frequency penalty",
              example: 0,
            },
            presencePenalty: {
              type: "number",
              minimum: -2,
              maximum: 2,
              description: "Presence penalty",
              example: 0,
            },
            customApiHost: {
              type: "string",
              description: "Custom API host URL",
              example: "https://api.openai.com/v1",
            },
            customApiKey: {
              type: "string",
              description: "Custom API key",
              example: "Bearer sk-...",
            },
          },
          example: {
            provider: "openai",
            model: "GPT-4o",
            temperature: 0.7,
            maxTokens: 2000,
          },
        },
        AIGenerationRequest: {
          type: "object",
          required: ["text"],
          properties: {
            text: {
              type: "string",
              description: "The text content to send to AI",
              example: "Write a brief introduction about artificial intelligence.",
            },
            modelConfig: {
              $ref: "#/components/schemas/ModelConfig",
            },
            systemPrompt: {
              type: "string",
              description: "Optional system prompt to provide context",
              example:
                "You are a helpful AI assistant that provides clear and informative responses.",
            },
          },
        },
        AIGenerationResponse: {
          type: "object",
          properties: {
            text: {
              type: "string",
              description: "The original input text",
            },
            result: {
              type: "string",
              description: "The AI-generated response",
            },
            tokensUsed: {
              type: "number",
              description: "Number of tokens used in the API call",
            },
            latencyMs: {
              type: "number",
              description: "Processing time in milliseconds",
            },
            modelConfig: {
              $ref: "#/components/schemas/ModelConfig",
            },
            timestamp: {
              type: "string",
              format: "date-time",
              description: "Timestamp of the generation",
            },
          },
          example: {
            text: "Write a brief introduction about artificial intelligence.",
            result:
              "Artificial Intelligence (AI) is a branch of computer science that focuses on creating systems capable of performing tasks that typically require human intelligence...",
            tokensUsed: 156,
            latencyMs: 1250,
            modelConfig: {
              provider: "openai",
              model: "GPT-4o",
              temperature: 0.7,
              maxTokens: 2000,
            },
            timestamp: "2025-07-12T10:30:00.000Z",
          },
        },
        RefinementTool: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Tool identifier",
            },
            name: {
              type: "string",
              description: "Tool name",
            },
            icon: {
              type: "string",
              description: "Tool icon",
            },
            description: {
              type: "string",
              description: "Tool description",
            },
            color: {
              type: "string",
              description: "Tool color",
            },
          },
        },
        RefinementTypesResponse: {
          type: "object",
          properties: {
            prompt: {
              type: "object",
              properties: {
                types: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  description: "Available prompt refinement types",
                },
                tools: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/RefinementTool",
                  },
                },
              },
            },
            content: {
              type: "object",
              properties: {
                types: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  description: "Available content refinement types",
                },
                tools: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/RefinementTool",
                  },
                },
              },
            },
          },
        },
        RefinementRequest: {
          type: "object",
          properties: {
            prompt: {
              type: "string",
              description: "The prompt to refine (for prompt refinement)",
            },
            content: {
              type: "string",
              description: "The content to refine (for content refinement)",
            },
            refinementType: {
              type: "string",
              description: "Type of refinement to apply",
              example: "specific",
            },
            modelConfig: {
              $ref: "#/components/schemas/ModelConfig",
            },
          },
        },
        RefinementResponse: {
          type: "object",
          properties: {
            refinedPrompt: {
              type: "string",
              description: "The refined prompt (for prompt refinement)",
            },
            refinedContent: {
              type: "string",
              description: "The refined content (for content refinement)",
            },
            originalPrompt: {
              type: "string",
              description: "The original prompt (for prompt refinement)",
            },
            originalContent: {
              type: "string",
              description: "The original content (for content refinement)",
            },
            refinementTool: {
              type: "object",
              description: "Information about the refinement tool used",
            },
            tokensUsed: {
              type: "number",
              description: "Number of AI tokens used",
            },
            latencyMs: {
              type: "number",
              description: "Processing time in milliseconds",
            },
          },
        },
        SemanticSearchTemplate: {
          type: "object",
          required: ["text"],
          properties: {
            text: {
              type: "string",
              description: "Semantic search query",
            },
          },
          example: {
            text: "{{search question}}",
          },
        },
        SemanticSearchOptions: {
          type: "object",
          properties: {
            topK: {
              type: "number",
              description: "number of closest matches",
            },
          },
          additionalProperties: true,
          example: {
            topK: 1,
          },
        },
        SemanticSearchResult: {
          type: "object",
          properties: {
            text: {
              type: "string",
              description: "semantic search result",
            },
            score: {
              type: "number",
              description: "semantic similarity score",
            },
          },
          example: {
            text: "This is the result",
            score: 0.69,
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Error message",
            },
          },
          example: {
            error: "Missing or invalid template",
          },
        },
        WelcomeResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Welcome message",
            },
            version: {
              type: "string",
              description: "API version",
            },
            description: {
              type: "string",
              description: "API description",
            },
            endpoints: {
              type: "object",
              description: "Available endpoints",
            },
            timestamp: {
              type: "string",
              format: "date-time",
              description: "Current timestamp",
            },
          },
        },
        HealthResponse: {
          type: "object",
          properties: {
            status: {
              type: "string",
              enum: ["OK"],
              description: "Health status",
            },
            timestamp: {
              type: "string",
              format: "date-time",
              description: "Current timestamp",
            },
          },
        },
      },
    },
  },
  apis: ["./src/server.ts", "./src/routes/*.ts"], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
