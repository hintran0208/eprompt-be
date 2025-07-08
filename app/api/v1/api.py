# app/api/v1/api.py
from fastapi import APIRouter

api_router = APIRouter()

# Include other routers here
# from .endpoints import prompts, users
# api_router.include_router(prompts.router, prefix="/prompts", tags=["prompts"])
# api_router.include_router(users.router, prefix="/users", tags=["users"])
