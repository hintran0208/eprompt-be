import { getEmbedding } from './embedding';
import PublicPromptTemplateModel from '../models/PromptTemplate';

const THRESHOLD_SCORE = 0.6;

export const semanticSearch = async (query: string, limit: number = 10) => {
    const embedding = await getEmbedding(query);
  
    const results = await PublicPromptTemplateModel.aggregate([
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
          score: { $gt: THRESHOLD_SCORE }
        }
      }
    ]);
  
    return results;
  };