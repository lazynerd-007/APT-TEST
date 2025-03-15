import requests
import json
import time

# Base URL for the API
BASE_URL = "http://localhost:8000/api"

# Admin credentials
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "password123"

# Candidate credentials
CANDIDATE_EMAIL = "candidate@example.com"
CANDIDATE_PASSWORD = "password123"

def login(email, password):
    """Login and get the authentication token"""
    url = f"{BASE_URL}/auth/login/"
    data = {
        "email": email,
        "password": password
    }
    response = requests.post(url, json=data)
    if response.status_code == 200:
        return response.json().get("token")
    else:
        print(f"Login failed: {response.text}")
        return None

def create_test(token):
    """Create a new test"""
    url = f"{BASE_URL}/assessments/tests/"
    headers = {
        "Authorization": f"Token {token}",
        "Content-Type": "application/json"
    }
    data = {
        "title": "API Test - " + time.strftime("%Y-%m-%d %H:%M:%S"),
        "description": "Test created via API script",
        "instructions": "Follow the instructions for each question",
        "time_limit": 60,
        "category": "API Testing",
        "difficulty": "medium",
        "is_active": True
    }
    response = requests.post(url, headers=headers, json=data)
    if response.status_code in [200, 201]:
        print("Test created successfully")
        return response.json()
    else:
        print(f"Failed to create test: {response.text}")
        return None

def create_question(token, test_id):
    """Create a new question for the test"""
    url = f"{BASE_URL}/assessments/questions/"
    headers = {
        "Authorization": f"Token {token}",
        "Content-Type": "application/json"
    }
    data = {
        "test": test_id,
        "content": "What is the capital of France?",
        "type": "mcq",
        "difficulty": "easy",
        "points": 5,
        "answers": [
            {
                "content": "Paris",
                "is_correct": True,
                "explanation": "Paris is the capital of France"
            },
            {
                "content": "London",
                "is_correct": False,
                "explanation": "London is the capital of the UK"
            },
            {
                "content": "Berlin",
                "is_correct": False,
                "explanation": "Berlin is the capital of Germany"
            },
            {
                "content": "Madrid",
                "is_correct": False,
                "explanation": "Madrid is the capital of Spain"
            }
        ]
    }
    response = requests.post(url, headers=headers, json=data)
    if response.status_code in [200, 201]:
        print("Question created successfully")
        return response.json()
    else:
        print(f"Failed to create question: {response.text}")
        return None

def create_assessment(token, test_id):
    """Create a new assessment with the test"""
    url = f"{BASE_URL}/assessments/assessments/"
    headers = {
        "Authorization": f"Token {token}",
        "Content-Type": "application/json"
    }
    data = {
        "title": "API Assessment - " + time.strftime("%Y-%m-%d %H:%M:%S"),
        "description": "Assessment created via API script",
        "time_limit": 60,
        "passing_score": 70,
        "is_active": True,
        "test_data": [
            {
                "test_id": test_id,
                "weight": 100,
                "order": 1
            }
        ]
    }
    response = requests.post(url, headers=headers, json=data)
    if response.status_code in [200, 201]:
        print("Assessment created successfully")
        return response.json()
    else:
        print(f"Failed to create assessment: {response.text}")
        return None

def invite_candidate(token, assessment_id, candidate_email):
    """Invite a candidate to take the assessment"""
    url = f"{BASE_URL}/candidates/invite/"
    headers = {
        "Authorization": f"Token {token}",
        "Content-Type": "application/json"
    }
    data = {
        "assessment_id": assessment_id,
        "candidates": [
            {
                "email": candidate_email,
                "name": "Test Candidate"
            }
        ]
    }
    response = requests.post(url, headers=headers, json=data)
    if response.status_code in [200, 201]:
        print("Candidate invited successfully")
        return response.json()
    else:
        print(f"Failed to invite candidate: {response.text}")
        return None

def get_candidate_assessments(token):
    """Get assessments assigned to the candidate"""
    url = f"{BASE_URL}/assessments/candidate-assessments/"
    headers = {
        "Authorization": f"Token {token}",
        "Content-Type": "application/json"
    }
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        print("Retrieved candidate assessments successfully")
        return response.json()
    else:
        print(f"Failed to get candidate assessments: {response.text}")
        return None

