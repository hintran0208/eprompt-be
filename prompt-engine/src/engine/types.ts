// Core types for PromptVerse

export type BaseTemplate = {
  text: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export type PromptTemplate = {
  id: string;
  name: string;
  description: string;
  template: string;
  role: string;
  tags: string[];
  requiredFields: string[];
  optionalFields?: string[];
  metadata?: Record<string, any>;
  embedding?: number[];
  createdAt: Date;
  updatedAt: Date;
};

export type PromptContext = {
  [key: string]: string | number | boolean | Date | undefined;
};

export type PromptOutput = {
  prompt: string;
  missingFields: string[];
  contextUsed: string[];
  metadata?: Record<string, any>;
};

export type ModelConfig = {
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

export type PromptResult = {
  prompt: string;
  result: string;
  sections?: Record<string, string>;
  tokensUsed?: number;
  latencyMs?: number;
  modelConfig: ModelConfig;
  timestamp: Date;
};

export type PromptHistoryItem = {
  id: string;
  templateId: string;
  context: PromptContext;
  output: PromptOutput;
  result?: PromptResult;
  createdAt: Date;
};

export type UIState = {
  selectedTemplate: PromptTemplate | null;
  currentContext: PromptContext;
  promptHistory: PromptHistoryItem[];
  isGenerating: boolean;
  error: string | null;
};

export type TemplateFilter = {
  role?: string;
  tags?: string[];
  search?: string;
};

export type RefinerAction = 'make-concise' | 'make-friendly' | 'make-formal' | 'add-examples' | 'simplify';
