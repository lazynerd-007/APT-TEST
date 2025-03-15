import requests
import json
import time
import webbrowser
import os

# URLs
BASE_URL = "http://localhost:3000"
LOGIN_URL = f"{BASE_URL}/login"
TESTS_URL = f"{BASE_URL}/tests"
CREATE_TEST_URL = f"{BASE_URL}/tests/create"
QUESTIONS_URL = f"{BASE_URL}/questions"
CREATE_QUESTION_URL = f"{BASE_URL}/questions/create"

# Admin credentials
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "password123"

def main():
    """Test question creation by opening the browser to the relevant pages"""
    
    # Step 1: Open the login page
    print(f"Opening login page: {LOGIN_URL}")
    webbrowser.open(LOGIN_URL)
    
    # Wait for user to login
    input("Press Enter after you have logged in...")
    
    # Step 2: Open the tests page
    print(f"\nOpening tests page: {TESTS_URL}")
    webbrowser.open(TESTS_URL)
    
    # Wait for user to select or create a test
    test_id = input("\nEnter the ID of the test you want to add questions to (or press Enter to create a new test): ")
    
    if not test_id:
        # Step 3a: Open the create test page
        print(f"\nOpening create test page: {CREATE_TEST_URL}")
        webbrowser.open(CREATE_TEST_URL)
        
        # Wait for user to create a test
        test_id = input("\nEnter the ID of the test you just created: ")
    
    # Step 4: Open the create question page with the test ID
    create_question_url = f"{CREATE_QUESTION_URL}?testId={test_id}"
    print(f"\nOpening create question page: {create_question_url}")
    webbrowser.open(create_question_url)
    
    # Wait for user to create a question
    input("\nPress Enter after you have created a question...")
    
    # Step 5: Open the questions page filtered by the test
    questions_url = f"{QUESTIONS_URL}?testId={test_id}"
    print(f"\nOpening questions page: {questions_url}")
    webbrowser.open(questions_url)
    
    print("\nTest completed!")
    print(f"Test ID: {test_id}")
    print("You can continue to add more questions or view the test details.")

if __name__ == "__main__":
    main() 