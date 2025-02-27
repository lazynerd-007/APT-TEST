# BLUAPT System Architecture

## Overview

BLUAPT follows a microservices architecture to ensure scalability, maintainability, and separation of concerns. The system is divided into several key services that communicate via REST APIs and message queues.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           BLUAPT Platform                                │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           API Gateway / Load Balancer                    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                 ┌─────────────────┼─────────────────┐
                 │                 │                 │
                 ▼                 ▼                 ▼
┌───────────────────────┐ ┌───────────────────┐ ┌───────────────────┐
│   User Service        │ │ Assessment Service │ │ Execution Service │
│ ┌─────────────────┐  │ │ ┌───────────────┐  │ │ ┌───────────────┐ │
│ │ Authentication  │  │ │ │ Test Creation │  │ │ │ Code Runner   │ │
│ └─────────────────┘  │ │ └───────────────┘  │ │ └───────────────┘ │
│ ┌─────────────────┐  │ │ ┌───────────────┐  │ │ ┌───────────────┐ │
│ │ User Profiles   │  │ │ │ Test Delivery │  │ │ │ Sandboxing    │ │
│ └─────────────────┘  │ │ └───────────────┘  │ │ └───────────────┘ │
│ ┌─────────────────┐  │ │ ┌───────────────┐  │ │ ┌───────────────┐ │
│ │ Role Management │  │ │ │ Scoring       │  │ │ │ Plagiarism    │ │
│ └─────────────────┘  │ │ └───────────────┘  │ │ │ Detection     │ │
└───────────────────────┘ └───────────────────┘ │ └───────────────┘ │
                                                └───────────────────┘
                                                          │
                                                          ▼
┌───────────────────────┐                      ┌───────────────────┐
│  Analytics Service    │◄─────────────────────│ Message Queue     │
│ ┌─────────────────┐  │                      │ (Celery/Redis)    │
│ │ Data Processing │  │                      └───────────────────┘
│ └─────────────────┘  │                                │
│ ┌─────────────────┐  │                                │
│ │ Visualization   │  │                                │
│ └─────────────────┘  │                                │
│ ┌─────────────────┐  │                                │
│ │ Reporting       │  │                                │
│ └─────────────────┘  │                                │
└───────────────────────┘                                │
          ▲                                             │
          │                                             │
          └─────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           PostgreSQL Database Cluster                    │
└─────────────────────────────────────────────────────────────────────────┘
                                │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
┌───────────────────────┐         ┌───────────────────────┐
│  Next.js Frontend     │         │  Admin Dashboard      │
│  (Candidate Portal)   │         │  (Employer Interface) │
└───────────────────────┘         └───────────────────────┘
```

## Service Descriptions

### 1. User Service
- Handles authentication and authorization using JWT/OAuth2
- Manages user profiles for both candidates and employers
- Implements role-based access control
- Stores user data in PostgreSQL

### 2. Assessment Service
- Manages the creation and configuration of tests
- Delivers assessments to candidates
- Processes test submissions
- Implements basic scoring algorithms
- Stores test configurations and results

### 3. Execution Service
- Executes code submissions in isolated Docker containers
- Implements sandboxing for secure code execution
- Detects plagiarism in code submissions
- Communicates results back to the Assessment Service

### 4. Analytics Service
- Processes assessment data for insights
- Generates visualizations and reports
- Implements candidate comparison algorithms
- Provides bias detection and mitigation

## Data Flow

1. Candidates and employers authenticate through the User Service
2. Employers create assessments via the Assessment Service
3. Candidates take tests delivered by the Assessment Service
4. Code submissions are processed by the Execution Service
5. Results are stored in PostgreSQL and processed by the Analytics Service
6. Insights are displayed on the appropriate frontend interfaces

## Scalability Considerations

- Horizontal scaling of services based on load
- Database sharding for large-scale deployments
- Caching layer for frequently accessed data
- Asynchronous processing for compute-intensive tasks
- CDN integration for static assets 