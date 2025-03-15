# Assessment Platform

A comprehensive platform for creating, managing, and taking assessments and tests for candidates.

## Features

- **Employer Features**:
  - Create and manage assessments
  - Create and manage tests with different question types (MCQ, Essay, Coding)
  - Assign assessments to candidates
  - View candidate results and analytics

- **Candidate Features**:
  - Take assigned assessments and tests
  - View test results and feedback
  - Track progress and performance

## Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- Django (v3.2 or higher)
- PostgreSQL

## Installation

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows:
     ```
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```
     source venv/bin/activate
     ```

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Run migrations:
   ```
   python manage.py migrate
   ```

6. Create a superuser:
   ```
   python manage.py createsuperuser
   ```

7. Start the backend server:
   ```
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## Usage

### Demo Accounts

You can use the demo accounts to explore the platform:

- **Employer Demo Account**:
  - Email: demo.employer@example.com
  - Password: demopassword

- **Candidate Demo Account**:
  - Email: demo.candidate@example.com
  - Password: demopassword

### Creating a Demo User

You can create a demo candidate user by clicking the "Try Demo Account" button on the login page.

### Taking a Test

1. Log in as a candidate
2. Navigate to the dashboard
3. Find an assessment with the "Not Started" status
4. Click on "Start Assessment"
5. Follow the instructions to complete the test
6. Submit the test when finished

### Creating a Test (Employer)

1. Log in as an employer
2. Navigate to the "Tests" section
3. Click on "Create New Test"
4. Fill in the test details
5. Add questions to the test
6. Save the test

### Creating an Assessment (Employer)

1. Log in as an employer
2. Navigate to the "Assessments" section
3. Click on "Create New Assessment"
4. Fill in the assessment details
5. Add tests to the assessment
6. Assign the assessment to candidates
7. Save the assessment

## Development Status

This platform is currently in development. Some features may not be fully implemented yet.

- The test feature is not fully implemented for candidates
- The test feature is not fully implemented for employers

## Next Steps

To fully implement the test feature, the following steps are required:

1. Complete the backend API for test creation, management, and taking
2. Implement the frontend interfaces for test creation and management
3. Implement the frontend interfaces for taking tests
4. Add analytics and reporting features
5. Implement automated grading for tests

## License

This project is licensed under the MIT License - see the LICENSE file for details.