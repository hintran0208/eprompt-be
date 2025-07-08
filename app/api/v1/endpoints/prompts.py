# app/api/v1/endpoints/prompts.py
"""
API endpoints for prompt generation and management.
"""

from datetime import datetime
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.prompt import (
    GeneratePromptRequest,
    PreviewPromptRequest,
    PromptOutput,
    PreviewOutput,
    GenerateAndRunRequest,
    PromptResult
)
from app.services.prompt_engine import prompt_engine


router = APIRouter()


@router.post("/generate-prompt", response_model=PromptOutput)
async def generate_prompt(request: GeneratePromptRequest) -> PromptOutput:
    """
    Generate a final prompt by merging template with context.
    
    This endpoint takes a template and context, validates required fields,
    sanitizes input, and returns the rendered prompt with metadata.
    """
    try:
        # Convert Pydantic model to dict for the prompt engine
        template_data = {
            'id': request.template.id,
            'name': request.template.name,
            'description': request.template.description,
            'template': request.template.template,
            'role': request.template.role,
            'useCase': request.template.use_case,
            'requiredFields': request.template.required_fields,
            'optionalFields': request.template.optional_fields or [],
            'metadata': request.template.metadata or {}
        }
        
        result = prompt_engine.generate_prompt(template_data, request.context)
        
        return PromptOutput(
            prompt=result['prompt'],
            missing_fields=result['missing_fields'],
            context_used=result['context_used'],
            metadata=result['metadata']
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate prompt: {str(e)}"
        )


@router.post("/preview-prompt", response_model=PreviewOutput)
async def preview_prompt(request: PreviewPromptRequest) -> PreviewOutput:
    """
    Preview a prompt with placeholders for missing context variables.
    
    This endpoint shows how the template will look with current context,
    using placeholders like [variable_name] for missing variables.
    """
    try:
        # Convert Pydantic model to dict for the prompt engine
        template_data = {
            'id': request.template.id,
            'name': request.template.name,
            'description': request.template.description,
            'template': request.template.template,
            'role': request.template.role,
            'useCase': request.template.use_case,
            'requiredFields': request.template.required_fields,
            'optionalFields': request.template.optional_fields or [],
            'metadata': request.template.metadata or {}
        }
        
        result = prompt_engine.preview_prompt(template_data, request.context)
        
        return PreviewOutput(
            preview=result['preview'],
            variables_found=result['variables_found'],
            variables_provided=result['variables_provided'],
            variables_missing=result['variables_missing'],
            metadata=result['metadata']
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to preview prompt: {str(e)}"
        )


@router.post("/extract-variables")
async def extract_template_variables(template: Dict[str, str]) -> Dict[str, Any]:
    """
    Extract variables from a template string.
    
    Args:
        template: Dictionary with 'template' key containing the template string
        
    Returns:
        Dictionary with extracted variables and metadata
    """
    try:
        template_string = template.get('template', '')
        if not template_string:
            raise HTTPException(
                status_code=400,
                detail="Template string is required"
            )
        
        variables = prompt_engine.extract_template_variables(template_string)
        
        return {
            'variables': variables,
            'count': len(variables),
            'template': template_string,
            'extracted_at': datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to extract variables: {str(e)}"
        )


@router.post("/validate-context")
async def validate_context(request: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate that context contains all required fields.
    
    Args:
        request: Dictionary with 'required_fields' and 'context' keys
        
    Returns:
        Dictionary with validation results
    """
    try:
        required_fields = request.get('required_fields', [])
        context = request.get('context', {})
        
        if not isinstance(required_fields, list):
            raise HTTPException(
                status_code=400,
                detail="required_fields must be a list"
            )
        
        if not isinstance(context, dict):
            raise HTTPException(
                status_code=400,
                detail="context must be a dictionary"
            )
        
        missing_fields = prompt_engine.validate_required_fields(required_fields, context)
        
        return {
            'is_valid': len(missing_fields) == 0,
            'missing_fields': missing_fields,
            'provided_fields': list(context.keys()),
            'required_fields': required_fields,
            'validated_at': datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to validate context: {str(e)}"
        )


# Future endpoint for AI integration
@router.post("/generate-and-run", response_model=PromptResult)
async def generate_and_run_prompt(request: GenerateAndRunRequest) -> PromptResult:
    """
    Generate a prompt and run it through an AI model.
    
    This endpoint generates a prompt from template and context,
    then sends it to the specified AI provider for completion.
    """
    try:
        # Convert Pydantic model to dict for the prompt engine
        template_data = {
            'id': request.template.id,
            'name': request.template.name,
            'description': request.template.description,
            'template': request.template.template,
            'role': request.template.role,
            'useCase': request.template.use_case,
            'requiredFields': request.template.required_fields,
            'optionalFields': request.template.optional_fields or [],
            'metadata': request.template.metadata or {}
        }
          # Convert model config to dict
        model_config_dict = {
            'provider': request.ai_model_config.provider,
            'model': request.ai_model_config.model,
            'temperature': request.ai_model_config.temperature,
            'max_tokens': request.ai_model_config.max_tokens,
            'top_p': request.ai_model_config.top_p,
            'frequency_penalty': request.ai_model_config.frequency_penalty,
            'presence_penalty': request.ai_model_config.presence_penalty,
            'custom_api_host': request.ai_model_config.custom_api_host,
            'custom_api_key': request.ai_model_config.custom_api_key
        }
        
        result = await prompt_engine.generate_and_run_prompt(
            template_data, 
            request.context, 
            model_config_dict        )
        
        return PromptResult(
            prompt=result['prompt'],
            result=result['result'],
            sections=result.get('sections', {}),
            tokens_used=result.get('tokens_used', 0),
            latency_ms=result.get('latency_ms', 0),
            ai_model_config=request.ai_model_config,
            timestamp=result['timestamp']
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate and run prompt: {str(e)}"
        )
