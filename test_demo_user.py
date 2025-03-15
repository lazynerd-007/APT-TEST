import requests
import json
import sys

# Configuration
API_URL = 'http://localhost:8000/api/v1'  # Update this if your backend is running on a different URL
DEMO_EMAIL = 'demo.candidate@example.com'
DEMO_PASSWORD = 'demopassword'

def print_separator():
    print('-' * 80)

def test_create_demo_user():
    print("Testing demo user creation...")
    url = f"{API_URL}/users/create_demo_user/"
    
    response = requests.post(url, json={})
    
    print(f"Status code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code in [200, 201]:
        print("✅ Demo user creation successful!")
    else:
        print("❌ Demo user creation failed!")
    
    return response.status_code in [200, 201]

def test_login_with_demo_user():
    print_separator()
    print("Testing login with demo user...")
    url = f"{API_URL}/auth/login/"
    
    data = {
        "email": DEMO_EMAIL,
        "password": DEMO_PASSWORD
    }
    
    response = requests.post(url, json=data)
    
    print(f"Status code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2) if response.status_code == 200 else response.text}")
    
    if response.status_code == 200:
        print("✅ Login successful!")
        token = response.json().get('token')
        user = response.json().get('user')
        print(f"User: {user.get('name')} ({user.get('email')})")
        print(f"Role: {user.get('role')}")
        return True
    else:
        print("❌ Login failed!")
        return False

def main():
    print_separator()
    print("DEMO USER FUNCTIONALITY TEST")
    print_separator()
    
    # Step 1: Create demo user
    create_success = test_create_demo_user()
    
    # Step 2: Login with demo user
    login_success = test_login_with_demo_user()
    
    # Summary
    print_separator()
    print("TEST SUMMARY")
    print_separator()
    print(f"Create demo user: {'✅ PASS' if create_success else '❌ FAIL'}")
    print(f"Login with demo user: {'✅ PASS' if login_success else '❌ FAIL'}")
    print_separator()
    
    if create_success and login_success:
        print("🎉 All tests passed! Demo user functionality is working correctly.")
        return 0
    else:
        print("❌ Some tests failed. Please check the logs above for details.")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 