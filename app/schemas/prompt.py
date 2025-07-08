# app/schemas/prompt.py
from datetime import datetime
from typing import Dict, List, Optional, Any, Union
from pydantic import BaseModel, Field


class PromptTemplateBase(BaseModel):
    """Base schema for prompt templates."""
    id: str
    name: str
    description: str
    template: str
    role: str
    use_case: str = Field(alias="useCase")
    required_fields: List[str] = Field(alias="requiredFields")
    optional_fields: Optional[List[str]] = Field(default=[], alias="optionalFields")
    metadata: Optional[Dict[str, Any]] = Field(default={})


class PromptTemplateCreate(PromptTemplateBase):
    """Schema for creating a new prompt template."""
    pass


class PromptTemplate(PromptTemplateBase):
    """Schema for prompt template with timestamps."""
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")

    class Config:
        allow_population_by_field_name = True
        orm_mode = True


class PromptContext(BaseModel):
    """Schema for prompt context data."""
    context: Dict[str, Union[str, int, float, bool, None]] = Field(
        description="Key-value pairs for template variables"
    )


class GeneratePromptRequest(BaseModel):
    """Request schema for generating a prompt."""
    template: PromptTemplateBase
    context: Dict[str, Union[str, int, float, bool, None]]


class PreviewPromptRequest(BaseModel):
    """Request schema for previewing a prompt."""
    template: PromptTemplateBase
    context: Dict[str, Union[str, int, float, bool, None]] = Field(default={})


class PromptMetadata(BaseModel):
    """Schema for prompt generation metadata."""
    template_id: str
    template_name: str
    generated_at: str
    has_required_fields: bool
    error: Optional[str] = None


class PromptOutput(BaseModel):
    """Schema for prompt generation output."""
    prompt: str
    missing_fields: List[str]
    context_used: List[str]
    metadata: PromptMetadata


class PreviewOutput(BaseModel):
    """Schema for prompt preview output."""
    preview: str
    variables_found: List[str]
    variables_provided: List[str]
    variables_missing: List[str]
    metadata: Dict[str, Any]


class ModelConfig(BaseModel):
    """Schema for AI model configuration."""
    provider: str = Field(pattern="^(openai|anthropic|google|local)$")
    model: str
    temperature: Optional[float] = Field(default=0.7, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(default=2000, gt=0)
    top_p: Optional[float] = Field(default=1.0, ge=0.0, le=1.0)
    frequency_penalty: Optional[float] = Field(default=0.0, ge=-2.0, le=2.0)
    presence_penalty: Optional[float] = Field(default=0.0, ge=-2.0, le=2.0)
    custom_api_host: Optional[str] = None
    custom_api_key: Optional[str] = None


class GenerateAndRunRequest(BaseModel):
    """Request schema for generating and running a prompt through AI."""
    template: PromptTemplateBase
    context: Dict[str, Union[str, int, float, bool, None]]
    ai_model_config: ModelConfig


class PromptResult(BaseModel):
    """Schema for AI-generated prompt result."""
    prompt: str
    result: str
    sections: Optional[Dict[str, str]] = None
    tokens_used: Optional[int] = None
    latency_ms: Optional[int] = None
    ai_model_config: ModelConfig
    timestamp: datetime


# Legacy schemas for backward compatibility
class PromptBase(BaseModel):
    title: str
    content: str


class PromptCreate(PromptBase):
    pass


class Prompt(PromptBase):
    id: int

    class Config:
        orm_mode = True
