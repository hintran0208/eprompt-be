import { refinerTools, getRefinerTools } from '../refiner';

describe('refinerTools module', () => {
  it('should export all expected refiner tools', () => {
    expect(Array.isArray(refinerTools)).toBe(true);
    expect(refinerTools.length).toBeGreaterThanOrEqual(6);
    const ids = refinerTools.map(t => t.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        'concise',
        'specific',
        'structured',
        'context',
        'constraints',
        'roleplay'
      ])
    );
  });

  it('should have all required fields for each tool', () => {
    for (const tool of refinerTools) {
      expect(typeof tool.id).toBe('string');
      expect(typeof tool.name).toBe('string');
      expect(typeof tool.icon).toBe('string');
      expect(typeof tool.prompt).toBe('string');
      expect(typeof tool.description).toBe('string');
      expect(typeof tool.color).toBe('string');
    }
  });
});

describe('getRefinerTools', () => {
  it('should return the same array as refinerTools', () => {
    expect(getRefinerTools()).toBe(refinerTools);
  });

  it('should return an array of RefinerTool objects', () => {
    const tools = getRefinerTools();
    for (const tool of tools) {
      expect(tool).toHaveProperty('id');
      expect(tool).toHaveProperty('name');
    }
  });
});
