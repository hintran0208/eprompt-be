# app/main.py
import sys
import os
from pathlib import Path

# Add the project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from fastapi import FastAPI
from app.api.v1 import api_router
from app.core.config import settings

app = FastAPI(title=settings.PROJECT_NAME)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"message": "Welcome to ePrompt Backend API"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "ePrompt Backend API"}

if __name__ == "__main__":
    import uvicorn
    # Change working directory to project root for proper module resolution
    os.chdir(project_root)
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
