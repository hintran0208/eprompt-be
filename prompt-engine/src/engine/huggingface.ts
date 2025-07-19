let embeddingPipeline: any;

export interface HuggingfaceConfig {
  apiHost: string;
  apiKey: string;
  model: string;
  postFix: string;
}

const DEFAULT_CONFIG: HuggingfaceConfig ={
  apiHost: 'https://router.huggingface.co/hf-inference/models/',
  apiKey: process.env.HF_API_TOKEN || 'VTCTAYVOMSIUDyaYIRvFtZSqOMbhaPykrN',
  model: 'intfloat/multilingual-e5-large',
  postFix: '/pipeline/feature-extraction',
};

export async function getEmbedding(text: string, config: HuggingfaceConfig = DEFAULT_CONFIG): Promise<number[]> {
  console.log(`HuggingFace API request to ${config.apiHost}${config.model}${config.postFix} with text: ${text}`);
  const response = await fetch(`${config.apiHost}${config.model}${config.postFix}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer hf_${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inputs: text }),
  });
  
  if (!response.ok) {
    throw new Error(`HuggingFace API Error: ${response.statusText}`);
  }

  return await response.json();
}

