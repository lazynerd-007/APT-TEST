#!/usr/bin/env python3
"""
Test script for the employer side of the test management interface.
"""
import os
import sys
import json
import requests
import time
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bluapt.settings')
django.setup()

from django.contrib.auth import get_user_model
from assessments.models import Test, TestLibrary, Question, Answer, Assessment, AssessmentTest, CandidateAssessment, CandidateTest
from users.models import Role, Organization

User = get_user_model()

# API endpoints
BASE_URL = "http://localhost:8000/api/v1"
LOGIN_URL = f"{BASE_URL}/auth/login/"
TESTS_URL = f"{BASE_URL}/assessments/tests/"
TEST_LIBRARIES_URL = f"{BASE_URL}/assessments/test-libraries/"
ASSESSMENTS_URL = f"{BASE_URL}/assessments/assessments/"
CANDIDATE_ASSESSMENTS_URL = f"{BASE_URL}/assessments/candidate-assessments/"

def print_separator():
    print("\n" + "=" * 80 + "\n")

def create_demo_employer():
    """Create a demo employer directly in the database"""
    print("\nCreating demo employer directly in the database...")
    
    # Get or create an employer role
    employer_role, _ = Role.objects.get_or_create(name='Employer')
    
    # Get or create a demo organization
    demo_org, _ = Organization.objects.get_or_create(
        name='Demo Organization',
        defaults={
            'description': 'Organization for demo purposes',
            'website': 'https://example.com',
            'industry': 'Technology'
        }
    )
    
    # Get or create a demo employer
    demo_employer, created = User.objects.get_or_create(
        email='demo.employer@example.com',
        defaults={
            'first_name': 'Demo',
            'last_name': 'Employer',
            'is_active': True,
            'organization': demo_org,
            'role': employer_role
        }
    )
    
    if created:
        demo_employer.set_password('demopassword')
        demo_employer.save()
        print("Demo employer created successfully!")
    else:
        print("Demo employer already exists.")
    
    return demo_employer

