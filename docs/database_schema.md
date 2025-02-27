# BLUAPT Database Schema

## Overview

BLUAPT uses PostgreSQL as its primary database. The schema is designed to support the core functionality of the platform, including user management, assessment creation, test delivery, and analytics.

## Entity Relationship Diagram

```
┌───────────────────┐       ┌───────────────────┐       ┌───────────────────┐
│      Users        │       │      Roles        │       │   Organizations   │
├───────────────────┤       ├───────────────────┤       ├───────────────────┤
│ id (PK)           │       │ id (PK)           │       │ id (PK)           │
│ email             │◄──┐   │ name              │       │ name              │
│ password_hash     │   └───│ permissions       │       │ description       │
│ first_name        │       └───────────────────┘       │ created_at        │
│ last_name         │                 ▲                 │ updated_at        │
│ role_id (FK)      │─────────────────┘                 └───────────────────┘
│ organization_id(FK)│───────────────────────────────────┘         ▲
│ created_at        │                                              │
│ updated_at        │                                              │
└───────────────────┘                                              │
         │                                                         │
         │                                                         │
         ▼                                                         │
┌───────────────────┐       ┌───────────────────┐                 │
│  CandidateProfiles│       │ EmployerProfiles  │                 │
├───────────────────┤       ├───────────────────┤                 │
│ id (PK)           │       │ id (PK)           │                 │
│ user_id (FK)      │───┐   │ user_id (FK)      │───┐             │
│ resume_url        │   │   │ job_title         │   │             │
│ skills            │   │   │ department        │   │             │
│ experience_years  │   │   │ organization_id(FK)│───┼─────────────┘
│ education         │   │   │ created_at        │   │
│ created_at        │   │   │ updated_at        │   │
│ updated_at        │   │   └───────────────────┘   │
└───────────────────┘   │                           │
         │              └───────────────┐           │
         │                              │           │
         ▼                              ▼           │
┌───────────────────┐       ┌───────────────────┐   │
│   Assessments     │       │  TestLibrary      │   │
├───────────────────┤       ├───────────────────┤   │
│ id (PK)           │       │ id (PK)           │   │
│ title             │       │ title             │   │
│ description       │       │ description       │   │
│ creator_id (FK)   │───────│ creator_id (FK)   │───┘
│ time_limit        │       │ category          │
│ passing_score     │       │ difficulty        │
│ is_active         │       │ is_public         │
│ created_at        │       │ created_at        │
│ updated_at        │       │ updated_at        │
└───────────────────┘       └───────────────────┘
         │                            │
         │                            │
         ▼                            ▼
┌───────────────────┐       ┌───────────────────┐
│  AssessmentTests  │       │    Questions      │
├───────────────────┤       ├───────────────────┤
│ id (PK)           │       │ id (PK)           │
│ assessment_id (FK)│───┐   │ test_id (FK)      │
│ test_id (FK)      │───┼───│ content           │
│ weight            │   │   │ type              │
│ order             │   │   │ difficulty        │
│ created_at        │   │   │ points            │
│ updated_at        │   │   │ created_at        │
└───────────────────┘   │   │ updated_at        │
                        │   └───────────────────┘
                        │             │
                        │             │
                        ▼             ▼
┌───────────────────┐       ┌───────────────────┐
│  CandidateTests   │       │     Answers       │
├───────────────────┤       ├───────────────────┤
│ id (PK)           │       │ id (PK)           │
│ candidate_id (FK) │───┐   │ question_id (FK)  │
│ assessment_id (FK)│───┼───│ content           │
│ start_time        │   │   │ is_correct        │
│ end_time          │   │   │ explanation       │
│ score             │   │   │ created_at        │
│ status            │   │   │ updated_at        │
│ created_at        │   │   └───────────────────┘
│ updated_at        │   │
└───────────────────┘   │
         │              │
         │              │
         ▼              │
┌───────────────────┐   │
│  CandidateAnswers │   │
├───────────────────┤   │
│ id (PK)           │   │
│ candidate_test_id │───┘
│ question_id (FK)  │
│ answer_content    │
│ score             │
│ feedback          │
│ created_at        │
│ updated_at        │
└───────────────────┘
         │
         │
         ▼
┌───────────────────┐
│  CodeSubmissions  │
├───────────────────┤
│ id (PK)           │
│ candidate_answer_id│
│ language          │
│ code_content      │
│ execution_time    │
│ memory_usage      │
│ passed_test_cases │
│ total_test_cases  │
│ plagiarism_score  │
│ created_at        │
│ updated_at        │
└───────────────────┘
```

## Table Descriptions

