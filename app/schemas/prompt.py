# app/schemas/prompt.py
from pydantic import BaseModel

class PromptBase(BaseModel):
    title: str
    content: str

class PromptCreate(PromptBase):
    pass

class Prompt(PromptBase):
    id: int

    class Config:
        orm_mode = True
