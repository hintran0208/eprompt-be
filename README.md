# ePrompt Backend API

A powerful FastAPI-based backend service for AI prompt template management and generation. This service provides a comprehensive prompt engine that can process templates, validate context, sanitize inputs, and generate AI-powered responses.

## 🚀 Features

- **Template Processing**: Extract variables from `{{variable}}` syntax templates
- **Context Validation**: Ensure required fields are provided before generation
- **Input Sanitization**: Prevent template injection attacks
- **AI Integration**: Generate prompts and run them through OpenAI models
- **Preview Mode**: Show templates with placeholders for missing variables
- **Comprehensive Testing**: Full unit and integration test coverage
- **Type Safety**: Pydantic models for request/response validation

## 📋 API Endpoints

### Core Prompt Operations

- `POST /api/v1/prompts/generate-prompt` - Generate final prompts from templates
- `POST /api/v1/prompts/preview-prompt` - Preview templates with placeholders
- `POST /api/v1/prompts/extract-variables` - Extract template variables
- `POST /api/v1/prompts/validate-context` - Validate required fields
- `POST /api/v1/prompts/generate-and-run` - Generate and run through AI models

### Health Check

- `GET /health` - Service health status

## 🛠️ Installation

### Prerequisites

- Python 3.8+
- pip for package management

### Setup (Recommended)

It's recommended to use a virtual environment to isolate dependencies:

```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**Note**: You can run the project without a virtual environment, but it's recommended to avoid dependency conflicts.

### Environment Variables

The project uses `pydantic-settings` to automatically load environment variables from a `.env` file. Copy `.env.example` to `.env` and fill in your configuration:

```powershell
# Copy the example file
copy .env.example .env
```

**Required environment variables:**

- `OPENAI_API_KEY`: OpenAI API key for AI services (currently the only supported provider)
- `SECRET_KEY`: JWT secret key (auto-generated if not provided)

**Optional environment variables:**

- `PROJECT_NAME`: API project name (default: "ePrompt Backend API")
- `API_V1_STR`: API version prefix (default: "/api/v1")
- `HOST`: Server host (default: "0.0.0.0")
- `PORT`: Server port (default: 8001)
- `DATABASE_URL`: Database connection string (default: SQLite)
- `ANTHROPIC_API_KEY`: Anthropic API key
- `GEMINI_API_KEY`: Google Gemini API key
- `COHERE_API_KEY`: Cohere API key
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_KEY`: Supabase API key

## 🚀 Running the Application

### Option 1: Direct Python execution (Recommended)

```bash
python app/main.py
```

### Option 2: Using the run script

```bash
python run.py
```

### Option 3: Using the startup script (Unix/Linux)

```bash
./start.sh
```

### Option 4: Using uvicorn directly

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload
```

### Access the API

Once running, you can access:

- **API Root**: http://127.0.0.1:8001/
- **Interactive Docs (Swagger)**: http://127.0.0.1:8001/docs
- **Alternative Docs (ReDoc)**: http://127.0.0.1:8001/redoc
- **API v1 Endpoints**: http://127.0.0.1:8001/api/v1/

## 📖 Usage Examples

### Generate a Prompt

```python
import httpx

# Template with variables
template_data = {
    "id": "user-story",
    "name": "User Story Template",
    "description": "Template for creating user stories",
    "template": "As a {{role}}, I want to {{goal}} so that {{benefit}}",
    "role": "Product Manager",
    "useCase": "Requirements gathering",
    "requiredFields": ["role", "goal", "benefit"],
    "optionalFields": [],
    "metadata": {}
}

# Context with values
context = {
    "role": "developer",
    "goal": "implement authentication",
    "benefit": "users can log in securely"
}

# Generate prompt
async with httpx.AsyncClient() as client:
    response = await client.post(
        "http://localhost:8001/api/v1/prompts/generate-prompt",
        json={"template": template_data, "context": context}
    )
    result = response.json()
    print(result["prompt"])
    # Output: "As a developer, I want to implement authentication so that users can log in securely"
```

### Preview a Template

```python
# Preview with partial context
context = {"role": "developer"}  # Missing 'goal' and 'benefit'

async with httpx.AsyncClient() as client:
    response = await client.post(
        "http://localhost:8001/api/v1/prompts/preview-prompt",
        json={"template": template_data, "context": context}
    )
    result = response.json()
    print(result["preview"])
    # Output: "As a developer, I want to [goal] so that [benefit]"
```

## 🧪 Testing

### Run All Tests

```bash
pytest tests/ -v
```

### Run Specific Test Files

```bash
# Unit tests for prompt engine
pytest tests/test_prompt_engine.py -v

# Integration tests for API endpoints
pytest tests/test_prompt_api.py -v
```

### Test Coverage

```bash
pytest tests/ --cov=app --cov-report=html
```

### Manual API Testing

Use the provided test script:

```bash
python test_api.py
```

## 🏗️ Project Structure

```
eprompt-be/
├── app/
│   ├── main.py                     # FastAPI application entry point
│   ├── api/v1/                     # API version 1 routes
│   │   ├── api.py                  # Router configuration
│   │   └── endpoints/
│   │       └── prompts.py          # Prompt API endpoints
│   ├── core/
│   │   └── config.py               # Application configuration
│   ├── db/                         # Database configuration
│   │   ├── base.py
│   │   └── session.py
│   ├── models/                     # SQLAlchemy models
│   │   └── prompt.py
│   ├── schemas/                    # Pydantic schemas
│   │   └── prompt.py               # Request/response models
│   ├── services/                   # Business logic
│   │   └── prompt_engine.py        # Core prompt engine
│   ├── tasks/                      # Background tasks
│   └── utils/                      # Utility functions
├── tests/                          # Test suite
│   ├── test_prompt_engine.py       # Unit tests
│   ├── test_prompt_api.py          # Integration tests
│   └── test_main.py                # Basic API tests
├── test_api.py                     # Manual testing script
├── deploy.sh                       # Heroku deployment script
├── requirements.txt                # Python dependencies
├── runtime.txt                     # Python version for Heroku
├── Procfile                       # Heroku process file
└── README.md                      # This file
```

## 🔒 Security Features

- **Input Sanitization**: Prevents template injection attacks by escaping `{{` and `}}` characters
- **Field Validation**: Ensures required fields are provided before processing
- **Type Safety**: Pydantic models validate all inputs and outputs
- **Error Handling**: Comprehensive error handling with meaningful messages

## 🎯 Core Components

### PromptEngine Class

The heart of the system located in `app/services/prompt_engine.py` with these key methods:

- `extract_template_variables()` - Find all `{{variable}}` placeholders
- `validate_required_fields()` - Check for missing required fields
- `sanitize_context()` - Prevent injection attacks
- `generate_prompt()` - Create final prompts
- `preview_prompt()` - Show templates with placeholders
- `generate_and_run_prompt()` - Generate and run through AI models

### Template Format

Templates use Handlebars/Jinja2 syntax:

```python
template = "Hello {{name}}, welcome to {{project}}!"
variables = ["name", "project"]
```

### Context Validation

```python
required_fields = ["name", "email"]
context = {"name": "John"}
missing = ["email"]  # Validation result
```

## 🚀 Deployment

### Heroku Deployment

Use the provided deployment script:

```bash
./deploy.sh your-app-name
```

Or deploy manually:

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set OPENAI_API_KEY=your_key --app your-app-name

# Deploy
git push heroku main
```

### GitHub Actions

The project includes GitHub Actions for automated deployment. See `.github/workflows/deploy.yml` and `DEPLOYMENT.md` for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ using FastAPI and Python
