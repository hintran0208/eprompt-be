# ePrompt Backend API

A FastAPI-based backend service for AI prompt management.

## Quick Start

### Prerequisites

- Python 3.10+
- Virtual environment (`.venv` directory should exist)

### Running the Application

#### Option 1: Direct Python execution (Recommended)

```bash
python app/main.py
```

#### Option 2: Using the run script

```bash
python run.py
```

#### Option 3: Using the startup script

```bash
./start.sh
```

#### Option 4: Using uvicorn directly

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

### Access the API

Once running, you can access:

- **API Root**: http://127.0.0.1:8001/
- **Interactive Docs (Swagger)**: http://127.0.0.1:8001/docs
- **Alternative Docs (ReDoc)**: http://127.0.0.1:8001/redoc
- **API v1 Endpoints**: http://127.0.0.1:8001/api/v1/

## Development

### Installing Dependencies

```bash
pip install -r requirements.txt
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your configuration:

```bash
cp .env.example .env
```

Required environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT secret key
- `OPENAI_API_KEY`: OpenAI API key
- `ANTHROPIC_API_KEY`: Anthropic API key
- `GEMINI_API_KEY`: Google Gemini API key
- `COHERE_API_KEY`: Cohere API key
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_KEY`: Supabase API key

### Project Structure

```
app/
├── main.py              # FastAPI application entry point
├── api/v1/             # API version 1 routes
├── core/               # Core functionality (config, etc.)
├── db/                 # Database configuration
├── models/             # SQLAlchemy models
├── schemas/            # Pydantic schemas
├── services/           # Business logic
└── utils/              # Utility functions
```

## Testing

```bash
pytest
```

## License

[Your License Here]
