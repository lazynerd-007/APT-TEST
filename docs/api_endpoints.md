# BLUAPT API Endpoints

## Overview

BLUAPT exposes a RESTful API that follows standard HTTP methods and status codes. All endpoints return JSON responses and require authentication via JWT tokens (except for authentication endpoints).

## Base URL

```
https://api.bluapt.com/v1
```

## Authentication

### Register a new user

```
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "first_name": "John",
  "last_name": "Doe",
  "role": "candidate" // or "employer"
}
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "candidate",
  "created_at": "2023-01-01T00:00:00Z"
}
```

### Login

```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

### Refresh Token

```
POST /auth/refresh
```

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

## User Management

### Get Current User

```
GET /users/me
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "candidate",
  "profile": {
    // Role-specific profile data
  }
}
```

### Update User Profile

```
PUT /users/me/profile
```

**Request Body (Candidate):**
```json
{
  "resume_url": "https://storage.bluapt.com/resumes/user123.pdf",
  "skills": ["Python", "JavaScript", "SQL"],
  "experience_years": 5,
  "education": {
    "degree": "Bachelor of Science",
    "field": "Computer Science",
    "institution": "University of Technology",
    "year": 2018
  }
}
```

**Response:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "resume_url": "https://storage.bluapt.com/resumes/user123.pdf",
  "skills": ["Python", "JavaScript", "SQL"],
  "experience_years": 5,
  "education": {
    "degree": "Bachelor of Science",
    "field": "Computer Science",
    "institution": "University of Technology",
    "year": 2018
  },
  "updated_at": "2023-01-01T00:00:00Z"
}
```

## Organizations

### Create Organization (Admin only)

```
POST /organizations
```

**Request Body:**
```json
{
  "name": "Acme Corporation",
  "description": "Leading technology company"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Acme Corporation",
  "description": "Leading technology company",
  "created_at": "2023-01-01T00:00:00Z"
}
```

### Get Organizations (Admin only)

```
GET /organizations
```

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Acme Corporation",
      "description": "Leading technology company",
      "created_at": "2023-01-01T00:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "size": 10
}
```

## Test Library

### Create Test

```
POST /tests
```

**Request Body:**
```json
{
  "title": "Python Backend Developer Assessment",
  "description": "Comprehensive test for backend Python developers",
  "category": "coding",
  "difficulty": "intermediate",
  "is_public": true,
  "questions": [
    {
      "content": "Write a function that returns the nth Fibonacci number",
      "type": "coding",
      "difficulty": "medium",
      "points": 10,
      "test_cases": [
        {
          "input": "5",
          "expected_output": "5",
          "is_hidden": false
        },
        {
          "input": "10",
          "expected_output": "55",
          "is_hidden": true
        }
      ]
    },
    {
      "content": "What is the time complexity of quicksort?",
      "type": "mcq",
      "difficulty": "easy",
      "points": 5,
      "answers": [
        {
          "content": "O(n)",
          "is_correct": false,
          "explanation": "Quicksort's average case is O(n log n)"
        },
        {
          "content": "O(n log n)",
          "is_correct": true,
          "explanation": "Quicksort's average case is O(n log n)"
        },
        {
          "content": "O(n²)",
          "is_correct": false,
          "explanation": "This is the worst case, not the average case"
        }
      ]
    }
  ]
}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Python Backend Developer Assessment",
  "description": "Comprehensive test for backend Python developers",
  "creator_id": "uuid",
  "category": "coding",
  "difficulty": "intermediate",
  "is_public": true,
  "question_count": 2,
  "created_at": "2023-01-01T00:00:00Z"
}
```

### Get Tests

```
GET /tests
```

**Query Parameters:**
- `category` - Filter by category
- `difficulty` - Filter by difficulty
- `creator_id` - Filter by creator
- `page` - Page number (default: 1)
- `size` - Page size (default: 10)

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "title": "Python Backend Developer Assessment",
      "description": "Comprehensive test for backend Python developers",
      "creator_id": "uuid",
      "category": "coding",
      "difficulty": "intermediate",
      "is_public": true,
      "question_count": 2,
      "created_at": "2023-01-01T00:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "size": 10
}
```

### Get Test Details

