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
        email: "support@eprompt.com",
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
            ? "https://api.eprompt.com"
            : `http://localhost:${process.env.PORT || 3000}`,
        description:
          process.env.NODE_ENV === "production" ? "Production server" : "Development server",
      },
    ],
    components: {
      schemas: {
        PromptTemplate: {
          type: "object",
          required: ["template"],
          properties: {
            template: {
              type: "string",
              description: "The template string with placeholders",
            },
            variables: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Array of variable names used in the template",
            },
          },
          example: {
            template: "Generate a {{type}} about {{topic}}",
            variables: ["type", "topic"],
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
            metadata: {
              type: "object",
              description: "Additional metadata about the generation",
            },
          },
          example: {
            prompt: "Generate a blog post about artificial intelligence",
            metadata: {
              generatedAt: "2025-07-10T12:00:00.000Z",
              templateUsed: "Generate a {{type}} about {{topic}}",
            },
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