### Users
Stores authentication and basic user information for all system users.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | VARCHAR(255) | Unique email for login |
| password_hash | VARCHAR(255) | Hashed password |
| first_name | VARCHAR(100) | User's first name |
| last_name | VARCHAR(100) | User's last name |
| role_id | UUID | Foreign key to Roles table |
| organization_id | UUID | Foreign key to Organizations table |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Record update time |

### Roles
Defines user roles and permissions within the system.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(50) | Role name (e.g., Admin, Employer, Candidate) |
| permissions | JSONB | JSON array of permission strings |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Record update time |

### Organizations
Represents companies or institutions using the platform.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Organization name |
| description | TEXT | Organization description |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Record update time |

### CandidateProfiles
Extended profile information for candidates.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to Users table |
| resume_url | VARCHAR(255) | URL to stored resume |
| skills | JSONB | JSON array of skills |
| experience_years | INTEGER | Years of experience |
| education | JSONB | JSON object with education details |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Record update time |

### EmployerProfiles
Extended profile information for employers.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to Users table |
| job_title | VARCHAR(100) | Employer's job title |
| department | VARCHAR(100) | Department within organization |
| organization_id | UUID | Foreign key to Organizations table |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Record update time |

### TestLibrary
Repository of reusable tests.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | VARCHAR(255) | Test title |
| description | TEXT | Test description |
| creator_id | UUID | Foreign key to Users table |
| category | VARCHAR(50) | Test category (e.g., Coding, Aptitude) |
| difficulty | VARCHAR(20) | Difficulty level |
| is_public | BOOLEAN | Whether test is available to all organizations |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Record update time |

### Assessments
Configured assessment instances for specific hiring needs.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | VARCHAR(255) | Assessment title |
| description | TEXT | Assessment description |
| creator_id | UUID | Foreign key to Users table |
| time_limit | INTEGER | Time limit in minutes |
| passing_score | DECIMAL | Minimum score to pass |
| is_active | BOOLEAN | Whether assessment is active |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Record update time |

### AssessmentTests
Junction table linking assessments to tests from the library.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| assessment_id | UUID | Foreign key to Assessments table |
| test_id | UUID | Foreign key to TestLibrary table |
| weight | DECIMAL | Weight of this test in the assessment |
| order | INTEGER | Order of test in the assessment |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Record update time |

### Questions
Individual questions within tests.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| test_id | UUID | Foreign key to TestLibrary table |
| content | TEXT | Question content |
| type | VARCHAR(50) | Question type (e.g., MCQ, Coding, Essay) |
| difficulty | VARCHAR(20) | Question difficulty |
| points | INTEGER | Points for correct answer |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Record update time |

### Answers
Predefined answers for questions (for MCQs).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| question_id | UUID | Foreign key to Questions table |
| content | TEXT | Answer content |
| is_correct | BOOLEAN | Whether this is the correct answer |
| explanation | TEXT | Explanation for this answer |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Record update time |

### CandidateTests
Records of assessments taken by candidates.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| candidate_id | UUID | Foreign key to Users table |
| assessment_id | UUID | Foreign key to Assessments table |
| start_time | TIMESTAMP | When candidate started the test |
| end_time | TIMESTAMP | When candidate completed the test |
| score | DECIMAL | Overall score |
| status | VARCHAR(20) | Status (e.g., In Progress, Completed, Expired) |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Record update time |

### CandidateAnswers
Individual answers submitted by candidates.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| candidate_test_id | UUID | Foreign key to CandidateTests table |
| question_id | UUID | Foreign key to Questions table |
| answer_content | TEXT | Candidate's answer |
| score | DECIMAL | Score for this answer |
| feedback | TEXT | Automated or manual feedback |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Record update time |

### CodeSubmissions
Detailed information about code submissions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| candidate_answer_id | UUID | Foreign key to CandidateAnswers table |
| language | VARCHAR(50) | Programming language |
| code_content | TEXT | Submitted code |
| execution_time | DECIMAL | Time taken to execute (ms) |
| memory_usage | INTEGER | Memory used (KB) |
| passed_test_cases | INTEGER | Number of test cases passed |
| total_test_cases | INTEGER | Total number of test cases |
| plagiarism_score | DECIMAL | Similarity score (0-100) |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Record update time |

## Indexes

- Users: email (UNIQUE)
- CandidateTests: candidate_id, assessment_id
- CandidateAnswers: candidate_test_id, question_id
- Questions: test_id
- AssessmentTests: assessment_id, test_id

## Constraints

- Foreign key constraints on all relationships
- Check constraints on score ranges (0-100)
- Check constraints on status values 