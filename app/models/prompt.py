# app/models/prompt.py
from sqlalchemy import Column, Integer, String, Text
from app.db.base import Base

class Prompt(Base):
    __tablename__ = "prompts"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text)
