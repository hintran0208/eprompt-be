import { getEmbedding } from './embedding';
import PublicPromptTemplateModel from '../models/PromptTemplate';
import VaultItemModel from '../models/Vault';

const THRESHOLD_SCORE = 0.6;
const PREFIXES = ['template:', 'vault:', 'initial-prompt:', 'refined-prompt:', 'content:'];

function extractPrefixes(query: string): { prefixes: string[], query: string } {
  const prefixes: string[] = [];
  let remainingQuery = query;

  PREFIXES.forEach(prefix => {
    if (remainingQuery.startsWith(prefix)) {
      prefixes.push(prefix.replace(':', ''));
      remainingQuery = remainingQuery.slice(prefix.length).trim();
    }
  });

 
  const finalPrefixes = prefixes.length > 0 ? prefixes : ['template'];

  return {
    prefixes: finalPrefixes,
    query: remainingQuery.trim(),
  };
}

async function searchTemplate(embedding: number[], limit: number) {
    return await PublicPromptTemplateModel.aggregate([
      {
        $vectorSearch: {
          index: 'default_vector_search_index',
          queryVector: embedding,
          path: 'embedding',
          numCandidates: 10,
          limit: limit,
        },
      },
      {
        $project: {
          _id: 0,
          id: 1,
          name: 1,
          description: 1,
          template: 1,
          role: 1,
          tags: 1,
          requiredFields: 1,
          optionalFields: 1,
          metadata: 1,
          createdAt: 1,
          updatedAt: 1,
          score: { $meta: 'vectorSearchScore' }, // Ranking score
        },
      },
      {
        $match: {
          score: { $gt: THRESHOLD_SCORE },
        },
      },
    ]);
}

async function searchVaultField(field: string, embedding: number[], limit: number, userId: string = 'admin') {
  return await VaultItemModel.aggregate([
    {
      $vectorSearch: {
        index: 'vault_vector_search_index',
        queryVector: embedding,
        path: field, // Dynamic field based on prefix
        numCandidates: 10,
        limit: limit,
      },
    },
    {
      $match: {
        userId: userId, // Filter by userId
      },
    },
    {
      $project: {
        _id: 0,
        vaultId: 1,
        name: 1,
        initialPrompt: 1,
        refinedPrompt: 1,
        generatedContent: 1,
        score: { $meta: 'vectorSearchScore' }, // Ranking score
      },
    },
    {
      $match: {
        score: { $gt: THRESHOLD_SCORE },
      },
    },
  ]);
}

export const semanticSearch = async (query: string, limit: number = 10, userId: string = 'admin') => {
  const { prefixes, query: remainingQuery } = extractPrefixes(query);
  const embedding = await getEmbedding(remainingQuery);

  const results: Record<string, any[]> = {};

  const limitPerPrefix = Math.floor(limit / prefixes.length);

  for (const prefix of prefixes) {
    switch (prefix) {
      case 'template':
        results[prefix] = await searchTemplate(embedding, limitPerPrefix);
        break;
      case 'vault':
        results[prefix] = await searchVaultField('nameEmbedding', embedding, limitPerPrefix, userId);
        break;
      case 'initial-prompt':
        results[prefix] = await searchVaultField('initialPromptEmbedding', embedding, limitPerPrefix, userId);
        break;
      case 'refined-prompt':
        results[prefix] = await searchVaultField('refinedPromptEmbedding', embedding, limitPerPrefix, userId);
        break;
      case 'content':
        results[prefix] = await searchVaultField('generatedContentEmbedding', embedding, limitPerPrefix, userId);
        break;
      default:
        results[prefix] = [];
    }
  }

  return results;
};