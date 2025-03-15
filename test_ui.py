from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import time
import random
import string

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

# Candidate credentials
CANDIDATE_EMAIL = "candidate@example.com"
CANDIDATE_PASSWORD = "password123"

def random_string(length=8):
    """Generate a random string of fixed length"""
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

def setup_driver():
    """Set up the WebDriver"""
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")  # Run in headless mode
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    
    try:
        driver = webdriver.Chrome(options=options)
        driver.implicitly_wait(10)
        return driver
    except Exception as e:
        print(f"Failed to set up WebDriver: {e}")
        return None

def login(driver, email, password):
    """Login to the application"""
    try:
        driver.get(LOGIN_URL)
        
        # Wait for the login form to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "email"))
        )
        
        # Enter email and password
        driver.find_element(By.ID, "email").send_keys(email)
        driver.find_element(By.ID, "password").send_keys(password)
        
        # Click login button
        driver.find_element(By.XPATH, "//button[contains(text(), 'Login')]").click()
        
        # Wait for redirect after login
        WebDriverWait(driver, 10).until(
            EC.url_contains("/dashboard")
        )
        
        print(f"Logged in as {email}")
        return True
    except TimeoutException:
        print("Timeout waiting for login page to load or redirect after login")
        return False
    except Exception as e:
        print(f"Login failed: {e}")
        return False

def create_test(driver):
    """Create a new test"""
    try:
        driver.get(CREATE_TEST_URL)
        
        # Wait for the form to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "title"))
        )
        
        # Generate a unique test title
        test_title = f"UI Test - {random_string()} - {time.strftime('%Y-%m-%d %H:%M:%S')}"
        
        # Fill in the form
        driver.find_element(By.ID, "title").send_keys(test_title)
        driver.find_element(By.ID, "description").send_keys("Test created via UI automation")
        driver.find_element(By.ID, "instructions").send_keys("Follow the instructions for each question")
        driver.find_element(By.ID, "time_limit").clear()
        driver.find_element(By.ID, "time_limit").send_keys("60")
        
        # Select difficulty
        driver.find_element(By.ID, "difficulty").click()
        driver.find_element(By.XPATH, "//option[text()='Medium']").click()
        
        # Submit the form
        driver.find_element(By.XPATH, "//button[contains(text(), 'Create Test')]").click()
        
        # Wait for redirect to tests page
        WebDriverWait(driver, 10).until(
            EC.url_contains(TESTS_URL)
        )
        
        print(f"Test created: {test_title}")
        return test_title
    except TimeoutException:
        print("Timeout waiting for test creation form to load or redirect after submission")
        return None
    except Exception as e:
        print(f"Test creation failed: {e}")
        return None

def find_test_id(driver, test_title):
    """Find the ID of a test by its title"""
    try:
        driver.get(TESTS_URL)
        
        # Wait for the tests table to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//table"))
        )
        
        # Find the test row by title
        test_row = driver.find_element(By.XPATH, f"//td[contains(text(), '{test_title}')]/..")
        
        # Extract the test ID from the row's actions
        edit_link = test_row.find_element(By.XPATH, ".//a[contains(@href, '/tests/edit/')]")
        href = edit_link.get_attribute("href")
        test_id = href.split("/")[-1]
        
        print(f"Found test ID: {test_id}")
        return test_id
    except TimeoutException:
        print("Timeout waiting for tests page to load")
        return None
    except Exception as e:
        print(f"Failed to find test ID: {e}")
        return None

def create_question(driver, test_id):
    """Create a new question for the test"""
    try:
        # Navigate to create question page with test ID
        driver.get(f"{CREATE_QUESTION_URL}?testId={test_id}")
        
        # Wait for the form to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "content"))
        )
        
        # Fill in the form
        driver.find_element(By.ID, "content").send_keys("What is the capital of France?")
        
        # Select question type (MCQ)
        driver.find_element(By.ID, "type").click()
        driver.find_element(By.XPATH, "//option[text()='Multiple Choice']").click()
        
        # Wait for answers section to appear
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//h3[contains(text(), 'Answers')]"))
        )
        
        # Add answers
        answer_inputs = driver.find_elements(By.XPATH, "//input[@name='answers[0].content']")
        if answer_inputs:
            answer_inputs[0].send_keys("Paris")
            
            # Mark as correct
            driver.find_element(By.XPATH, "//input[@name='answers[0].isCorrect']").click()
            
            # Add explanation
            driver.find_element(By.XPATH, "//textarea[@name='answers[0].explanation']").send_keys("Paris is the capital of France")
        
        # Add more answers
        driver.find_element(By.XPATH, "//button[contains(text(), 'Add Answer')]").click()
        driver.find_element(By.XPATH, "//input[@name='answers[1].content']").send_keys("London")
        
        driver.find_element(By.XPATH, "//button[contains(text(), 'Add Answer')]").click()
        driver.find_element(By.XPATH, "//input[@name='answers[2].content']").send_keys("Berlin")
        
        driver.find_element(By.XPATH, "//button[contains(text(), 'Add Answer')]").click()
        driver.find_element(By.XPATH, "//input[@name='answers[3].content']").send_keys("Madrid")
        
        # Set points
        driver.find_element(By.ID, "points").clear()
        driver.find_element(By.ID, "points").send_keys("5")
        
        # Submit the form
        driver.find_element(By.XPATH, "//button[contains(text(), 'Create Question')]").click()
        
        # Wait for redirect to questions page
        WebDriverWait(driver, 10).until(
            EC.url_contains(QUESTIONS_URL)
        )
        
        print("Question created successfully")
        return True
    except TimeoutException:
        print("Timeout waiting for question creation form to load or redirect after submission")
        return False
    except Exception as e:
        print(f"Question creation failed: {e}")
        return False

def main():
    driver = setup_driver()
    if not driver:
        print("Failed to set up WebDriver. Exiting.")
        return
    
    try:
        # Login as admin
        print("Logging in as admin...")
        if not login(driver, ADMIN_EMAIL, ADMIN_PASSWORD):
            print("Admin login failed. Exiting.")
            return
        
        # Create a test
        print("\nCreating a test...")
        test_title = create_test(driver)
        if not test_title:
            print("Test creation failed. Exiting.")
            return
        
        # Find the test ID
        print("\nFinding test ID...")
        test_id = find_test_id(driver, test_title)
        if not test_id:
            print("Failed to find test ID. Exiting.")
            return
        
        # Create a question for the test
        print("\nCreating a question...")
        if not create_question(driver, test_id):
            print("Question creation failed. Exiting.")
            return
        
        print("\nUI test completed successfully!")
        print(f"Test Title: {test_title}")
        print(f"Test ID: {test_id}")
        
    finally:
        # Close the browser
        driver.quit()

if __name__ == "__main__":
    main() 