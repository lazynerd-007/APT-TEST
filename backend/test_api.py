#!/usr/bin/env python3
"""
Test script for the backend API for test generation and test-taking.
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

User = get_user_model()

# API endpoints
BASE_URL = "http://localhost:8000/api/v1"
GENERATE_DEMO_TEST_URL = f"{BASE_URL}/assessments/tests/generate_demo_test/"
LOGIN_URL = f"{BASE_URL}/auth/login/"

def print_separator():
    print("\n" + "=" * 80 + "\n")

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

def get_test_questions(test_library_id, token):
    """Get the questions for a test library"""
    print(f"\nGetting questions for test library {test_library_id}...")
    headers = {"Authorization": f"Token {token}"}
    response = requests.get(f"{BASE_URL}/assessments/questions/?test_id={test_library_id}", headers=headers)
    
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

def create_demo_user_directly():
    """Create a demo user directly in the database"""
    print("\nCreating demo user directly in the database...")
    
    from users.models import Role, Organization
    
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
        print("Demo user created successfully!")
    else:
        print("Demo user already exists.")
    
    return demo_candidate

def create_demo_test_directly():
    """Create a demo test directly in the database"""
    print("\nCreating demo test directly in the database...")
    
    from users.models import Role, Organization
    
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
    
    # Get or create a demo user
    demo_user, _ = User.objects.get_or_create(
        email='demo.employer@example.com',
        defaults={
            'first_name': 'Demo',
            'last_name': 'Employer',
            'is_active': True,
            'organization': demo_org,
            'role': candidate_role
        }
    )
    
    # Create a test library
    test_library = TestLibrary.objects.create(
        title='Demo Programming Test Library',
        description='A demo test library for programming skills assessment',
        creator=demo_user,
        category='Programming',
        difficulty='intermediate',
        is_public=True
    )
    
    # Create a test
    test = Test.objects.create(
        title='Demo Programming Test',
        description='A demo test for programming skills assessment',
        instructions='Answer all questions to the best of your ability. You can use any programming language for the coding questions.',
        time_limit=30,  # 30 minutes
        category='Programming',
        difficulty='intermediate',
        created_by=demo_user,
        organization=demo_org,
        is_active=True
    )
    
    # Create sample questions
    questions_data = [
        {
            'content': 'What is the time complexity of a binary search algorithm?',
            'type': 'mcq',
            'difficulty': 'medium',
            'points': 5,
            'answers': [
                {'content': 'O(1)', 'is_correct': False},
                {'content': 'O(log n)', 'is_correct': True},
                {'content': 'O(n)', 'is_correct': False},
                {'content': 'O(n log n)', 'is_correct': False}
            ]
        },
        {
            'content': 'Explain the difference between a stack and a queue data structure.',
            'type': 'essay',
            'difficulty': 'easy',
            'points': 10
        },
        {
            'content': 'Write a function to check if a string is a palindrome.',
            'type': 'coding',
            'difficulty': 'medium',
            'points': 15
        }
    ]
    
    # Create the questions and answers
    for i, q_data in enumerate(questions_data):
        question = Question.objects.create(
            test=test_library,  # Use test_library instead of test
            content=q_data['content'],
            type=q_data['type'],
            difficulty=q_data['difficulty'],
            points=q_data['points']
        )
        
        # Create answers for MCQ questions
        if q_data['type'] == 'mcq' and 'answers' in q_data:
            for a_data in q_data['answers']:
                Answer.objects.create(
                    question=question,
                    content=a_data['content'],
                    is_correct=a_data['is_correct']
                )
    
    # Get or create a demo candidate
    demo_candidate, _ = User.objects.get_or_create(
        email='demo.candidate@example.com',
        defaults={
            'first_name': 'Demo',
            'last_name': 'Candidate',
            'is_active': True,
            'organization': demo_org,
            'role': candidate_role
        }
    )
    
    # Create an assessment
    assessment = Assessment.objects.create(
        title='Demo Programming Assessment',
        description='A demo assessment for programming skills',
        time_limit=60,  # 60 minutes
        passing_score=70,
        created_by=demo_user,
        organization=demo_org,
        is_active=True
    )
    
    # Link the test to the assessment
    assessment_test = AssessmentTest.objects.create(
        assessment=assessment,
        test=test,
        weight=100,
        order=1
    )
    
    # Create a candidate assessment
    candidate_assessment = CandidateAssessment.objects.create(
        candidate=demo_candidate,
        assessment=assessment,
        status='not_started'
    )
    
    # Create a candidate test
    candidate_test = CandidateTest.objects.create(
        candidate_assessment=candidate_assessment,
        test=test,
        status='not_started'
    )
    
    print("Demo test created successfully!")
    print(f"Test ID: {test.id}")
    print(f"Test Library ID: {test_library.id}")
    print(f"Assessment ID: {assessment.id}")
    print(f"Candidate Assessment ID: {candidate_assessment.id}")
    print(f"Candidate Test ID: {candidate_test.id}")
    
    return {
        'test_id': test.id,
        'test_library_id': test_library.id,
        'assessment_id': assessment.id,
        'candidate_assessment_id': candidate_assessment.id,
        'candidate_test_id': candidate_test.id
    }

def run_test():
    """Run the complete test flow"""
    print_separator()
    print("TESTING BACKEND API FOR TEST GENERATION AND TEST-TAKING")
    print_separator()
    
    # Create demo user directly in the database
    create_demo_user_directly()
    
    # Create demo test directly in the database
    demo_data = create_demo_test_directly()
    if not demo_data:
        print("Failed to create demo test directly. Trying API...")
        demo_data = generate_demo_test()
        if not demo_data:
            print("Failed to generate demo test. Exiting...")
            return
    
    # Login as demo candidate
    login_data = login_as_demo_candidate()
    if not login_data:
        print("Failed to login as demo candidate. Exiting...")
        return
    
    token = login_data["token"]
    candidate_test_id = demo_data["candidate_test_id"]
    test_id = demo_data["test_id"]
    test_library_id = demo_data.get("test_library_id")
    
    # Get the candidate test
    candidate_test = get_candidate_test(candidate_test_id, token)
    if not candidate_test:
        print("Failed to get candidate test. Exiting...")
        return
    
    # Start the candidate test
    started_test = start_candidate_test(candidate_test_id, token)
    if not started_test:
        print("Failed to start candidate test. Exiting...")
        return
    
    # Get the test questions
    questions = get_test_questions(test_library_id or test_id, token)
    if not questions:
        print("Failed to get test questions. Exiting...")
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
    print("\nWaiting 2 seconds to simulate test-taking time...")
    time.sleep(2)
    
    # Submit the test
    submitted_test = submit_candidate_test(candidate_test_id, token)
    if not submitted_test:
        print("Failed to submit candidate test. Exiting...")
        return
    
    print_separator()
    print("✅ TEST COMPLETED SUCCESSFULLY!")
    print_separator()

if __name__ == "__main__":
    run_test() 