```
GET /tests/{test_id}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Python Backend Developer Assessment",
  "description": "Comprehensive test for backend Python developers",
  "creator_id": "uuid",
  "category": "coding",
  "difficulty": "intermediate",
  "is_public": true,
  "questions": [
    {
      "id": "uuid",
      "content": "Write a function that returns the nth Fibonacci number",
      "type": "coding",
      "difficulty": "medium",
      "points": 10,
      "test_cases": [
        {
          "id": "uuid",
          "input": "5",
          "expected_output": "5",
          "is_hidden": false
        }
      ]
    },
    {
      "id": "uuid",
      "content": "What is the time complexity of quicksort?",
      "type": "mcq",
      "difficulty": "easy",
      "points": 5,
      "answers": [
        {
          "id": "uuid",
          "content": "O(n)",
          "is_correct": false
        },
        {
          "id": "uuid",
          "content": "O(n log n)",
          "is_correct": true
        },
        {
          "id": "uuid",
          "content": "O(n²)",
          "is_correct": false
        }
      ]
    }
  ],
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

## Assessments

### Create Assessment

```
POST /assessments
```

**Request Body:**
```json
{
  "title": "Senior Python Developer - 2023 Q2",
  "description": "Comprehensive assessment for senior Python developer position",
  "time_limit": 120,
  "passing_score": 70,
  "is_active": true,
  "tests": [
    {
      "test_id": "uuid",
      "weight": 0.6,
      "order": 1
    },
    {
      "test_id": "uuid",
      "weight": 0.4,
      "order": 2
    }
  ]
}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Senior Python Developer - 2023 Q2",
  "description": "Comprehensive assessment for senior Python developer position",
  "creator_id": "uuid",
  "time_limit": 120,
  "passing_score": 70,
  "is_active": true,
  "test_count": 2,
  "created_at": "2023-01-01T00:00:00Z"
}
```

### Get Assessments

```
GET /assessments
```

**Query Parameters:**
- `creator_id` - Filter by creator
- `is_active` - Filter by active status
- `page` - Page number (default: 1)
- `size` - Page size (default: 10)

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "title": "Senior Python Developer - 2023 Q2",
      "description": "Comprehensive assessment for senior Python developer position",
      "creator_id": "uuid",
      "time_limit": 120,
      "passing_score": 70,
      "is_active": true,
      "test_count": 2,
      "created_at": "2023-01-01T00:00:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "size": 10
}
```

### Get Assessment Details

```
GET /assessments/{assessment_id}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "Senior Python Developer - 2023 Q2",
  "description": "Comprehensive assessment for senior Python developer position",
  "creator_id": "uuid",
  "time_limit": 120,
  "passing_score": 70,
  "is_active": true,
  "tests": [
    {
      "id": "uuid",
      "test_id": "uuid",
      "title": "Python Backend Developer Assessment",
      "weight": 0.6,
      "order": 1
    },
    {
      "id": "uuid",
      "test_id": "uuid",
      "title": "System Design Knowledge Test",
      "weight": 0.4,
      "order": 2
    }
  ],
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

## Candidate Test Taking

### Start Assessment

```
POST /candidate/assessments/{assessment_id}/start
```

**Response:**
```json
{
  "id": "uuid",
  "assessment_id": "uuid",
  "candidate_id": "uuid",
  "start_time": "2023-01-01T00:00:00Z",
  "end_time": null,
  "time_limit": 120,
  "status": "in_progress",
  "current_test_index": 0
}
```

### Get Current Test

```
GET /candidate/tests/current
```

**Response:**
```json
{
  "candidate_test_id": "uuid",
  "test": {
    "id": "uuid",
    "title": "Python Backend Developer Assessment",
    "description": "Comprehensive test for backend Python developers",
    "category": "coding",
    "questions": [
      {
        "id": "uuid",
        "content": "Write a function that returns the nth Fibonacci number",
        "type": "coding",
        "difficulty": "medium",
        "points": 10,
        "test_cases": [
          {
            "id": "uuid",
            "input": "5",
            "expected_output": "5",
            "is_hidden": false
          }
        ]
      }
    ]
  },
  "time_remaining": 7200
}
```

### Submit Answer

```
POST /candidate/tests/current/questions/{question_id}/answer
```

**Request Body (Coding Question):**
```json
{
  "code_content": "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)",
  "language": "python"
}
```

**Response:**
```json
{
  "id": "uuid",
  "question_id": "uuid",
  "submission_time": "2023-01-01T00:10:00Z",
  "execution_results": {
    "passed_test_cases": 1,
    "total_test_cases": 2,
    "execution_time": 0.05,
    "memory_usage": 1024,
    "output": "Test case 1: Passed\nTest case 2: Failed - Time limit exceeded"
  }
}
```

### Complete Test

```
POST /candidate/tests/current/complete
```

**Response:**
```json
{
  "id": "uuid",
  "assessment_id": "uuid",
  "candidate_id": "uuid",
  "start_time": "2023-01-01T00:00:00Z",
  "end_time": "2023-01-01T01:30:00Z",
  "status": "completed",
  "score": 75.5,
  "passed": true
}
```

## Results and Analytics

### Get Candidate Results (Employer)

```
GET /employer/candidates/{candidate_id}/results
```

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "assessment_id": "uuid",
      "assessment_title": "Senior Python Developer - 2023 Q2",
      "candidate_id": "uuid",
      "candidate_name": "John Doe",
      "start_time": "2023-01-01T00:00:00Z",
      "end_time": "2023-01-01T01:30:00Z",
      "score": 75.5,
      "passed": true,
      "completion_time": 90,
      "strengths": ["Algorithm Design", "Problem Solving"],
      "weaknesses": ["System Design"]
    }
  ],
  "total": 1,
  "page": 1,
  "size": 10
}
```

