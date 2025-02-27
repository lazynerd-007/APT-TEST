# BLUAPT - Skills-Based Hiring Platform

BLUAPT is an in-house hiring platform focused on skills-based assessments, designed to objectively evaluate candidates through coding tests, aptitude assessments, and situational judgment scenarios.

## System Architecture

BLUAPT follows a modern microservices architecture with:

- **Backend**: Python-based API services using Django REST Framework
- **Frontend**: Next.js application with responsive design
- **Database**: PostgreSQL for structured data storage
- **Authentication**: JWT/OAuth2 for secure role-based access

## Core Components

### Backend Services

1. **Assessment Service**: Manages test creation, configuration, and delivery
2. **Execution Service**: Handles code execution in sandboxed environments
3. **Analytics Service**: Processes assessment results and generates insights
4. **User Service**: Manages authentication, profiles, and role-based access

### Frontend Applications

1. **Candidate Portal**: Interface for taking assessments with real-time features
2. **Admin Dashboard**: Comprehensive tools for employers to manage the hiring process
3. **Analytics Dashboard**: Visual representation of candidate performance and comparisons

## Key Features

- **Test Library**: Pre-built assessments with configurable parameters
- **Custom Assessment Builder**: Modular system to create role-specific evaluations
- **Real-time Proctoring**: Browser monitoring and anti-cheating measures
- **Objective Scoring**: Automated evaluation with bias mitigation strategies
- **Comprehensive Analytics**: Data-driven insights for hiring decisions

## Technology Stack

### Backend
- Django/Django REST Framework
- Celery for asynchronous task processing
- PostgreSQL for data storage
- Redis for caching and real-time features
- Docker for containerization

### Frontend
- Next.js with TypeScript
- React Query for data fetching
- Chart.js/D3.js for data visualization
- TailwindCSS for styling

## Getting Started

Detailed setup instructions coming soon.

## License

See the [LICENSE](LICENSE) file for details.