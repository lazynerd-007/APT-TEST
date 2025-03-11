# Assessment Platform Tool

A comprehensive platform for creating, managing, and conducting technical assessments for candidates.

## Features

### Test Management
- Create and manage tests with different categories and difficulty levels
- Add, edit, and reorder questions within tests
- Support for multiple question types: Multiple Choice, Coding, Essay, and File Upload
- Bulk import and export of questions using CSV
- Preview tests as they will appear to candidates

### Assessment Management
- Create assessments by combining multiple tests
- Assign assessments to candidates
- Track candidate progress and results

### Candidate Experience
- User-friendly interface for taking tests
- Support for different question types
- Automatic scoring for objective questions

## Technology Stack

### Frontend
- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend
- Django
- Django REST Framework
- SQLite (development) / PostgreSQL (production)

## Getting Started

### Prerequisites
- Node.js (v14+)
- Python (v3.8+)
- pip

### Installation

#### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Run migrations:
   ```
   python manage.py migrate
   ```

6. Start the development server:
   ```
   python manage.py runserver
   ```

#### Frontend Setup
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

4. Open your browser and navigate to `http://localhost:3000`

## Usage

### Creating a Test
1. Navigate to the Tests page
2. Click "Create Test"
3. Fill in the test details and save
4. Add questions to the test

### Importing Questions
1. Navigate to a test's details page
2. Click "Import Questions"
3. Download the CSV template if needed
4. Prepare your CSV file with questions
5. Upload the CSV file

### Exporting Questions
1. Navigate to a test's details page
2. Click "Export Questions"
3. The CSV file will be downloaded automatically

### Previewing a Test
1. Navigate to a test's details page
2. Click "Preview Test"
3. Navigate through the questions to see how they will appear to candidates

## License
This project is licensed under the MIT License - see the LICENSE file for details.