### Get Assessment Analytics (Employer)

```
GET /employer/assessments/{assessment_id}/analytics
```

**Response:**
```json
{
  "assessment_id": "uuid",
  "assessment_title": "Senior Python Developer - 2023 Q2",
  "total_candidates": 50,
  "completion_rate": 0.92,
  "pass_rate": 0.68,
  "average_score": 72.3,
  "average_completion_time": 95,
  "score_distribution": {
    "0-10": 0,
    "11-20": 1,
    "21-30": 2,
    "31-40": 3,
    "41-50": 5,
    "51-60": 8,
    "61-70": 12,
    "71-80": 10,
    "81-90": 7,
    "91-100": 2
  },
  "question_analytics": [
    {
      "question_id": "uuid",
      "content": "Write a function that returns the nth Fibonacci number",
      "average_score": 7.2,
      "success_rate": 0.72,
      "average_time": 15
    }
  ]
}
```

### Compare Candidates (Employer)

```
POST /employer/candidates/compare
```

**Request Body:**
```json
{
  "candidate_ids": ["uuid1", "uuid2", "uuid3"],
  "assessment_id": "uuid"
}
```

**Response:**
```json
{
  "assessment_id": "uuid",
  "assessment_title": "Senior Python Developer - 2023 Q2",
  "candidates": [
    {
      "id": "uuid1",
      "name": "John Doe",
      "score": 85.5,
      "completion_time": 85,
      "strengths": ["Algorithm Design", "Problem Solving"],
      "weaknesses": ["System Design"],
      "skill_scores": {
        "Python": 90,
        "Algorithms": 85,
        "System Design": 70
      }
    },
    {
      "id": "uuid2",
      "name": "Jane Smith",
      "score": 78.2,
      "completion_time": 95,
      "strengths": ["System Design", "Database Knowledge"],
      "weaknesses": ["Algorithm Optimization"],
      "skill_scores": {
        "Python": 75,
        "Algorithms": 65,
        "System Design": 90
      }
    },
    {
      "id": "uuid3",
      "name": "Bob Johnson",
      "score": 92.1,
      "completion_time": 110,
      "strengths": ["Algorithm Design", "System Design"],
      "weaknesses": [],
      "skill_scores": {
        "Python": 95,
        "Algorithms": 90,
        "System Design": 85
      }
    }
  ],
  "recommendation": "uuid3" // ID of the highest scoring candidate
}
```

## Code Execution

### Execute Code (Sandbox)

```
POST /execution/run
```

**Request Body:**
```json
{
  "code": "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)\n\nprint(fibonacci(10))",
  "language": "python",
  "timeout": 5
}
```

**Response:**
```json
{
  "execution_id": "uuid",
  "status": "completed",
  "stdout": "55\n",
  "stderr": "",
  "execution_time": 0.05,
  "memory_usage": 1024
}
```

### Check Plagiarism

```
POST /execution/check-plagiarism
```

**Request Body:**
```json
{
  "code": "def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)",
  "language": "python",
  "question_id": "uuid"
}
```

**Response:**
```json
{
  "plagiarism_score": 0.85,
  "similar_submissions": [
    {
      "candidate_id": "uuid",
      "similarity_score": 0.95,
      "matching_lines": [1, 2, 3, 4]
    }
  ],
  "external_sources": [
    {
      "url": "https://stackoverflow.com/questions/12345/fibonacci-algorithm",
      "similarity_score": 0.75,
      "matching_lines": [1, 3, 4]
    }
  ]
}
```

## Error Responses

All API endpoints follow a consistent error response format:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested resource was not found",
    "details": {
      "resource_type": "Assessment",
      "resource_id": "invalid-uuid"
    }
  }
}
```

Common HTTP status codes:
- 200 OK - Request succeeded
- 201 Created - Resource created successfully
- 400 Bad Request - Invalid request parameters
- 401 Unauthorized - Missing or invalid authentication
- 403 Forbidden - Insufficient permissions
- 404 Not Found - Resource not found
- 422 Unprocessable Entity - Validation error
- 429 Too Many Requests - Rate limit exceeded
- 500 Internal Server Error - Server error 