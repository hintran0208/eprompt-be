import { generateSearch } from '../search';

describe('search module', () => {
  const query = {
    text: "Search query",
    description: "Search test",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const options = { topK: 1 }

  it('search prompt with query', () => {
    const result = generateSearch(query, options);
    expect(Array.isArray(result.results)).toBe(true);
  });
});
