# app/api/v1/api.py
from fastapi import APIRouter
from .endpoints import prompts

api_router = APIRouter()

# Include prompt-related routes
api_router.include_router(prompts.router, prefix="/prompts", tags=["prompts"])

# Include other routers here as they are created
# from .endpoints import users
# api_router.include_router(users.router, prefix="/users", tags=["users"])
