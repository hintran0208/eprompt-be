# tests/test_prompt_api.py
"""
Integration tests for prompt API endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


@pytest.fixture
def sample_template():
    """Sample template data for testing."""
    return {
        "id": "test-template",
        "name": "Test Template",
        "description": "A test template",
        "template": "As a {{role}}, I need to {{task}}. Context: {{project_context}}",
        "role": "Developer",
        "useCase": "Testing",
        "requiredFields": ["role", "task", "project_context"],
        "optionalFields": [],
        "metadata": {}
    }


@pytest.fixture
def complete_context():
    """Complete context data for testing."""
    return {
        "role": "Developer",
        "task": "write tests",
        "project_context": "Testing framework"
    }


@pytest.fixture
def partial_context():
    """Partial context data for testing."""
    return {
        "role": "Developer"
    }


class TestPromptAPI:
    """Test cases for prompt API endpoints."""
    
    def test_generate_prompt_success(self, sample_template, complete_context):
        """Test successful prompt generation."""
        response = client.post(
            "/api/v1/prompts/generate-prompt",
            json={
                "template": sample_template,
                "context": complete_context
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["prompt"] == "As a Developer, I need to write tests. Context: Testing framework"
        assert data["missing_fields"] == []
        assert set(data["context_used"]) == {"role", "task", "project_context"}
        assert data["metadata"]["has_required_fields"] is True
        assert data["metadata"]["template_id"] == "test-template"
    
    def test_generate_prompt_missing_fields(self, sample_template, partial_context):
        """Test prompt generation with missing required fields."""
        response = client.post(
            "/api/v1/prompts/generate-prompt",
            json={
                "template": sample_template,
                "context": partial_context
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert set(data["missing_fields"]) == {"task", "project_context"}
        assert data["metadata"]["has_required_fields"] is False
        assert "Developer" in data["prompt"]
    
    def test_preview_prompt_success(self, sample_template, partial_context):
        """Test prompt preview functionality."""
        response = client.post(
            "/api/v1/prompts/preview-prompt",
            json={
                "template": sample_template,
                "context": partial_context
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "Developer" in data["preview"]
        assert "[task]" in data["preview"]
        assert "[project_context]" in data["preview"]
        assert data["variables_provided"] == ["role"]
        assert set(data["variables_missing"]) == {"task", "project_context"}
    
    def test_preview_prompt_empty_context(self, sample_template):
        """Test prompt preview with empty context."""
        response = client.post(
            "/api/v1/prompts/preview-prompt",
            json={
                "template": sample_template,
                "context": {}
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "[role]" in data["preview"]
        assert "[task]" in data["preview"]
        assert "[project_context]" in data["preview"]
        assert data["variables_provided"] == []
        assert set(data["variables_missing"]) == {"role", "task", "project_context"}
    
    def test_extract_variables(self):
        """Test template variable extraction endpoint."""
        response = client.post(
            "/api/v1/prompts/extract-variables",
            json={
                "template": "Hello {{name}}, welcome to {{project}}!"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert set(data["variables"]) == {"name", "project"}
        assert data["count"] == 2
        assert "extracted_at" in data
    
    def test_extract_variables_missing_template(self):
        """Test variable extraction with missing template."""
        response = client.post(
            "/api/v1/prompts/extract-variables",
            json={}
        )
        
        assert response.status_code == 400
        assert "Template string is required" in response.json()["detail"]
    
    def test_validate_context_success(self):
        """Test context validation with valid context."""
        response = client.post(
            "/api/v1/prompts/validate-context",
            json={
                "required_fields": ["name", "role"],
                "context": {"name": "John", "role": "Developer"}
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["is_valid"] is True
        assert data["missing_fields"] == []
        assert set(data["provided_fields"]) == {"name", "role"}
    
    def test_validate_context_missing_fields(self):
        """Test context validation with missing fields."""
        response = client.post(
            "/api/v1/prompts/validate-context",
            json={
                "required_fields": ["name", "role", "task"],
                "context": {"name": "John"}
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["is_valid"] is False
        assert set(data["missing_fields"]) == {"role", "task"}
        assert data["provided_fields"] == ["name"]
    
    def test_generate_and_run_mock(self, sample_template, complete_context):
        """Test the generate-and-run endpoint (mock implementation)."""
        model_config = {
            "provider": "openai",
            "model": "gpt-4",
            "temperature": 0.7,
            "max_tokens": 2000
        }
        
        response = client.post(
            "/api/v1/prompts/generate-and-run",
            json={
                "template": sample_template,
                "context": complete_context,
                "model_config": model_config
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["prompt"] == "As a Developer, I need to write tests. Context: Testing framework"
        assert "[Mock AI Response" in data["result"]
        assert data["model_config"]["provider"] == "openai"
        assert "timestamp" in data
    
    def test_generate_and_run_missing_fields(self, sample_template, partial_context):
        """Test generate-and-run with missing required fields."""
        model_config = {
            "provider": "openai",
            "model": "gpt-4"
        }
        
        response = client.post(
            "/api/v1/prompts/generate-and-run",
            json={
                "template": sample_template,
                "context": partial_context,
                "model_config": model_config
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "Error: Missing required fields:" in data["result"]
        assert data["tokens_used"] == 0
    
    def test_invalid_template_format(self):
        """Test with invalid template format."""
        invalid_template = {
            "id": "test",
            "name": "Test",
            # Missing required fields
        }
        
        response = client.post(
            "/api/v1/prompts/generate-prompt",
            json={
                "template": invalid_template,
                "context": {}
            }
        )
        
        assert response.status_code == 422  # Validation error
    
    def test_malicious_input_sanitization(self, complete_context):
        """Test that malicious input is sanitized."""
        malicious_template = {
            "id": "malicious",
            "name": "Malicious Template",
            "description": "Test template",
            "template": "Execute: {{command}}",
            "role": "Hacker",
            "useCase": "Testing",
            "requiredFields": ["command"],
            "optionalFields": [],
            "metadata": {}
        }
        
        malicious_context = {
            "command": "{{system_call}} rm -rf /"
        }
        
        response = client.post(
            "/api/v1/prompts/generate-prompt",
            json={
                "template": malicious_template,
                "context": malicious_context
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Template syntax should be escaped
        assert "\\{\\{system_call\\}\\}" in data["prompt"]
