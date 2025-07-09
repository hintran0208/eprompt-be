#!/usr/bin/env ts-node

/**
 * Example script demonstrating the prompt engine functionality
 * Run with: npx ts-node examples/basic-usage.ts
 */

import { generatePrompt, createTemplate, refinerTools } from '../src/engine';

console.log('🚀 ePrompt Engine - Basic Usage Examples\n');

// Example 1: Basic Prompt Generation
console.log('📝 Example 1: Basic Prompt Generation');
console.log('=====================================');

const greetingTemplate = createTemplate({
  id: 'greeting',
  name: 'Greeting Template',
  description: 'Generate personalized greetings',
  template: 'Hello {{name}}! Welcome to {{platform}}. As a {{role}}, you have access to {{features}}.',
  role: 'Assistant',
  useCase: 'User Onboarding'
});

const greetingContext = {
  name: 'Alice',
  platform: 'ePrompt',
  role: 'developer',
  features: 'advanced AI tools'
};

const greetingResult = generatePrompt(greetingTemplate, greetingContext);
console.log('Generated Prompt:', greetingResult.prompt);
console.log('Missing Fields:', greetingResult.missingFields);
console.log('Context Used:', greetingResult.contextUsed);
console.log('');

// Example 2: Code Review Template
console.log('🔍 Example 2: Code Review Template');
console.log('==================================');

const codeReviewTemplate = createTemplate({
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
- Potential improvements

Focus on {{focus_areas}} and provide specific examples.`,
  role: 'Code Reviewer',
  useCase: 'Code Review'
});

const codeReviewContext = {
  role: 'Senior Software Engineer',
  language: 'JavaScript',
  code: 'function sum(arr) { return arr.reduce((a, b) => a + b, 0); }',
  focus_areas: 'error handling and edge cases'
};

const codeReviewResult = generatePrompt(codeReviewTemplate, codeReviewContext);
console.log('Generated Code Review Prompt:');
console.log(codeReviewResult.prompt);
console.log('');

// Example 3: Prompt Refinement
console.log('✨ Example 3: AI-Powered Prompt Refinement');
console.log('===========================================');

const basicPrompt = 'Write about AI';
console.log('Original Prompt:', JSON.stringify(basicPrompt));

// Note: This would make actual AI API calls in a real scenario
// For demonstration, we'll show what the API call would look like
console.log('\nRefinement options available:');
refinerTools.forEach((tool, index) => {
  console.log(`${index + 1}. ${tool.name} (${tool.id}) ${tool.icon}`);
  console.log(`   ${tool.description}`);
});

console.log('\nTo refine a prompt with AI (makes real API call to OpenAI):');
console.log('const result = await refinePrompt(basicPrompt, "specific");');
console.log('// This makes a real AI API call and returns:');
console.log('// {');
console.log('//   refinedPrompt: "Create a comprehensive guide about artificial intelligence...",');
console.log('//   originalPrompt: "Write about AI",');
console.log('//   refinementTool: { id: "specific", name: "More Specific", ... },');
console.log('//   tokensUsed: 156,');
console.log('//   latencyMs: 1250');
console.log('// }');
console.log('');

// Example 4: Simple Text Processing (non-AI)
console.log('🛠️  Example 4: Available Refinement Tools');
console.log('==========================================');

console.log('Available refinement tools:');
refinerTools.forEach((tool, index) => {
  console.log(`${index + 1}. ${tool.name} (${tool.id})`);
  console.log(`   ${tool.icon} ${tool.description}`);
  console.log(`   Color: ${tool.color}`);
  console.log('');
});

console.log('Example usage with different refinement types:');
console.log('await refinePrompt("Write code", "concise")     // Make it shorter');
console.log('await refinePrompt("Write code", "specific")    // Add specificity'); 
console.log('await refinePrompt("Write code", "structured")  // Better organization');
console.log('await refinePrompt("Write code", "context")     // Add context');
console.log('await refinePrompt("Write code", "constraints") // Add constraints');
console.log('await refinePrompt("Write code", "roleplay")    // Add role-playing');
console.log('');

// Example 5: Error Handling
console.log('⚠️  Example 5: Error Handling');
console.log('=============================');

const incompleteTemplate = createTemplate({
  id: 'incomplete',
  name: 'Incomplete Template',
  description: 'Template with missing context',
  template: 'Hello {{name}}! Your {{item}} is ready. Please {{action}} by {{deadline}}.',
  role: 'System',
  useCase: 'Notifications'
});

const incompleteContext = {
  name: 'Bob',
  item: 'order'
  // Missing: action, deadline
};

const incompleteResult = generatePrompt(incompleteTemplate, incompleteContext);
console.log('Generated Prompt:', incompleteResult.prompt);
console.log('Missing Fields:', incompleteResult.missingFields);
console.log('Has Required Fields:', incompleteResult.metadata?.hasRequiredFields);
console.log('');

console.log('✅ Examples completed! Check the output above to see how the prompt engine works.');
console.log('💡 Tip: You can modify the templates and contexts to experiment with different scenarios.');
