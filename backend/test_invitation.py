#!/usr/bin/env python
"""
Test script for candidate invitation and verification API endpoints.
"""
import json
import requests
import sys
import uuid
from datetime import datetime

# Configuration
API_BASE_URL = "http://localhost:8000/api/v1"
POSTMARK_API_KEY = "6be4158a-6496-4d18-bedf-ecac1e65b9bc"

def test_invite_candidates():
    """Test the invite_candidates endpoint."""
    print("Testing candidate invitation...")
    
    # Test data
    invite_data = {
        "assessment_id": str(uuid.uuid4()),
        "candidates": [
            {"name": "Test User", "email": "test.user@example.com"},
            {"name": "Another User", "email": "another.user@example.com"}
        ],
        "message": "This is a test invitation. Please complete the assessment."
    }
    
    # Headers
    headers = {
        "Content-Type": "application/json",
        "X-Postmark-API-Key": POSTMARK_API_KEY
    }
    
    # Make the request
    try:
        response = requests.post(
            f"{API_BASE_URL}/users/invite_candidates/",
            headers=headers,
            data=json.dumps(invite_data)
        )
        
        # Print response
        print(f"Status code: {response.status_code}")
        print("Response:")
        print(json.dumps(response.json(), indent=2))
        
        return response.json()
    except Exception as e:
        print(f"Error: {e}")
        return None

def test_verify_access_code():
    """Test the verify_access_code endpoint."""
    print("\nTesting access code verification...")
    
    # Test data - using a known test account
    verify_data = {
        "email": "candidate@example.com",
        "access_code": "TEST123"
    }
    
    # Headers
    headers = {
        "Content-Type": "application/json"
    }
    
    # Make the request
    try:
        response = requests.post(
            f"{API_BASE_URL}/users/verify_access_code/",
            headers=headers,
            data=json.dumps(verify_data)
        )
        
        # Print response
        print(f"Status code: {response.status_code}")
        print("Response:")
        print(json.dumps(response.json() if response.status_code == 200 else response.text, indent=2))
        
        return response.json() if response.status_code == 200 else None
    except Exception as e:
        print(f"Error: {e}")
        return None

def main():
    """Run all tests."""
    print(f"=== Testing Candidate Invitation System at {datetime.now()} ===\n")
    
    # Test invitation
    invite_result = test_invite_candidates()
    
    # Test verification
    verify_result = test_verify_access_code()
    
    # Summary
    print("\n=== Test Summary ===")
    print(f"Invitation test: {'Passed' if invite_result else 'Failed'}")
    print(f"Verification test: {'Passed' if verify_result else 'Failed'}")

if __name__ == "__main__":
    main() 