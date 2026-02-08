🚀 AI Career Guidance & College Recommendation System










🎓 Intelligent AI Platform for Personalized Career & College Guidance
📌 Overview

AI Career Guidance & College Recommendation System is a full-stack intelligent platform that provides personalized career guidance, smart college recommendations, AI counseling, and study task management.

Built using FastAPI, React, PostgreSQL, and Google Gemini AI, the system helps students make confident academic decisions using real data and AI-powered analytics.

✨ Features
🎓 Career Guidance

Personalized AI-generated career roadmaps

Multi-stage guidance for:

School Students

Class 11–12 Students

Engineering Students

Strength and skill analysis

Domain suggestions

Success probability estimation

🏫 College Recommendation Engine

Filter colleges by percentile, location, and fees

200+ real college records with actual cutoff data

Eligibility-based filtering

AI-based college comparison

Admission chance estimation

Cost-benefit analysis

💬 AI Counseling

24/7 Gemini-powered AI Counselor

Exam guidance (JEE, MHT-CET, NEET, CUET, etc.)

Stream selection assistance

Stress management support

Career doubt clarification

📝 Smart Task Keeper

Study planner with priorities

Deadline management

Progress tracking

Daily reminders

Motivational quotes

🔐 Secure User Management

JWT-based authentication

Password hashing using bcrypt

Session management

Profile management

🛠️ Tech Stack
🔹 Backend

FastAPI – Modern Python web framework

SQLAlchemy – ORM for database operations

PostgreSQL – Primary relational database

Google Gemini API – AI recommendation engine

Python-dotenv – Environment configuration

Async I/O – High-performance asynchronous operations

🔹 Frontend

React.js – UI library

React Router – Routing

Framer Motion – Animations

Lucide React – Icon library

CSS Modules – Component styling

Recharts – Data visualization

🗂️ Project Architecture

AI-Career-Guidance-System/

BACKEND/
│
├── app/
│ ├── auth.py
│ ├── career_logic.py
│ ├── counselor.py
│ ├── database.py
│ ├── main.py
│ ├── models.py
│ ├── recommendation.py
│ ├── schemas.py
│ ├── taskkeeper.py
│ └── utils.py
│
├── college_data.csv
├── load_csv.py
├── requirements.txt
└── .env.example

REACT/
│
├── src/
│ ├── assets/
│ ├── components/
│ ├── pages/
│ │ ├── Auth.jsx
│ │ ├── Counseling.jsx
│ │ ├── counsellor-chat.jsx
│ │ ├── Guidance.jsx
│ │ ├── GuidanceResult.jsx
│ │ ├── LandingPage.jsx
│ │ └── TaskKeeper.jsx
│ │
│ ├── services/
│ │ ├── auth.js
│ │ └── guidance.js
│ │
│ ├── App.jsx
│ └── main.jsx
│
├── index.html
└── package.json

🚀 Getting Started
🔧 Prerequisites

Python 3.9+

Node.js 16+

PostgreSQL 13+

Google Gemini API Key

🔹 Backend Setup
1️⃣ Clone Repository

git clone https://github.com/yourusername/innominds.git

cd innominds/BACKEND

2️⃣ Create Virtual Environment

python -m venv venv

Activate on Windows:
venv\Scripts\activate

Activate on Mac/Linux:
source venv/bin/activate

3️⃣ Install Dependencies

pip install -r requirements.txt

4️⃣ Configure Environment Variables

Copy .env.example to .env and update:

DATABASE_URL=postgresql+asyncpg://username:password@localhost:5432/innominds_db
GEMINI_API_KEY=your_gemini_api_key_here
SECRET_KEY=your_secret_key_here

5️⃣ Create Database

CREATE DATABASE innominds_db;

6️⃣ Load College Data

python load_csv.py

7️⃣ Run Backend

uvicorn app.main:app --reload

Backend runs at:
http://localhost:8000

🔹 Frontend Setup

cd ../REACT

npm install

Create .env file and add:

VITE_API_URL=http://localhost:8000

Run:

npm run dev

Frontend runs at:
http://localhost:5173

🎯 Usage

Register or Login

Select student type for career guidance

Enter exam percentile for college predictor

Compare colleges

Chat with AI Counselor

Manage study tasks

📊 API Endpoints
Authentication

POST /auth/register
POST /auth/login

Career Guidance

POST /recommend/
POST /recommend/guidance
GET /recommend/cities
POST /recommend/compare

College Filtering

GET /recommend/colleges/filter

Parameters:

min_percentile

max_percentile

city

min_fees

max_fees

AI Counseling

POST /counselor/chat

Task Management

GET /tasks/
POST /tasks/
PUT /tasks/{id}/toggle
DELETE /tasks/{id}
GET /tasks/today
GET /tasks/upcoming/{days}

📸 Screenshots
🏠 Landing Page
<img width="100%" src="https://github.com/user-attachments/assets/a37266fb-d52f-4134-837c-f3563efbddc4" />
🏫 College Predictor
<img width="100%" src="https://github.com/user-attachments/assets/e8129d9e-d679-4d7e-811c-c8b4f7f457ed" />
🤝 Contributing

Fork the repository

Create your feature branch

Commit changes

Push to branch

Open a Pull Request
