import { getEmbedding } from './embedding';
import PublicPromptTemplateModel from '../models/PromptTemplate';
import { searchPrefix } from './types';

const THRESHOLD_SCORE = 0.6;

const searchPrefixObject: searchPrefix = {
  ":default ": [ PublicPromptTemplateModel, {
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
    score: { $meta: 'vectorSearchScore' },
  }],
  ":template ": [ PublicPromptTemplateModel, {
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
    score: { $meta: 'vectorSearchScore' },
  }],
};

export const extractPrefix = (query: string) => {
  for (const prefix in searchPrefixObject) {
      if (query.startsWith(prefix)) {
        const text = query.slice(prefix.length).trim();
        return { prefix, text };
      }
  }
  return { prefix: ':default ', text: query }
}

export const semanticSearch = async (prefix: string, query: string, limit: number = 10) => {
    const embedding = await getEmbedding(query);
  
    return await searchPrefixObject[prefix][0].aggregate([
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
        $project: searchPrefixObject[prefix][1],
      },
      {
        $match: {
          score: { $gt: THRESHOLD_SCORE }
        }
      }
    ]);
  };