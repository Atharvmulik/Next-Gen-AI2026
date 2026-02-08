 AI Career Guidance & College Recommendation System
<div align="center">
https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi
https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white
https://img.shields.io/badge/Google%2520Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white
https://img.shields.io/badge/SQLAlchemy-100000?style=for-the-badge&logo=sqlalchemy&logoColor=white

An intelligent platform that provides personalized career guidance and college recommendations using AI-powered analytics

</div>
📋 Table of Contents
✨ Features

🛠️ Tech Stack

📁 Project Structure

🚀 Getting Started

Prerequisites

Backend Setup

Frontend Setup

🎯 Usage

📊 API Documentation

🔧 Configuration

📸 Screenshots

🤝 Contributing

📄 License

✨ Features
🎓 Career Guidance
Personalized Roadmaps: AI-generated career paths based on student profile

Multi-Stage Guidance: Tailored for School Students, Class 11-12, and Engineering Students

Strength Analysis: Identifies key strengths and suggests suitable domains

Success Probability: Estimates chances based on academic alignment

🏫 College Recommendation
Smart Predictor: Filter colleges by percentile, location, and fees

Real Database: 200+ colleges with actual cutoff percentages

AI Comparison: Compare two colleges with detailed analysis

Eligibility Check: Automatically shows eligible colleges based on percentile

💬 AI Counseling
24/7 AI Counselor: Gemini-powered career counseling

Emotional Support: Stress management and motivation

Exam Guidance: JEE, MHT-CET, NEET, CUET, and more

Stream Selection: Science, Commerce, Arts guidance

📝 Task Management
Smart Task Keeper: Study planner with priority-based scheduling

Daily Notifications: Reminders for upcoming deadlines

Progress Tracking: Visual progress bars and completion stats

Motivational Quotes: Daily inspiration to stay on track

🔐 User Management
Secure Authentication: Password hashing with bcrypt

Profile Management: Personal details and preferences

Session Management: JWT-based authentication

🛠️ Tech Stack
Backend
FastAPI - Modern Python web framework

SQLAlchemy - ORM for database operations

PostgreSQL - Primary database

Google Gemini API - AI-powered recommendations

Python-dotenv - Environment management

Async I/O - High-performance asynchronous operations

Frontend
React.js - Frontend library

React Router - Navigation and routing

Framer Motion - Smooth animations

Lucide React - Icon library

CSS Modules - Component styling

Recharts - Data visualization

Database Models
User - Authentication and user details

College - College information with cutoffs and fees

Task - Task management with priorities and deadlines

Project Structure

├── BACKEND/
│   ├── app/
│   │   ├── auth.py              # Authentication endpoints
│   │   ├── career_logic.py      # Career recommendation logic
│   │   ├── counselor.py         # AI counseling endpoints
│   │   ├── database.py          # Database configuration
│   │   ├── main.py              # Main FastAPI app
│   │   ├── models.py            # SQLAlchemy models
│   │   ├── recommendation.py    # College recommendation engine
│   │   ├── schemas.py           # Pydantic models
│   │   ├── taskkeeper.py        # Task management API
│   │   └── utils.py             # Utility functions
│   ├── college_data.csv         # College database
│   ├── load_csv.py              # Data loader script
│   ├── requirements.txt         # Python dependencies
│   └── .env.example             # Environment template
│
    REACT/
    ├── src/
    │   ├── assets/              # Static assets
    │   ├── components/          # Reusable components
    │   ├── pages/               # Page components
    │   │   ├── Auth.jsx         # Login/Register
    │   │   ├── Counseling.jsx   # College predictor
    │   │   ├── counsellor-chat.jsx # AI chat
    │   │   ├── Guidance.jsx     # Career guidance
    │   │   ├── GuidanceResult.jsx # Results page
    │   │   ├── LandingPage.jsx  # Home page
    │   │   └── TaskKeeper.jsx   # Task manager
    │   ├── services/
    │   │      ├── guidance.js
    │   │      ├──auth.js
    │   ├── App.jsx              # Main app component
    │   └── main.jsx             # Entry point
    ├── index.html               # HTML template
    └── package.json             # Frontend dependencies

Getting Started

Prerequisites
Python 3.9+

Node.js 16+

PostgreSQL 13+

Google Gemini API key


Backend Setup
Clone the repository

bash
git clone https://github.com/yourusername/innominds.git
cd innominds/BACKEND

Create virtual environment
bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

Install dependencies
bash
pip install -r requirements.txt

Configure environment variables
bash
cp .env.example .env

env
DATABASE_URL=postgresql+asyncpg://username:password@localhost:5432/innominds_db
GEMINI_API_KEY=your_gemini_api_key_here
SECRET_KEY=your_secret_key_here

Set up PostgreSQL database
sql

CREATE DATABASE innominds_db;
Load college data

bash
python load_csv.py
Run the backend server

bash
uvicorn app.main:app --reload


Frontend Setup

Navigate to frontend directory

bash
cd ../REACT
Install dependencies

bash
npm install
Configure environment

Create .env file:

env
VITE_API_URL=http://localhost:8000

Run the development server
bash
npm run dev


🎯 Usage
1. Registration & Login
Create an account with email, name, and password

Secure authentication with password hashing

2. Career Guidance
Select your student type (School/Class 11-12/Engineering)

Answer personalized questions

Receive AI-generated career roadmap

Get strength analysis and domain suggestions

3. College Predictor
Enter your exam percentile (MHT-CET/JEE)

Filter colleges by location and budget

View eligible colleges with cutoffs

Get detailed college information

4. Smart Compare
Compare two colleges side-by-side

AI analysis of pros and cons

Admission chance estimation

Cost-benefit analysis

5. AI Counselor
24/7 chat-based counseling

Career doubts clarification

Stress management advice

Exam preparation tips

6. Task Keeper
Create study tasks with priorities

Set deadlines and categories

Receive notification reminders

Track completion progress

📊 API Documentation
Authentication Endpoints
POST /auth/register - User registration

POST /auth/login - User login

Career Guidance Endpoints
POST /recommend/ - Get career recommendations

POST /recommend/guidance - Get AI career guidance

GET /recommend/cities - Get available cities

POST /recommend/compare - Compare two colleges

College Filtering
GET /recommend/colleges/filter - Filter colleges with parameters:

min_percentile - Minimum cutoff percentile

max_percentile - Maximum cutoff percentile

city - City filter

min_fees - Minimum annual fees

max_fees - Maximum annual fees

AI Counseling
POST /counselor/chat - Chat with AI counselor

Task Management
GET /tasks/ - Get all tasks

POST /tasks/ - Create new task

PUT /tasks/{id}/toggle - Toggle task completion

DELETE /tasks/{id} - Delete task

GET /tasks/today - Get today's tasks

GET /tasks/upcoming/{days} - Get upcoming tasks

📸 Screenshots

Landing Page - Modern hero section with animated stats
<img width="1881" height="913" alt="image" src="https://github.com/user-attachments/assets/a37266fb-d52f-4134-837c-f3563efbddc4" />

College Predictor - Filter panel with real-time results
<img width="1885" height="910" alt="image" src="https://github.com/user-attachments/assets/e8129d9e-d679-4d7e-811c-c8b4f7f457ed" />

