let embeddingPipeline: any;

export async function getEmbedding(text: string): Promise<number[]> {
  const TransformersApi = Function('return import("@huggingface/transformers")')();
  const { pipeline } = await TransformersApi;
  if (!embeddingPipeline) {
    embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }

  const result = await embeddingPipeline(text, {
    pooling: 'mean',
    normalize: true,
  });

  return Array.from(result.data);
}
