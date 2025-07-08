# app/api/v1/endpoints/refiner.py
"""
API endpoints for prompt refinement using AI-powered tools.
"""

from typing import List
from fastapi import APIRouter, HTTPException
from app.schemas.prompt import (
    RefinePromptRequest,
    RefinePromptResponse,
    RefinerTool,
    RefinerToolsResponse
)
from app.services.prompt_refiner import prompt_refiner


router = APIRouter()


@router.get("/tools", response_model=RefinerToolsResponse)
async def get_refiner_tools() -> RefinerToolsResponse:
    """
    Get list of available prompt refiner tools.
    
    Returns a list of all available refiner tools with their metadata.
    Each tool can be used to improve prompts in different ways.
    """
    try:
        tools_data = prompt_refiner.get_available_tools()
        tools = [RefinerTool(**tool) for tool in tools_data]
        
        return RefinerToolsResponse(
            tools=tools,
            count=len(tools)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get refiner tools: {str(e)}"
        )


@router.post("/refine", response_model=RefinePromptResponse)
async def refine_prompt(request: RefinePromptRequest) -> RefinePromptResponse:
    """
    Refine a prompt using AI-powered refinement tools.
    
    This endpoint takes content and a tool ID, then uses AI to improve
    the prompt according to the selected refinement strategy. The response
    contains only the refined content without explanations.
    
    Available tools:
    - concise: Make the prompt more concise
    - specific: Add more specific instructions
    - friendly: Make the tone more conversational
    - professional: Make the tone more formal
    - structured: Improve organization and structure
    - context: Add more context and examples
    - constraints: Add technical constraints
    - roleplay: Add role-playing elements
    """
    try:
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
        
        # Refine the prompt
        result = await prompt_refiner.refine_prompt(
            request.content,
            request.tool_id,
            model_config_dict
        )
        
        return RefinePromptResponse(**result)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to refine prompt: {str(e)}"
        )


@router.post("/batch-refine")
async def batch_refine_prompt(
    content: str,
    tool_ids: List[str],
    ai_model_config: dict
) -> dict:
    """
    Refine a prompt using multiple tools sequentially.
    
    This endpoint applies multiple refinement tools to the same content
    and returns all results for comparison.
    """
    try:
        results = []
        
        for tool_id in tool_ids:
            try:
                result = await prompt_refiner.refine_prompt(
                    content,
                    tool_id,
                    ai_model_config
                )
                results.append(result)
            except Exception as tool_error:
                results.append({
                    'tool_id': tool_id,
                    'error': str(tool_error),
                    'refined_content': None
                })
        
        return {
            'original_content': content,
            'refinements': results,
            'total_tools_used': len(tool_ids),
            'successful_refinements': len([r for r in results if 'error' not in r])
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to batch refine prompt: {str(e)}"
        )
