#!/usr/bin/env python3
"""
Test script to verify the prompt engine API endpoints.
"""
import httpx
import json

BASE_URL = "http://localhost:8001"

def test_health_endpoint():
    """Test the health endpoint."""
    print("🔍 Testing health endpoint...")
    response = httpx.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    print()

def test_generate_prompt():
    """Test the generate prompt endpoint."""
    print("🔍 Testing generate prompt endpoint...")
    
    test_data = {
        "template": {
            "id": "test-template",
            "name": "User Story Template",
            "description": "Template for creating user stories",
            "template": "As a {{role}}, I want to {{goal}} so that {{benefit}}.",
            "role": "Product Manager",
            "useCase": "Requirements gathering",
            "requiredFields": ["role", "goal", "benefit"],
            "optionalFields": [],
            "metadata": {}
        },
        "context": {
            "role": "software developer",
            "goal": "implement user authentication",
            "benefit": "users can securely access their accounts"
        }
    }
    
    response = httpx.post(f"{BASE_URL}/api/v1/prompts/generate-prompt", json=test_data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Generated prompt: {result['prompt']}")
        print(f"Missing fields: {result['missing_fields']}")
        print(f"Context used: {result['context_used']}")
    else:
        print(f"Error: {response.text}")
    print()

def test_preview_prompt():
    """Test the preview prompt endpoint."""
    print("🔍 Testing preview prompt endpoint...")
    
    test_data = {
        "template": {
            "id": "test-template",
            "name": "User Story Template",
            "description": "Template for creating user stories",
            "template": "As a {{role}}, I want to {{goal}} so that {{benefit}}.",
            "role": "Product Manager",
            "useCase": "Requirements gathering",
            "requiredFields": ["role", "goal", "benefit"],
            "optionalFields": [],
            "metadata": {}
        },
        "context": {
            "role": "software developer"
            # Intentionally missing "goal" and "benefit" for preview
        }
    }
    
    response = httpx.post(f"{BASE_URL}/api/v1/prompts/preview-prompt", json=test_data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Preview: {result['preview']}")
        print(f"Variables found: {result['variables_found']}")
        print(f"Variables provided: {result['variables_provided']}")
        print(f"Variables missing: {result['variables_missing']}")
    else:
        print(f"Error: {response.text}")
    print()

def test_extract_variables():
    """Test the extract variables endpoint."""
    print("🔍 Testing extract variables endpoint...")
    
    test_data = {
        "template": "Hello {{name}}, welcome to {{project}}! Your role is {{role}}."
    }
    
    response = httpx.post(f"{BASE_URL}/api/v1/prompts/extract-variables", json=test_data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Variables: {result['variables']}")
        print(f"Count: {result['count']}")
    else:
        print(f"Error: {response.text}")
    print()

def test_validate_context():
    """Test the validate context endpoint."""
    print("🔍 Testing validate context endpoint...")
    
    test_data = {
        "required_fields": ["name", "role", "project"],
        "context": {
            "name": "John Doe",
            "role": "Developer"
            # Missing "project"
        }
    }
    
    response = httpx.post(f"{BASE_URL}/api/v1/prompts/validate-context", json=test_data)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Is valid: {result['is_valid']}")
        print(f"Missing fields: {result['missing_fields']}")
        print(f"Provided fields: {result['provided_fields']}")
    else:
        print(f"Error: {response.text}")
    print()

if __name__ == "__main__":
    print("🚀 Testing Prompt Engine API Endpoints")
    print("=" * 50)
    
    try:
        test_health_endpoint()
        test_generate_prompt()
        test_preview_prompt()
        test_extract_variables()
        test_validate_context()
        
        print("✅ All tests completed!")
        
    except Exception as e:
        print(f"❌ Error occurred: {e}")
