export interface ModelConfig {
  apiHost: string;
  apiKey: string;
  model: string;
}

const DEFAULT_CONFIG: ModelConfig ={
  apiHost: 'https://api.openai.com/v1/embeddings',
  apiKey: process.env.EMBEDDING_API_TOKEN || '',
  model: 'text-embedding-3-small',
};

export async function getEmbedding(text: string, config: ModelConfig = DEFAULT_CONFIG): Promise<number[]> {
  const url = `${config.apiHost}`;

  console.log(`API request to ${url} with text: ${text}`);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: config.model, input: text, encoding_format: 'float' }),
  });
  
  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return responseData.data[0].embedding;
}

