# app/services/prompt_engine.py
"""
Core prompt engine service for processing templates and generating prompts.
This is a Python implementation of the TypeScript prompt-engine package.
"""

import re
import json
import httpx
from datetime import datetime
from typing import Dict, List, Optional, Any, Union
from jinja2 import Template, Environment, StrictUndefined
from app.core.config import settings


class PromptEngineError(Exception):
    """Custom exception for prompt engine errors."""
    pass


class AIClientError(Exception):
    """Custom exception for AI client errors."""
    pass


class PromptEngine:
    """Core prompt engine for processing templates and generating prompts."""
    
    def __init__(self):
        # Use Jinja2 with strict undefined to catch missing variables
        self.jinja_env = Environment(
            undefined=StrictUndefined,
            trim_blocks=True,
            lstrip_blocks=True
        )
    
    def extract_template_variables(self, template: str) -> List[str]:
        """
        Extract template variables from a Jinja2/Handlebars-style template string.
        
        Args:
            template: The template string with {{variable}} placeholders
            
        Returns:
            List of unique variable names found in the template
        """
        variables = set()
        # Match {{variable}} patterns, similar to Handlebars
        pattern = r'\{\{\s*([^}]+)\s*\}\}'
        
        for match in re.finditer(pattern, template):
            variable = match.group(1).strip()
            # Handle simple variables only (no helpers, conditionals, etc.)
            if (' ' not in variable and 
                not variable.startswith('#') and 
                not variable.startswith('/') and
                not variable.startswith('if ') and
                not variable.startswith('for ') and
                not variable.startswith('endif') and
                not variable.startswith('endfor')):
                variables.add(variable)
        
        return sorted(list(variables))
    
    def validate_required_fields(self, required_fields: List[str], context: Dict[str, Any]) -> List[str]:
        """
        Validate that all required fields are present in the context.
        
        Args:
            required_fields: List of required field names
            context: The context dictionary
            
        Returns:
            List of missing field names
        """
        missing_fields = []
        
        for field in required_fields:
            value = context.get(field)
            if value is None or value == '' or (isinstance(value, str) and value.strip() == ''):
                missing_fields.append(field)
                
        return missing_fields
    
    def get_used_context_fields(self, template: str, context: Dict[str, Any]) -> List[str]:
        """
        Determine which context fields were actually used in the template.
        
        Args:
            template: The template string
            context: The context dictionary
            
        Returns:
            List of context field names that were used
        """
        template_variables = self.extract_template_variables(template)
        used_fields = []
        
        for variable in template_variables:
            value = context.get(variable)
            if value is not None and value != '' and not (isinstance(value, str) and value.strip() == ''):
                used_fields.append(variable)
                
        return used_fields
    
    def sanitize_context(self, context: Dict[str, Any]) -> Dict[str, str]:
        """
        Sanitize context values to prevent injection attacks and ensure string values.
        
        Args:
            context: The context dictionary
            
        Returns:
            Sanitized context dictionary with string values
        """
        sanitized = {}
        
        for key, value in context.items():
            if value is not None:
                # Convert to string and escape potentially dangerous characters
                string_value = str(value)
                # Escape template syntax to prevent injection
                sanitized_value = (string_value
                                 .replace('{{', '\\{\\{')
                                 .replace('}}', '\\}\\}')
                                 .strip())
                sanitized[key] = sanitized_value
            else:
                sanitized[key] = ''
                
        return sanitized
    
    def generate_prompt(self, template_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Core function to generate a prompt from a template and context.
        
        Args:
            template_data: Dictionary containing template information
            context: The context dictionary with values to fill in
            
        Returns:
            Dictionary with generated prompt and metadata
        """
        try:
            template_id = template_data.get('id', 'unknown')
            template_name = template_data.get('name', 'Unknown Template')
            template_string = template_data.get('template', '')
            required_fields = template_data.get('requiredFields', [])
            
            # Validate required fields
            missing_fields = self.validate_required_fields(required_fields, context)
            
            # Sanitize context to prevent injection
            sanitized_context = self.sanitize_context(context)
            
            # Create and render the Jinja2 template
            # Convert {{variable}} syntax to Jinja2 {{variable}} syntax (they're the same)
            jinja_template = self.jinja_env.from_string(template_string)
            
            # Generate the prompt
            try:
                prompt = jinja_template.render(**sanitized_context)
            except Exception as render_error:
                # If rendering fails due to missing variables, create a partial render
                # by providing empty strings for missing variables
                all_variables = self.extract_template_variables(template_string)
                complete_context = sanitized_context.copy()
                for var in all_variables:
                    if var not in complete_context:
                        complete_context[var] = f"[{var}]"  # Placeholder for missing vars
                
                prompt = jinja_template.render(**complete_context)
            
            # Determine which context fields were used
            context_used = self.get_used_context_fields(template_string, sanitized_context)
            
            return {
                'prompt': prompt.strip(),
                'missing_fields': missing_fields,
                'context_used': context_used,
                'metadata': {
                    'template_id': template_id,
                    'template_name': template_name,
                    'generated_at': datetime.utcnow().isoformat(),
                    'has_required_fields': len(missing_fields) == 0
                }
            }
            
        except Exception as error:
            return {
                'prompt': '',
                'missing_fields': template_data.get('requiredFields', []),
                'context_used': [],
                'metadata': {
                    'template_id': template_data.get('id', 'unknown'),
                    'template_name': template_data.get('name', 'Unknown Template'),
                    'generated_at': datetime.utcnow().isoformat(),
                    'has_required_fields': False,
                    'error': str(error)
                }
            }
    
    def preview_prompt(self, template_data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a preview of the prompt with placeholders for missing context.
        
        Args:
            template_data: Dictionary containing template information
            context: The context dictionary with values to fill in
            
        Returns:
            Dictionary with preview prompt and metadata
        """
        template_string = template_data.get('template', '')
        all_variables = self.extract_template_variables(template_string)
        
        # Create a complete context with placeholders for missing variables
        preview_context = {}
        for var in all_variables:
            if var in context and context[var] is not None and context[var] != '':
                preview_context[var] = str(context[var])
            else:
                preview_context[var] = f"[{var}]"
        
        # Sanitize the preview context
        sanitized_context = self.sanitize_context(preview_context)
        
        try:
            jinja_template = self.jinja_env.from_string(template_string)
            preview_prompt = jinja_template.render(**sanitized_context)
            
            return {
                'preview': preview_prompt.strip(),
                'variables_found': all_variables,
                'variables_provided': [var for var in all_variables if var in context and context[var]],
                'variables_missing': [var for var in all_variables if var not in context or not context[var]],
                'metadata': {
                    'template_id': template_data.get('id', 'unknown'),
                    'template_name': template_data.get('name', 'Unknown Template'),
                    'generated_at': datetime.utcnow().isoformat()
                }
            }
            
        except Exception as error:
            return {
                'preview': f"Error rendering template: {str(error)}",
                'variables_found': all_variables,
                'variables_provided': [],
                'variables_missing': all_variables,
                'metadata': {
                    'template_id': template_data.get('id', 'unknown'),
                    'template_name': template_data.get('name', 'Unknown Template'),
                    'generated_at': datetime.utcnow().isoformat(),
                    'error': str(error)                }
            }

    async def generate_and_run_prompt(self, template_data: Dict[str, Any], context: Dict[str, Any], model_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a prompt and run it through an AI model.
        
        Args:
            template_data: Dictionary containing template information
            context: The context dictionary with values to fill in
            model_config: Configuration for the AI model
            
        Returns:
            Dictionary with generated prompt, AI response, and metadata
        """
        start_time = datetime.utcnow()
        
        # Generate the prompt first
        prompt_output = self.generate_prompt(template_data, context)
        
        # If there are missing required fields, return early
        if prompt_output['missing_fields']:
            missing = ', '.join(prompt_output['missing_fields'])
            latency_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
            
            return {
                'prompt': prompt_output['prompt'],
                'result': f"Error: Missing required fields: {missing}",
                'sections': {},
                'tokens_used': 0,
                'latency_ms': latency_ms,
                'model_config': model_config,
                'timestamp': datetime.utcnow()
            }
        
        try:
            result = ''
            tokens_used = 0
            provider = model_config.get('provider', 'openai')
            
            if provider == 'openai':
                # Use OpenAI integration
                ai_result = await self._generate_openai_completion(
                    prompt_output['prompt'],
                    template_data,
                    model_config
                )
                result = ai_result['content']
                tokens_used = ai_result['tokens_used']
            else:
                # Fallback for other providers (mock implementation)
                model_name = model_config.get('model', 'unknown')
                result = f"[Generated with {provider}/{model_name}]\n\n{prompt_output['prompt']}"
                tokens_used = len(prompt_output['prompt']) // 4  # Rough estimate
            
            # Parse sections from the AI response
            sections = self._parse_response_sections(result)
            
            latency_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
            
            return {
                'prompt': prompt_output['prompt'],
                'result': result,
                'sections': sections,
                'tokens_used': tokens_used,
                'latency_ms': latency_ms,
                'model_config': model_config,
                'timestamp': datetime.utcnow()
            }
            
        except Exception as error:
            latency_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
            
            return {
                'prompt': prompt_output['prompt'],
                'result': f"Error: {str(error)}",
                'sections': {},
                'tokens_used': 0,
                'latency_ms': latency_ms,
                'model_config': model_config,
                'timestamp': datetime.utcnow()
            }
    
    async def _generate_openai_completion(self, prompt: str, template_data: Dict[str, Any], model_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate completion using OpenAI API.
        
        Args:
            prompt: The prompt to send to OpenAI
            template_data: Template metadata for system prompt
            model_config: OpenAI configuration
            
        Returns:
            Dictionary with content and tokens used
        """
        # Prepare messages
        messages = []
        
        # Create system prompt
        role = template_data.get('role', 'assistant')
        use_case = template_data.get('useCase', 'general task')
        system_prompt = (
            f"You are an expert {role} helping with {use_case}. "
            "Provide a comprehensive, well-structured response that directly addresses the user's request. "
            "Format your response clearly with appropriate headings and bullet points where helpful."
        )
        
        messages.append({
            "role": "system",
            "content": system_prompt
        })
        
        messages.append({
            "role": "user",
            "content": prompt
        })
        
        # Prepare request body
        request_body = {
            "model": model_config.get('model', 'gpt-3.5-turbo'),
            "messages": messages,
            "temperature": model_config.get('temperature', 0.7),
            "max_tokens": model_config.get('max_tokens', 2000),
            "stream": False
        }
        
        # Get API configuration
        api_host = model_config.get('custom_api_host', 'https://api.openai.com/v1')
        api_key = model_config.get('custom_api_key', settings.OPENAI_API_KEY)
        
        if not api_key or api_key.startswith('temp-'):
            raise AIClientError("OpenAI API key not configured")
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}' if not api_key.startswith('Bearer ') else api_key
        }
        
        # Make API request
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(
                    f"{api_host}/chat/completions",
                    headers=headers,
                    json=request_body
                )
                
                if not response.is_success:
                    error_text = response.text
                    raise AIClientError(f"OpenAI API error: {response.status_code} - {error_text}")
                
                data = response.json()
                
                if not data.get('choices') or len(data['choices']) == 0:
                    raise AIClientError("No response from OpenAI API")
                
                content = data['choices'][0]['message']['content']
                tokens_used = data.get('usage', {}).get('total_tokens', 0)
                
                return {
                    'content': content,
                    'tokens_used': tokens_used
                }
                
            except httpx.TimeoutException:
                raise AIClientError("OpenAI API request timed out")
            except httpx.RequestError as e:
                raise AIClientError(f"OpenAI API request failed: {str(e)}")
            except Exception as e:
                raise AIClientError(f"Failed to generate completion: {str(e)}")
    
    def _parse_response_sections(self, response: str) -> Dict[str, str]:
        """
        Parse AI response into sections based on common patterns.
        
        Args:
            response: The AI response text
            
        Returns:
            Dictionary with section names as keys and content as values
        """
        sections = {}
        
        # Split by common section patterns
        lines = response.split('\n')
        current_section = 'Main Content'
        current_content = []
        
        for line in lines:
            stripped_line = line.strip()
            
            # Check for section headers (markdown headers or bold text)
            header_match = re.match(r'^#+\s+(.+)$', stripped_line) or re.match(r'^\*\*([^*]+)\*\*:?\s*$', stripped_line)
            
            if header_match:
                # Save previous section
                if current_content:
                    sections[current_section] = '\n'.join(current_content).strip()
                
                # Start new section
                current_section = header_match.group(1).strip()
                current_content = []
            else:
                # Add to current section
                current_content.append(line)
        
        # Save final section
        if current_content:
            sections[current_section] = '\n'.join(current_content).strip()
        
        return sections


def create_template(config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Utility function to create a basic prompt template.
    
    Args:
        config: Template configuration dictionary
        
    Returns:
        Template dictionary
    """
    template_string = config.get('template', '')
    engine = PromptEngine()
    template_variables = engine.extract_template_variables(template_string)
    
    return {
        'id': config.get('id', ''),
        'name': config.get('name', ''),
        'description': config.get('description', ''),
        'template': template_string,
        'role': config.get('role', ''),
        'useCase': config.get('use_case', ''),
        'requiredFields': config.get('required_fields', template_variables),
        'optionalFields': config.get('optional_fields', []),
        'metadata': config.get('metadata', {}),
        'createdAt': datetime.utcnow(),
        'updatedAt': datetime.utcnow()
    }


# Global instance
prompt_engine = PromptEngine()