def start_candidate_test(token, candidate_test_id):
    """Start a candidate test"""
    url = f"{BASE_URL}/assessments/candidate-tests/{candidate_test_id}/start/"
    headers = {
        "Authorization": f"Token {token}",
        "Content-Type": "application/json"
    }
    response = requests.post(url, headers=headers)
    if response.status_code in [200, 201]:
        print("Test started successfully")
        return response.json()
    else:
        print(f"Failed to start test: {response.text}")
        return None

def submit_answer(token, candidate_test_id, question_id, answer_id):
    """Submit an answer for a question"""
    url = f"{BASE_URL}/assessments/candidate-tests/{candidate_test_id}/answers/"
    headers = {
        "Authorization": f"Token {token}",
        "Content-Type": "application/json"
    }
    data = {
        "question_id": question_id,
        "answer_id": answer_id
    }
    response = requests.post(url, headers=headers, json=data)
    if response.status_code in [200, 201]:
        print("Answer submitted successfully")
        return response.json()
    else:
        print(f"Failed to submit answer: {response.text}")
        return None

def complete_test(token, candidate_test_id):
    """Complete a candidate test"""
    url = f"{BASE_URL}/assessments/candidate-tests/{candidate_test_id}/complete/"
    headers = {
        "Authorization": f"Token {token}",
        "Content-Type": "application/json"
    }
    response = requests.post(url, headers=headers)
    if response.status_code in [200, 201]:
        print("Test completed successfully")
        return response.json()
    else:
        print(f"Failed to complete test: {response.text}")
        return None

def main():
    # Login as admin
    print("Logging in as admin...")
    admin_token = login(ADMIN_EMAIL, ADMIN_PASSWORD)
    if not admin_token:
        print("Admin login failed. Exiting.")
        return
    
    # Create a test
    print("\nCreating a test...")
    test = create_test(admin_token)
    if not test:
        print("Test creation failed. Exiting.")
        return
    
    test_id = test.get("id")
    
    # Create a question for the test
    print("\nCreating a question...")
    question = create_question(admin_token, test_id)
    if not question:
        print("Question creation failed. Exiting.")
        return
    
    question_id = question.get("id")
    
    # Create an assessment with the test
    print("\nCreating an assessment...")
    assessment = create_assessment(admin_token, test_id)
    if not assessment:
        print("Assessment creation failed. Exiting.")
        return
    
    assessment_id = assessment.get("id")
    
    # Invite a candidate
    print("\nInviting a candidate...")
    invitation = invite_candidate(admin_token, assessment_id, CANDIDATE_EMAIL)
    if not invitation:
        print("Candidate invitation failed. Exiting.")
        return
    
    # Login as candidate
    print("\nLogging in as candidate...")
    candidate_token = login(CANDIDATE_EMAIL, CANDIDATE_PASSWORD)
    if not candidate_token:
        print("Candidate login failed. Exiting.")
        return
    
    # Get candidate assessments
    print("\nGetting candidate assessments...")
    candidate_assessments = get_candidate_assessments(candidate_token)
    if not candidate_assessments:
        print("Failed to get candidate assessments. Exiting.")
        return
    
    # Find the candidate test for the assessment we created
    candidate_test_id = None
    for assessment in candidate_assessments:
        if assessment.get("assessment") == assessment_id:
            candidate_tests = assessment.get("candidate_tests", [])
            if candidate_tests:
                candidate_test_id = candidate_tests[0].get("id")
                break
    
    if not candidate_test_id:
        print("Could not find candidate test. Exiting.")
        return
    
    # Start the test
    print("\nStarting the test...")
    start_result = start_candidate_test(candidate_token, candidate_test_id)
    if not start_result:
        print("Failed to start test. Exiting.")
        return
    
    # Submit an answer (assuming the first answer is correct)
    print("\nSubmitting an answer...")
    correct_answer_id = question.get("answers")[0].get("id")
    answer_result = submit_answer(candidate_token, candidate_test_id, question_id, correct_answer_id)
    if not answer_result:
        print("Failed to submit answer. Exiting.")
        return
    
    # Complete the test
    print("\nCompleting the test...")
    complete_result = complete_test(candidate_token, candidate_test_id)
    if not complete_result:
        print("Failed to complete test. Exiting.")
        return
    
    print("\nTest completed successfully!")
    print(f"Test ID: {test_id}")
    print(f"Assessment ID: {assessment_id}")
    print(f"Candidate Test ID: {candidate_test_id}")

if __name__ == "__main__":
    main() 