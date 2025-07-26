import { describe, it, expect, jest } from '@jest/globals';
import { generatePrompt, createTemplate } from '../generator';
import { createVaultItem } from '../vault';

jest.mock('../vault'); // Mock vault functions to avoid actual API calls
(createVaultItem as any).mockResolvedValue({vaultId: 'test'});

describe('generator module', () => {
  const template = createTemplate({
    id: 'test',
    name: 'Test',
    description: 'Test',
    template: 'Hello {{name}} from {{company}}',
    role: 'Dev'
  });

  it('generates prompt with all fields', async () => {
    const context = { name: 'Alice', company: 'Acme' };
    const result = await generatePrompt(template, context);
    expect(result.prompt).toBe('Hello Alice from Acme');
    expect(result.missingFields).toEqual([]);
    expect(result.contextUsed).toEqual(['name', 'company']);
  });

  it('detects missing fields', async () => {
    const context = { name: 'Alice' };
    const result = await generatePrompt(template, context);
    expect(result.missingFields).toEqual(['company']);
  });

  it('sanitizes context', async () => {
    const context = { name: 'Alice {{evil}}', company: 'Acme' };
    const result = await generatePrompt(template, context);
    expect(result.prompt).toContain('Alice \\{\\{evil\\}\\}');
  });
});
