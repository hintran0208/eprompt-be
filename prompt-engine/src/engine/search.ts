import { BaseTemplate, PromptContext } from "./types";
import { getEmbedding } from './huggingface';
import PublicPromptTemplateModel from '../models/PromptTemplate';

export async function generateSearch(
    query: BaseTemplate,
    options: PromptContext
): Promise<{
    results: object[];
    metadata?: Record<string, any>;
}> {
    // placeholder
    return {
        results: [
            {
                text: "result",
                score: 0.8,
            },
            {
                text: "result2",
                score: 0.78,
            },
        ],
    };
}

export const semanticSearch = async (query: string, limit: number = 10) => {
    const embedding = await getEmbedding(query);
  
    const results = await PublicPromptTemplateModel.aggregate([
      {
        $vectorSearch: {
          index: 'default_vector_search_index',
          queryVector: embedding,
          path: 'embedding',
          numCandidates: 100,
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
    ]);
  
    return results;
  };