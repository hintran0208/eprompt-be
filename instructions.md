# Instructions for Setting Up `eprompt-be` Backend API

This document provides instructions for creating the project structure for the `eprompt-be` FastAPI backend.

## 1. Project Initialization and Dependency Management

First, create a `requirements.txt` file with all the necessary dependencies for the project.

```bash
# requirements.txt

# Core Framework
fastapi
uvicorn[standard]

# Database
sqlalchemy
psycopg2-binary
alembic
pgvector

# Pydantic and Settings
pydantic
pydantic-settings

# Authentication
python-jose[cryptography]
passlib[bcrypt]

# Async HTTP client for testing and external APIs
httpx

# Background Tasks
celery
redis

# AI SDKs
openai
anthropic
google-generativeai
cohere

# Supabase
supabase

# Testing
pytest
pytest-cov
```

## 2. Create Project Directory Structure

Create the main application directory `app` and subdirectories for different modules.

```bash
mkdir -p app/api/v1 app/core app/db app/models app/schemas app/services app/utils app/tasks tests
```

This command creates the following structure:

```text
.
├── app/
│   ├── api/
│   │   └── v1/
│   ├── core/
│   ├── db/
│   ├── models/
│   ├── schemas/
│   ├── services/
│   ├── utils/
│   └── tasks/
├── tests/
└── requirements.txt
```

## 3. Create Core Application Files

### `app/__init__.py`

Create an empty `app/__init__.py` file to make `app` a Python package.

### `app/main.py`

Create the main FastAPI application entry point.

```python
# app/main.py
from fastapi import FastAPI
from app.api.v1 import api_router
from app.core.config import settings

app = FastAPI(title=settings.PROJECT_NAME)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"message": "Welcome to ePrompt Backend API"}
```

### `app/core/config.py`

Create a configuration file using Pydantic's `BaseSettings` to manage environment variables.

```python
# app/core/config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "ePrompt Backend API"
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # AI APIs
    OPENAI_API_KEY: str
    ANTHROPIC_API_KEY: str
    GEMINI_API_KEY: str
    COHERE_API_KEY: str

    # Supabase
    SUPABASE_URL: str
    SUPABASE_KEY: str

    class Config:
        env_file = ".env"

settings = Settings()
```

### `.env`

Create a `.env` file in the root directory to store sensitive information.

```env
# .env
DATABASE_URL="postgresql://user:password@host:port/dbname"
SECRET_KEY="your-super-secret-key"
OPENAI_API_KEY="your-openai-api-key"
ANTHROPIC_API_KEY="your-anthropic-api-key"
GEMINI_API_KEY="your-gemini-api-key"
COHERE_API_KEY="your-cohere-api-key"
SUPABASE_URL="your-supabase-url"
SUPABASE_KEY="your-supabase-key"
```

## 4. Set Up API Routers

### `app/api/v1/api.py`

Create a main router to include all other API routers.

```python
# app/api/v1/api.py
from fastapi import APIRouter

api_router = APIRouter()

# Include other routers here
# from .endpoints import prompts, users
# api_router.include_router(prompts.router, prefix="/prompts", tags=["prompts"])
# api_router.include_router(users.router, prefix="/users", tags=["users"])
```

## 5. Set Up Database Connection

### `app/db/session.py`

Create the database session management file.

```python
# app/db/session.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

### `app/db/base.py`

Create a base class for SQLAlchemy models.

```python
# app/db/base.py
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()
```

## 6. Create Placeholder Models and Schemas

### `app/models/prompt.py`

Create a sample SQLAlchemy model.

```python
# app/models/prompt.py
from sqlalchemy import Column, Integer, String, Text
from app.db.base import Base

class Prompt(Base):
    __tablename__ = "prompts"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text)
```

### `app/schemas/prompt.py`

Create a corresponding Pydantic schema.

```python
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
```

## 7. Testing Setup

### `tests/conftest.py`

Create a `conftest.py` for pytest fixtures.

```python
# tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c
```

### `tests/test_main.py`

Create a simple test for the root endpoint.

```python
# tests/test_main.py
from fastapi.testclient import TestClient

def test_read_root(client: TestClient):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to ePrompt Backend API"}
```

By following these instructions, you will have a solid foundation for the `eprompt-be` backend, based on FastAPI and the specified tech stack.
