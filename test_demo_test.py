import requests
import json
import time

# API endpoints
BASE_URL = "http://localhost:8000/api/v1"
GENERATE_DEMO_TEST_URL = f"{BASE_URL}/assessments/tests/generate_demo_test/"
LOGIN_URL = f"{BASE_URL}/auth/login/"

def generate_demo_test():
    """Generate a demo test with sample questions"""
    print("Generating demo test...")
    response = requests.post(GENERATE_DEMO_TEST_URL)
    
    if response.status_code == 201:
        data = response.json()
        print(f"Demo test generated successfully!")
        print(f"Test ID: {data['test_id']}")
        print(f"Assessment ID: {data['assessment_id']}")
        print(f"Candidate Assessment ID: {data['candidate_assessment_id']}")
        print(f"Candidate Test ID: {data['candidate_test_id']}")
        return data
    else:
        print(f"Failed to generate demo test. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def login_as_demo_candidate():
    """Login as the demo candidate"""
    print("\nLogging in as demo candidate...")
    login_data = {
        "email": "demo.candidate@example.com",
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

def get_candidate_test(candidate_test_id, token):
    """Get the candidate test details"""
    print(f"\nGetting candidate test {candidate_test_id}...")
    headers = {"Authorization": f"Token {token}"}
    response = requests.get(f"{BASE_URL}/assessments/candidate-tests/{candidate_test_id}/", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print("Candidate test retrieved successfully!")
        print(f"Status: {data['status']}")
        return data
    else:
        print(f"Failed to get candidate test. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def start_candidate_test(candidate_test_id, token):
    """Start the candidate test"""
    print(f"\nStarting candidate test {candidate_test_id}...")
    headers = {"Authorization": f"Token {token}"}
    response = requests.post(f"{BASE_URL}/assessments/candidate-tests/{candidate_test_id}/start/", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print("Candidate test started successfully!")
        print(f"Status: {data['status']}")
        print(f"Start time: {data['start_time']}")
        return data
    else:
        print(f"Failed to start candidate test. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def get_test_questions(test_id, token):
    """Get the questions for a test"""
    print(f"\nGetting questions for test {test_id}...")
    headers = {"Authorization": f"Token {token}"}
    response = requests.get(f"{BASE_URL}/assessments/tests/{test_id}/questions/", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print(f"Retrieved {len(data)} questions successfully!")
        return data
    else:
        print(f"Failed to get test questions. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def save_answer(candidate_test_id, question_id, answer_text, token):
    """Save an answer for a question"""
    print(f"\nSaving answer for question {question_id}...")
    headers = {"Authorization": f"Token {token}"}
    data = {
        "question_id": question_id,
        "answer_text": answer_text
    }
    
    response = requests.post(
        f"{BASE_URL}/assessments/candidate-tests/{candidate_test_id}/save_answer/", 
        json=data, 
        headers=headers
    )
    
    if response.status_code in [200, 201]:
        data = response.json()
        print("Answer saved successfully!")
        return data
    else:
        print(f"Failed to save answer. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def submit_candidate_test(candidate_test_id, token):
    """Submit the candidate test"""
    print(f"\nSubmitting candidate test {candidate_test_id}...")
    headers = {"Authorization": f"Token {token}"}
    response = requests.post(f"{BASE_URL}/assessments/candidate-tests/{candidate_test_id}/submit/", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print("Candidate test submitted successfully!")
        print(f"Status: {data['status']}")
        print(f"End time: {data['end_time']}")
        print(f"Score: {data['score']}")
        return data
    else:
        print(f"Failed to submit candidate test. Status code: {response.status_code}")
        print(f"Response: {response.text}")
        return None

def run_test():
    """Run the complete test flow"""
    # Generate a demo test
    demo_data = generate_demo_test()
    if not demo_data:
        return
    
    # Login as demo candidate
    login_data = login_as_demo_candidate()
    if not login_data:
        return
    
    token = login_data["token"]
    candidate_test_id = demo_data["candidate_test_id"]
    test_id = demo_data["test_id"]
    
    # Get the candidate test
    candidate_test = get_candidate_test(candidate_test_id, token)
    if not candidate_test:
        return
    
    # Start the candidate test
    started_test = start_candidate_test(candidate_test_id, token)
    if not started_test:
        return
    
    # Get the test questions
    questions = get_test_questions(test_id, token)
    if not questions:
        return
    
    # Answer each question
    for question in questions:
        question_id = question["id"]
        question_type = question["type"]
        
        # Provide different answers based on question type
        if question_type == "mcq":
            # For MCQ, select the first answer
            answers = question.get("answers", [])
            if answers:
                answer_text = answers[0]["id"]  # Use the ID of the first answer
            else:
                answer_text = "No answer available"
        elif question_type == "coding":
            answer_text = "function isPalindrome(str) {\n  return str === str.split('').reverse().join('');\n}"
        else:  # essay or other types
            answer_text = "This is my answer to the question."
        
        # Save the answer
        saved_answer = save_answer(candidate_test_id, question_id, answer_text, token)
        if not saved_answer:
            print(f"Failed to save answer for question {question_id}")
    
    # Wait a moment to simulate test-taking time
    print("\nWaiting 5 seconds to simulate test-taking time...")
    time.sleep(5)
    
    # Submit the test
    submitted_test = submit_candidate_test(candidate_test_id, token)
    if not submitted_test:
        return
    
    print("\n✅ Test completed successfully!")

if __name__ == "__main__":
    run_test() 