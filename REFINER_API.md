# Prompt Refiner API Documentation

## Overview

The Prompt Refiner API provides AI-powered tools to improve and optimize prompts. It offers 8 different refinement strategies to enhance prompt quality, clarity, and effectiveness.

## Endpoints

### 1. Get Available Refiner Tools

**GET** `/api/v1/refiner/tools`

Returns a list of all available prompt refinement tools.

**Response:**
```json
{
  "tools": [
    {
      "id": "concise",
      "name": "Make Concise",
      "icon": "✂️",
      "description": "Remove unnecessary words and make it shorter",
      "color": "blue"
    },
    {
      "id": "specific",
      "name": "More Specific",
      "icon": "🎯",
      "description": "Add clarity and specificity to reduce ambiguity",
      "color": "green"
    }
    // ... more tools
  ],
  "count": 8
}
```

### 2. Refine a Prompt

**POST** `/api/v1/refiner/refine`

Refines a prompt using the specified AI-powered tool.

**Request Body:**
```json
{
  "content": "Your prompt content to be refined",
  "tool_id": "concise",
  "ai_model_config": {
    "provider": "openai",
    "model": "gpt-4",
    "temperature": 0.3,
    "max_tokens": 1000,
    "custom_api_host": "https://aiportalapi.stu-platform.live/jpe/v1",
    "custom_api_key": "Bearer sk-dwFEogyru-tSQqgObMgpKw"
  }
}
```

**Response:**
```json
{
  "refined_content": "The improved prompt content (only refined content, no explanations)",
  "tool_used": "Make Concise",
  "tool_id": "concise",
  "original_length": 156,
  "refined_length": 89,
  "tokens_used": 45,
  "latency_ms": 1250,
  "timestamp": "2025-07-08T10:30:45.123456"
}
```

## Available Refiner Tools

1. **concise** - Make Concise ✂️
   - Removes unnecessary words while preserving key information
   - Makes prompts shorter and more direct

2. **specific** - More Specific 🎯
   - Adds clarity and specificity to reduce ambiguity
   - Provides clearer instructions and expectations

3. **friendly** - Make Friendly 😊
   - Adds warmth and conversational tone
   - Makes prompts more approachable and engaging

4. **professional** - Make Professional 👔
   - Adds formal language and professional structure
   - Suitable for business and formal contexts

5. **structured** - Better Structure 🏗️
   - Improves organization and readability
   - Adds clear sections and logical flow

6. **context** - Add Context 📋
   - Adds more comprehensive context and examples
   - Provides background information and use cases

7. **constraints** - Add Constraints ⚙️
   - Adds technical constraints and output format guidance
   - Specifies requirements and limitations

8. **roleplay** - Role-based 🎭
   - Adds role-playing elements and persona guidance
   - Transforms prompts to include character roles

## Key Features

### Refined Content Only
The API is specifically designed to return **only the refined content** without explanations or meta-commentary. This makes it perfect for direct integration into applications where you need clean, improved prompts.

### Content Extraction
The refiner service automatically:
- Removes AI response prefixes like "Here's the improved prompt:"
- Strips explanatory text and meta-commentary
- Cleans up formatting and quotes
- Returns pure, refined prompt content

### Error Handling
- **422 Validation Error**: Invalid request format or missing required fields
- **500 Internal Server Error**: Tool not found, empty content, or AI processing errors

## Integration Example

### Frontend Integration (JavaScript)
```javascript
// Get available tools
const toolsResponse = await fetch('/api/v1/refiner/tools');
const { tools } = await toolsResponse.json();

// Refine a prompt
const refineResponse = await fetch('/api/v1/refiner/refine', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: originalPrompt,
    tool_id: 'concise',
    ai_model_config: modelConfig
  })
});

const { refined_content } = await refineResponse.json();
// Use refined_content directly - it contains only the improved prompt
```

### Backend Integration (Python)
```python
import requests

# Refine a prompt
response = requests.post('http://localhost:8001/api/v1/refiner/refine', json={
    'content': 'Your long and verbose prompt that needs improvement...',
    'tool_id': 'concise',
    'ai_model_config': {
        'provider': 'openai',
        'model': 'gpt-4',
        'temperature': 0.3,
        'max_tokens': 1000
    }
})

if response.status_code == 200:
    data = response.json()
    refined_prompt = data['refined_content']  # Clean, refined content only
    print(f"Improved from {data['original_length']} to {data['refined_length']} characters")
```

## Model Configuration

The `ai_model_config` object supports:
- **provider**: "openai", "anthropic", "google", "local"
- **model**: Model name (e.g., "gpt-4", "gpt-3.5-turbo")
- **temperature**: 0.0-2.0 (lower values for more consistent refinements)
- **max_tokens**: Maximum tokens for the refined output
- **custom_api_host**: Custom API endpoint
- **custom_api_key**: Custom API key with Bearer prefix

## Best Practices

1. **Use Lower Temperature**: Set temperature to 0.3 or lower for consistent refinements
2. **Choose Appropriate Tools**: Select tools based on your specific needs
3. **Chain Refinements**: Apply multiple tools sequentially for complex improvements
4. **Validate Length**: Check if the refined content meets your length requirements
5. **Monitor Tokens**: Track token usage for cost management

## Testing

The API includes comprehensive test coverage:
```bash
cd eprompt-be
python -m pytest tests/test_refiner_api.py -v
```

## Status

✅ **Production Ready**
- Fully implemented and tested
- Integrated with existing prompt engine
- Consistent API patterns
- Error handling and validation
- Clean response format (refined content only)
