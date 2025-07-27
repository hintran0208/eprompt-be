import { describe, it, expect } from '@jest/globals';
import { extractPrefixes } from '../search';

describe('extractPrefixes (anywhere, ordered)', () => {
  it('extracts all valid prefixes from anywhere, returns in PREFIXES order', () => {
    const result = extractPrefixes('vault:template:content:initial-prompt:refined-prompt:query');
    expect(result).toEqual({
      prefixes: ['template', 'vault', 'initial-prompt', 'refined-prompt', 'content'],
      query: 'query',
    });
  });

  it('extracts prefixes even if not at start', () => {
    const result = extractPrefixes('search vault: for something');
    expect(result).toEqual({ prefixes: ['vault'], query: 'search for something' });
  });

  it('removes all found prefixes from query', () => {
    const result = extractPrefixes('vault: search vault:template:');
    expect(result).toEqual({ prefixes: ['template', 'vault'], query: 'search' });
  });

  it('returns prefixes in PREFIXES order', () => {
    const result = extractPrefixes('content:vault:template:refined-prompt:initial-prompt:foo');
    expect(result.prefixes).toEqual(['template', 'vault', 'initial-prompt', 'refined-prompt', 'content']);
    expect(result.query).toBe('foo');
  });

  it('defaults to template if no prefix', () => {
    const result = extractPrefixes('just some query');
    expect(result).toEqual({ prefixes: ['template'], query: 'just some query' });
  });

  it('handles repeated prefixes and extra spaces', () => {
    const result = extractPrefixes('  template: vault: vault:  query  ');
    expect(result).toEqual({ prefixes: ['template', 'vault'], query: 'query' });
  });

  it('does not remove similar words', () => {
    const result = extractPrefixes('vault: search vaults and templates');
    expect(result).toEqual({ prefixes: ['vault'], query: 'search vaults and templates' });
  });
});
