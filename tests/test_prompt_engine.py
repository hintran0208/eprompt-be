# tests/test_prompt_engine.py
"""
Unit tests for the prompt engine service.
"""

import pytest
from datetime import datetime
from app.services.prompt_engine import PromptEngine


@pytest.fixture
def prompt_engine():
    """Create a prompt engine instance for testing."""
    return PromptEngine()


@pytest.fixture
def sample_template():
    """Sample template data for testing."""
    return {
        'id': 'test-template',
        'name': 'Test Template',
        'description': 'A test template',
        'template': 'As a {{role}}, I need to {{task}}. Context: {{project_context}}',
        'role': 'Developer',
        'useCase': 'Testing',
        'requiredFields': ['role', 'task', 'project_context'],
        'optionalFields': [],
        'metadata': {}
    }


class TestPromptEngine:
    """Test cases for the PromptEngine class."""
    
    def test_extract_template_variables(self, prompt_engine):
        """Test extraction of template variables."""
        template = 'Hello {{name}}, welcome to {{project}}!'
        variables = prompt_engine.extract_template_variables(template)
        assert variables == ['name', 'project']
    
    def test_extract_template_variables_with_spaces(self, prompt_engine):
        """Test that variables with spaces are ignored."""
        template = 'As a {{role}}, I need to {{task description}}'
        variables = prompt_engine.extract_template_variables(template)
        assert 'role' in variables
        assert 'task description' not in variables  # Should be ignored due to space
    
    def test_extract_template_variables_ignore_helpers(self, prompt_engine):
        """Test that Jinja2 helpers and conditionals are ignored."""
        template = 'Hello {{name}} {% if condition %}test{% endif %}'
        variables = prompt_engine.extract_template_variables(template)
        assert variables == ['name']
    
    def test_validate_required_fields_all_present(self, prompt_engine):
        """Test validation when all required fields are present."""
        required_fields = ['name', 'role']
        context = {'name': 'John', 'role': 'Developer'}
        missing = prompt_engine.validate_required_fields(required_fields, context)
        assert missing == []
    
    def test_validate_required_fields_missing(self, prompt_engine):
        """Test validation when some fields are missing."""
        required_fields = ['name', 'role', 'task']
        context = {'name': 'John'}
        missing = prompt_engine.validate_required_fields(required_fields, context)
        assert set(missing) == {'role', 'task'}
    
    def test_validate_required_fields_empty_strings(self, prompt_engine):
        """Test that empty strings are treated as missing."""
        required_fields = ['name', 'role']
        context = {'name': '', 'role': 'Developer'}
        missing = prompt_engine.validate_required_fields(required_fields, context)
        assert missing == ['name']
    
    def test_sanitize_context(self, prompt_engine):
        """Test context sanitization."""
        context = {'name': 'John {{evil}}', 'role': 'Dev', 'count': 42, 'active': True}
        sanitized = prompt_engine.sanitize_context(context)
        
        assert sanitized['name'] == 'John \\{\\{evil\\}\\}'
        assert sanitized['role'] == 'Dev'
        assert sanitized['count'] == '42'
        assert sanitized['active'] == 'True'
    
    def test_generate_prompt_success(self, prompt_engine, sample_template):
        """Test successful prompt generation."""
        context = {
            'role': 'Developer',
            'task': 'write tests',
            'project_context': 'Testing framework'
        }
        
        result = prompt_engine.generate_prompt(sample_template, context)
        
        assert result['prompt'] == 'As a Developer, I need to write tests. Context: Testing framework'
        assert result['missing_fields'] == []
        assert set(result['context_used']) == {'role', 'task', 'project_context'}
        assert result['metadata']['has_required_fields'] is True
        assert result['metadata']['template_id'] == 'test-template'
    
    def test_generate_prompt_missing_fields(self, prompt_engine, sample_template):
        """Test prompt generation with missing required fields."""
        context = {'role': 'Developer'}
        
        result = prompt_engine.generate_prompt(sample_template, context)
        
        assert set(result['missing_fields']) == {'task', 'project_context'}
        assert result['metadata']['has_required_fields'] is False
        # Should still generate a prompt with placeholders
        assert 'Developer' in result['prompt']
        assert '[task]' in result['prompt']
        assert '[project_context]' in result['prompt']
    
    def test_generate_prompt_sanitizes_input(self, prompt_engine, sample_template):
        """Test that prompt generation sanitizes malicious input."""
        context = {
            'role': 'Developer',
            'task': 'write {{malicious}} code',
            'project_context': 'Safe project'
        }
        
        result = prompt_engine.generate_prompt(sample_template, context)
        
        assert 'write \\{\\{malicious\\}\\} code' in result['prompt']
    
    def test_preview_prompt(self, prompt_engine, sample_template):
        """Test prompt preview functionality."""
        context = {'role': 'Developer'}  # Partial context
        
        result = prompt_engine.preview_prompt(sample_template, context)
        
        assert 'Developer' in result['preview']
        assert '[task]' in result['preview']
        assert '[project_context]' in result['preview']
        assert result['variables_provided'] == ['role']
        assert set(result['variables_missing']) == {'task', 'project_context'}
        assert set(result['variables_found']) == {'role', 'task', 'project_context'}
    
    def test_get_used_context_fields(self, prompt_engine):
        """Test identification of used context fields."""
        template = 'Hello {{name}} from {{company}}'
        context = {'name': 'John', 'company': 'TechCorp', 'unused': 'value'}
        
        used_fields = prompt_engine.get_used_context_fields(template, context)
        
        assert set(used_fields) == {'name', 'company'}
        assert 'unused' not in used_fields
    
    def test_get_used_context_fields_empty_values(self, prompt_engine):
        """Test that empty values are not considered used."""
        template = 'Hello {{name}} from {{company}}'
        context = {'name': 'John', 'company': '', 'role': None}
        
        used_fields = prompt_engine.get_used_context_fields(template, context)
        
        assert used_fields == ['name']  # Only name has a non-empty value
