import { describe, it, expect } from '@jest/globals';
import { generatePrompt, createTemplate } from '../generator';

describe('generator module', () => {
  const template = createTemplate({
    id: 'test',
    name: 'Test',
    description: 'Test',
    template: 'Hello {{name}} from {{company}}',
    role: 'Dev',
    useCase: 'Test'
  });

  it('generates prompt with all fields', () => {
    const context = { name: 'Alice', company: 'Acme' };
    const result = generatePrompt(template, context);
    expect(result.prompt).toBe('Hello Alice from Acme');
    expect(result.missingFields).toEqual([]);
    expect(result.contextUsed).toEqual(['name', 'company']);
  });

  it('detects missing fields', () => {
    const context = { name: 'Alice' };
    const result = generatePrompt(template, context);
    expect(result.missingFields).toEqual(['company']);
  });

  it('sanitizes context', () => {
    const context = { name: 'Alice {{evil}}', company: 'Acme' };
    const result = generatePrompt(template, context);
    expect(result.prompt).toContain('Alice \\{\\{evil\\}\\}');
  });
});