def login_as_demo_employer():
    """Login as the demo employer"""
    print("\nLogging in as demo employer...")
    login_data = {
        "email": "demo.employer@example.com",
        "password": "demopassword"  # This is the default password for demo users
    }
    
    response = requests.post(LOGIN_URL, json=login_data)
    
    if response.status_code == 200:
        data = response.json()
        print("Login successful!")
        print(f"Token: {data['token']}")
        return data
    else:
        print(f"Failed to login. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def create_test_library(token):
    """Create a new test library"""
    print("\nCreating a new test library...")
    headers = {"Authorization": f"Token {token}"}
    
    test_library_data = {
        "title": "Python Programming Test Library",
        "description": "A library of Python programming questions",
        "category": "Programming",
        "difficulty": "intermediate",
        "is_public": True
    }
    
    response = requests.post(TEST_LIBRARIES_URL, json=test_library_data, headers=headers)
    
    if response.status_code in [200, 201]:
        data = response.json()
        print("Test library created successfully!")
        print(f"Test Library ID: {data['id']}")
        return data
    else:
        print(f"Failed to create test library. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def create_test(token):
    """Create a new test"""
    print("\nCreating a new test...")
    headers = {"Authorization": f"Token {token}"}
    
    test_data = {
        "title": "Python Programming Test",
        "description": "A test to assess Python programming skills",
        "instructions": "Answer all questions to the best of your ability.",
        "time_limit": 45,  # 45 minutes
        "category": "Programming",
        "difficulty": "intermediate",
        "is_active": True
    }
    
    response = requests.post(TESTS_URL, json=test_data, headers=headers)
    
    if response.status_code in [200, 201]:
        data = response.json()
        print("Test created successfully!")
        print(f"Test ID: {data['id']}")
        return data
    else:
        print(f"Failed to create test. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def add_question_to_test_library(test_library_id, token, question_data):
    """Add a question to a test library"""
    print(f"\nAdding a question to test library {test_library_id}...")
    headers = {"Authorization": f"Token {token}"}
    
    response = requests.post(f"{TEST_LIBRARIES_URL}{test_library_id}/questions/", json=question_data, headers=headers)
    
    if response.status_code in [200, 201]:
        data = response.json()
        print("Question added successfully!")
        print(f"Question ID: {data['id']}")
        return data
    else:
        print(f"Failed to add question. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def get_test_libraries(token):
    """Get all test libraries"""
    print("\nGetting all test libraries...")
    headers = {"Authorization": f"Token {token}"}
    
    response = requests.get(TEST_LIBRARIES_URL, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print(f"Retrieved {len(data)} test libraries successfully!")
        return data
    else:
        print(f"Failed to get test libraries. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def get_test_library_details(test_library_id, token):
    """Get test library details"""
    print(f"\nGetting details for test library {test_library_id}...")
    headers = {"Authorization": f"Token {token}"}
    
    response = requests.get(f"{TEST_LIBRARIES_URL}{test_library_id}/", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print("Test library details retrieved successfully!")
        return data
    else:
        print(f"Failed to get test library details. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def get_test_library_questions(test_library_id, token):
    """Get questions for a test library"""
    print(f"\nGetting questions for test library {test_library_id}...")
    headers = {"Authorization": f"Token {token}"}
    
    response = requests.get(f"{TEST_LIBRARIES_URL}{test_library_id}/questions/", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print(f"Retrieved {len(data)} questions successfully!")
        return data
    else:
        print(f"Failed to get test library questions. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def get_tests(token):
    """Get all tests"""
    print("\nGetting all tests...")
    headers = {"Authorization": f"Token {token}"}
    
    response = requests.get(TESTS_URL, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print(f"Retrieved {len(data)} tests successfully!")
        return data
    else:
        print(f"Failed to get tests. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def get_test_details(test_id, token):
    """Get test details"""
    print(f"\nGetting details for test {test_id}...")
    headers = {"Authorization": f"Token {token}"}
    
    response = requests.get(f"{TESTS_URL}{test_id}/", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print("Test details retrieved successfully!")
        return data
    else:
        print(f"Failed to get test details. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def get_test_questions(test_id, token):
    """Get questions for a test"""
    print(f"\nGetting questions for test {test_id}...")
    headers = {"Authorization": f"Token {token}"}
    
    response = requests.get(f"{TESTS_URL}{test_id}/questions/", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print(f"Retrieved {len(data)} questions successfully!")
        return data
    else:
        print(f"Failed to get test questions. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def create_assessment(token):
    """Create a new assessment"""
    print("\nCreating a new assessment...")
    headers = {"Authorization": f"Token {token}"}
    
    assessment_data = {
        "title": "Python Developer Assessment",
        "description": "An assessment to evaluate Python development skills",
        "time_limit": 90,  # 90 minutes
        "passing_score": 70,
        "is_active": True
    }
    
    response = requests.post(ASSESSMENTS_URL, json=assessment_data, headers=headers)
    
    if response.status_code in [200, 201]:
        data = response.json()
        print("Assessment created successfully!")
        print(f"Assessment ID: {data['id']}")
        return data
    else:
        print(f"Failed to create assessment. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def add_test_to_assessment(assessment_id, test_id, token):
    """Add a test to an assessment"""
    print(f"\nAdding test {test_id} to assessment {assessment_id}...")
    headers = {"Authorization": f"Token {token}"}
    
    data = {
        "test_id": test_id,
        "weight": 100,
        "order": 1
    }
    
    response = requests.post(f"{ASSESSMENTS_URL}{assessment_id}/tests/", json=data, headers=headers)
    
    if response.status_code in [200, 201]:
        data = response.json()
        print("Test added to assessment successfully!")
        return data
    else:
        print(f"Failed to add test to assessment. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def get_assessments(token):
    """Get all assessments"""
    print("\nGetting all assessments...")
    headers = {"Authorization": f"Token {token}"}
    
    response = requests.get(ASSESSMENTS_URL, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print(f"Retrieved {len(data)} assessments successfully!")
        return data
    else:
        print(f"Failed to get assessments. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def get_assessment_details(assessment_id, token):
    """Get assessment details"""
    print(f"\nGetting details for assessment {assessment_id}...")
    headers = {"Authorization": f"Token {token}"}
    
    response = requests.get(f"{ASSESSMENTS_URL}{assessment_id}/", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print("Assessment details retrieved successfully!")
        return data
    else:
        print(f"Failed to get assessment details. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def get_assessment_tests(assessment_id, token):
    """Get tests for an assessment"""
    print(f"\nGetting tests for assessment {assessment_id}...")
    headers = {"Authorization": f"Token {token}"}
    
    response = requests.get(f"{ASSESSMENTS_URL}{assessment_id}/tests/", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print(f"Retrieved {len(data)} tests for the assessment successfully!")
        return data
    else:
        print(f"Failed to get assessment tests. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def create_candidate_assessment(assessment_id, candidate_email, token):
    """Create a candidate assessment"""
    print(f"\nCreating candidate assessment for {candidate_email}...")
    headers = {"Authorization": f"Token {token}"}
    
    data = {
        "assessment_id": assessment_id,
        "candidate_email": candidate_email
    }
    
    response = requests.post(CANDIDATE_ASSESSMENTS_URL, json=data, headers=headers)
    
    if response.status_code in [200, 201]:
        data = response.json()
        print("Candidate assessment created successfully!")
        print(f"Candidate Assessment ID: {data['id']}")
        return data
    else:
        print(f"Failed to create candidate assessment. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def get_candidate_assessments(token):
    """Get all candidate assessments"""
    print("\nGetting all candidate assessments...")
    headers = {"Authorization": f"Token {token}"}
    
    response = requests.get(CANDIDATE_ASSESSMENTS_URL, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print(f"Retrieved {len(data)} candidate assessments successfully!")
        return data
    else:
        print(f"Failed to get candidate assessments. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def get_candidate_assessment_details(candidate_assessment_id, token):
    """Get candidate assessment details"""
    print(f"\nGetting details for candidate assessment {candidate_assessment_id}...")
    headers = {"Authorization": f"Token {token}"}
    
    response = requests.get(f"{CANDIDATE_ASSESSMENTS_URL}{candidate_assessment_id}/", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print("Candidate assessment details retrieved successfully!")
        return data
    else:
        print(f"Failed to get candidate assessment details. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def create_demo_candidate():
    """Create a demo candidate directly in the database"""
    print("\nCreating demo candidate directly in the database...")
    
    # Get or create a candidate role
    candidate_role, _ = Role.objects.get_or_create(name='Candidate')
    
    # Get or create a demo organization
    demo_org, _ = Organization.objects.get_or_create(
        name='Demo Organization',
        defaults={
            'description': 'Organization for demo purposes',
            'website': 'https://example.com',
            'industry': 'Technology'
        }
    )
    
    # Get or create a demo candidate
    demo_candidate, created = User.objects.get_or_create(
        email='demo.candidate@example.com',
        defaults={
            'first_name': 'Demo',
            'last_name': 'Candidate',
            'is_active': True,
            'organization': demo_org,
            'role': candidate_role
        }
    )
    
    if created:
        demo_candidate.set_password('demopassword')
        demo_candidate.save()
        print("Demo candidate created successfully!")
    else:
        print("Demo candidate already exists.")
    
    return demo_candidate

def run_test():
    """Run the complete test flow for the employer side"""
    print_separator()
    print("TESTING EMPLOYER SIDE OF TEST MANAGEMENT INTERFACE")
    print_separator()
    
    # Create demo employer directly in the database
    create_demo_employer()
    
    # Create demo candidate directly in the database
    create_demo_candidate()
    
    # Login as demo employer
    login_data = login_as_demo_employer()
    if not login_data:
        print("Failed to login as demo employer. Exiting...")
        return
    
    token = login_data["token"]
    
    # Create a test library
    test_library_data = create_test_library(token)
    if not test_library_data:
        print("Failed to create test library. Exiting...")
        return
    
    test_library_id = test_library_data["id"]
    
    # Add questions to the test library
    questions_data = [
        {
            "content": "What is the output of the following Python code?\n\n```python\nx = [1, 2, 3]\ny = x\ny.append(4)\nprint(x)\n```",
            "type": "mcq",
            "difficulty": "easy",
            "points": 5,
            "answers": [
                {"content": "[1, 2, 3]", "is_correct": False},
                {"content": "[1, 2, 3, 4]", "is_correct": True},
                {"content": "[1, 2, 3, [4]]", "is_correct": False},
                {"content": "Error", "is_correct": False}
            ]
        },
        {
            "content": "Explain the difference between a list and a tuple in Python.",
            "type": "essay",
            "difficulty": "medium",
            "points": 10
        },
        {
            "content": "Write a Python function to find the longest common substring between two strings.",
            "type": "coding",
            "difficulty": "hard",
            "points": 15
        }
    ]
    
    for question_data in questions_data:
        added_question = add_question_to_test_library(test_library_id, token, question_data)
        if not added_question:
            print(f"Failed to add question: {question_data['content'][:30]}...")
    
    # Get all test libraries
    test_libraries = get_test_libraries(token)
    if not test_libraries:
        print("Failed to get test libraries. Continuing...")
    
    # Get test library details
    test_library_details = get_test_library_details(test_library_id, token)
    if not test_library_details:
        print("Failed to get test library details. Continuing...")
    
    # Get test library questions
    test_library_questions = get_test_library_questions(test_library_id, token)
    if not test_library_questions:
        print("Failed to get test library questions. Continuing...")
    
    # Create a test
    test_data = create_test(token)
    if not test_data:
        print("Failed to create test. Exiting...")
        return
    
    test_id = test_data["id"]
    
    # Get all tests
    tests = get_tests(token)
    if not tests:
        print("Failed to get tests. Continuing...")
    
    # Get test details
    test_details = get_test_details(test_id, token)
    if not test_details:
        print("Failed to get test details. Continuing...")
    
    # Create an assessment
    assessment_data = create_assessment(token)
    if not assessment_data:
        print("Failed to create assessment. Exiting...")
        return
    
    assessment_id = assessment_data["id"]
    
    # Add test to assessment
    assessment_test_data = add_test_to_assessment(assessment_id, test_id, token)
    if not assessment_test_data:
        print("Failed to add test to assessment. Continuing...")
    
    # Get all assessments
    assessments = get_assessments(token)
    if not assessments:
        print("Failed to get assessments. Continuing...")
    
    # Get assessment details
    assessment_details = get_assessment_details(assessment_id, token)
    if not assessment_details:
        print("Failed to get assessment details. Continuing...")
    
    # Get assessment tests
    assessment_tests = get_assessment_tests(assessment_id, token)
    if not assessment_tests:
        print("Failed to get assessment tests. Continuing...")
    
    # Create a candidate assessment
    candidate_assessment_data = create_candidate_assessment(assessment_id, "demo.candidate@example.com", token)
    if not candidate_assessment_data:
        print("Failed to create candidate assessment. Continuing...")
    else:
        candidate_assessment_id = candidate_assessment_data["id"]
        
        # Get all candidate assessments
        candidate_assessments = get_candidate_assessments(token)
        if not candidate_assessments:
            print("Failed to get candidate assessments. Continuing...")
        
        # Get candidate assessment details
        candidate_assessment_details = get_candidate_assessment_details(candidate_assessment_id, token)
        if not candidate_assessment_details:
            print("Failed to get candidate assessment details. Continuing...")
    
    print_separator()
    print("✅ EMPLOYER TEST MANAGEMENT INTERFACE TEST COMPLETED!")
    print_separator()

if __name__ == "__main__":
    run_test() 