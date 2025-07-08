# app/services/prompt_refiner.py
"""
Prompt refiner service for improving prompt quality using AI.
This service provides various refinement tools to enhance prompts.
"""

from typing import Dict, List, Optional, Any
from datetime import datetime
from app.services.prompt_engine import prompt_engine, PromptEngineError


class RefinerTool:
    """Represents a prompt refinement tool."""
    
    def __init__(self, id: str, name: str, icon: str, prompt: str, description: str, color: str):
        self.id = id
        self.name = name
        self.icon = icon
        self.prompt = prompt
        self.description = description
        self.color = color


class PromptRefiner:
    """Service for refining prompts using AI."""
    
    def __init__(self):
        # Define available refiner tools - matching frontend implementation
        self.refiner_tools = [
            RefinerTool(
                id='concise',
                name='Make Concise',
                icon='✂️',
                prompt='Optimize the following prompt to be more concise while preserving all key information and instructions:',
                description='Remove unnecessary words and make it shorter',
                color='blue'
            ),
            RefinerTool(
                id='specific',
                name='More Specific',
                icon='🎯',
                prompt='Enhance the following prompt with more specific instructions and clearer expectations:',
                description='Add clarity and specificity to reduce ambiguity',
                color='green'
            ),
            RefinerTool(
                id='friendly',
                name='Make Friendly',
                icon='😊',
                prompt='Rewrite the following prompt with a more friendly, conversational, and approachable tone:',
                description='Add warmth and conversational tone',
                color='green'
            ),
            RefinerTool(
                id='professional',
                name='Make Professional',
                icon='👔',
                prompt='Rewrite the following prompt with a more formal, professional, and business-appropriate tone:',
                description='Add formal language and professional structure',
                color='blue'
            ),
            RefinerTool(
                id='structured',
                name='Better Structure',
                icon='🏗️',
                prompt='Restructure the following prompt with better organization, clear sections, and logical flow:',
                description='Improve organization and readability',
                color='indigo'
            ),
            RefinerTool(
                id='context',
                name='Add Context',
                icon='📋',
                prompt='Enhance the following prompt by adding relevant context, background information, and examples:',
                description='Add more comprehensive context and examples',
                color='orange'
            ),
            RefinerTool(
                id='constraints',
                name='Add Constraints',
                icon='⚙️',
                prompt='Improve the following prompt by adding appropriate constraints, format requirements, and output specifications:',
                description='Add technical constraints and output format guidance',
                color='gray'
            ),
            RefinerTool(
                id='roleplay',
                name='Role-based',
                icon='🎭',
                prompt='Transform the following prompt to include role-playing instructions and persona-based guidance:',
                description='Add role-playing elements and persona guidance',
                color='purple'
            )
        ]
    
    def get_available_tools(self) -> List[Dict[str, Any]]:
        """Get list of available refiner tools."""
        return [
            {
                'id': tool.id,
                'name': tool.name,
                'icon': tool.icon,
                'description': tool.description,
                'color': tool.color
            }
            for tool in self.refiner_tools
        ]
    
    def get_tool_by_id(self, tool_id: str) -> Optional[RefinerTool]:
        """Get a refiner tool by its ID."""
        for tool in self.refiner_tools:
            if tool.id == tool_id:
                return tool
        return None
    
    async def refine_prompt(self, content: str, tool_id: str, model_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Refine a prompt using the specified tool.
        
        Args:
            content: The original content/prompt to refine
            tool_id: ID of the refiner tool to use
            model_config: Configuration for the AI model
            
        Returns:
            Dictionary with refined content and metadata
        """
        start_time = datetime.utcnow()
        
        # Get the refiner tool
        tool = self.get_tool_by_id(tool_id)
        if not tool:
            raise PromptEngineError(f"Refiner tool '{tool_id}' not found")
        
        if not content or not content.strip():
            raise PromptEngineError("No content provided to refine")
        
        try:
            # Create a template for the refinement process
            refine_template = {
                'id': f'refine-{tool.id}',
                'name': tool.name,
                'description': tool.description,
                'template': f"""{tool.prompt}

Original Prompt:
\"\"\"
{{{{content}}}}
\"\"\"

Please provide only the improved prompt as your response, without any explanations or additional text. Focus on making it a better prompt for AI systems while maintaining the original intent.""",
                'role': 'Expert Prompt Engineer',
                'useCase': 'Prompt Refinement',
                'requiredFields': ['content'],
                'optionalFields': [],
                'metadata': {}
            }
            
            # Use lower temperature for more consistent refinements
            refine_model_config = {**model_config, 'temperature': 0.3}
            
            # Generate and run the refinement
            result = await prompt_engine.generate_and_run_prompt(
                refine_template, 
                {'content': content}, 
                refine_model_config
            )
            
            # Extract only the refined content (remove any wrapper text)
            refined_content = self._extract_refined_content(result['result'])
            
            latency_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
            
            return {
                'refined_content': refined_content,
                'tool_used': tool.name,
                'tool_id': tool.id,
                'original_length': len(content),
                'refined_length': len(refined_content),
                'tokens_used': result.get('tokens_used', 0),
                'latency_ms': latency_ms,
                'timestamp': datetime.utcnow().isoformat()
            }
            
        except Exception as error:
            latency_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
            raise PromptEngineError(f"Failed to refine prompt with {tool.name}: {str(error)}")
    
    def _extract_refined_content(self, ai_response: str) -> str:
        """
        Extract only the refined content from AI response, removing explanations.
        
        Args:
            ai_response: The full AI response
            
        Returns:
            Clean refined content
        """
        content = ai_response.strip()
        
        # Remove common AI response prefixes/suffixes
        prefixes_to_remove = [
            "Here's the improved prompt:",
            "Here is the improved prompt:",
            "The refined prompt is:",
            "Refined prompt:",
            "Improved prompt:",
            "Here's the optimized version:",
            "Here is the optimized version:",
            "The optimized prompt:"
        ]
        
        suffixes_to_remove = [
            "This version is more concise while maintaining clarity.",
            "This refined version provides better clarity.",
            "This improvement adds more specificity.",
            "This version is more professional.",
            "This structure is more organized."
        ]
        
        # Remove prefixes
        for prefix in prefixes_to_remove:
            if content.lower().startswith(prefix.lower()):
                content = content[len(prefix):].strip()
                break
        
        # Remove suffixes
        for suffix in suffixes_to_remove:
            if content.lower().endswith(suffix.lower()):
                content = content[:-len(suffix)].strip()
                break
        
        # Remove quote marks if the entire content is quoted
        if ((content.startswith('"') and content.endswith('"')) or
            (content.startswith("'") and content.endswith("'")) or
            (content.startswith('"""') and content.endswith('"""'))):
            content = content[3:-3] if content.startswith('"""') else content[1:-1]
            content = content.strip()
        
        return content


# Create a singleton instance
prompt_refiner = PromptRefiner()
