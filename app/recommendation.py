# recommendation.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, and_
from pydantic import BaseModel
import json
import os
from google import genai
from typing import Optional

from .database import get_db
from .models import College
from .schemas import RecommendationRequest
from .career_logic import recommend_careers, build_guidance_prompt

# ==============================
# Gemini Client (SAFE INIT)
# ==============================

GEMINI_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_KEY:
    raise RuntimeError("GEMINI_API_KEY is not set in environment variables")

client = genai.Client(api_key=GEMINI_KEY)

# ==============================
# Router
# ==============================

router = APIRouter(prefix="/recommend", tags=["Recommendation"])

# ==============================
# Pydantic Models
# ==============================

class GuidanceRequest(BaseModel):
    student_type: str
    answers: dict


# ==============================
# 1️⃣ Career + College Recommendation
# ==============================

@router.post("/")
async def recommend(
    data: RecommendationRequest,
    db: AsyncSession = Depends(get_db)
):

    careers = recommend_careers(data.exam, data.percentile)

    lower_fee = data.max_fees - 50000

    query = select(College).where(
        College.cutoff_percentile.isnot(None),  # ✅ avoid NULL issue
        College.cutoff_percentile <= data.percentile,
        College.fees >= lower_fee,
        College.fees <= data.max_fees
    )

    result = await db.execute(query)
    colleges = result.scalars().all()

    eligible_colleges = []

    for c in colleges:
        eligible_colleges.append({
            "college_name": c.college_name,
            "branch_name": c.branch_name,
            "cutoff_percentile": c.cutoff_percentile,
            "fees": c.fees,
            "status": "Eligible"
        })

    return {
        "suggested_careers": careers,
        "eligible_colleges": eligible_colleges
    }


# ==============================
# 2️⃣ AI GUIDANCE
# ==============================

@router.post("/guidance")
async def get_ai_guidance(request: GuidanceRequest):
    try:
        prompt = build_guidance_prompt(request.student_type, request.answers)

        response = client.models.generate_content(
            model="models/gemini-2.5-flash",
            contents=prompt
        )

        ai_text = response.text

        parsed_response = parse_ai_response(ai_text, request.student_type)

        return {
            "student_type": request.student_type,
            "strengths": parsed_response.get("strengths", []),
            "suggested_domains": parsed_response.get("suggested_domains", []),
            "roadmap": parsed_response.get("roadmap", ""),
            "chances": parsed_response.get("chances", "Good potential based on your profile"),
            "raw_ai_response": ai_text
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get AI guidance: {str(e)}"
        )


# ==============================
# AI RESPONSE PARSER
# ==============================

def parse_ai_response(ai_text: str, student_type: str) -> dict:

    default_responses = {
        "school": {
            "strengths": ["Analytical Thinking", "Creative Problem Solving", "Strong Foundation in Core Subjects"],
            "suggested_domains": ["STEM Fields", "Business Management", "Creative Arts", "Social Sciences"],
            "roadmap": "Focus on building strong fundamentals\nParticipate in activities\nResearch career options\nPlan strategically",
            "chances": "Good potential based on your profile"
        },
        "senior": {
            "strengths": ["Specialized Knowledge", "Goal Orientation", "Academic Discipline"],
            "suggested_domains": ["Engineering", "Medical Sciences", "Commerce & Finance", "Humanities Research"],
            "roadmap": "Excel in board exams\nPrepare for entrances\nBuild strong profile\nResearch colleges",
            "chances": "Good potential based on your profile"
        },
        "engineering": {
            "strengths": ["Technical Skills", "Project Experience", "Specialized Knowledge"],
            "suggested_domains": ["Software Development", "Data Science", "Core Engineering", "Product Management"],
            "roadmap": "Enhance skills\nBuild portfolio\nPrepare placements\nNetwork professionally",
            "chances": "Good potential based on your profile"
        }
    }

    try:
        strengths = []
        domains = []
        roadmap_lines = []
        chances = ""

        lines = ai_text.split('\n')

        for line in lines:
            line = line.strip()
            if not line:
                continue

            if any(k in line.lower() for k in ['strength', 'skill']):
                strengths.append(line.strip('-•* '))

            if any(k in line.lower() for k in ['domain', 'career', 'field']):
                domains.append(line.strip('-•* '))

            if line.startswith(('1.', '2.', '3.', '4.', '-', '•', '*')):
                roadmap_lines.append(line)

            if any(k in line.lower() for k in ['chance', 'potential']):
                chances = line

        return {
            "strengths": strengths[:3] if strengths else default_responses[student_type]["strengths"],
            "suggested_domains": domains[:4] if domains else default_responses[student_type]["suggested_domains"],
            "roadmap": "\n".join(roadmap_lines[:4]) if roadmap_lines else default_responses[student_type]["roadmap"],
            "chances": chances if chances else default_responses[student_type]["chances"]
        }

    except:
        return default_responses.get(student_type, default_responses["school"])


# ==============================
# 3️⃣ FILTER COLLEGES
# ==============================

@router.get("/colleges/filter")
async def filter_colleges(
    min_percentile: Optional[float] = 0,
    max_percentile: Optional[float] = 100,
    city: Optional[str] = None,
    min_fees: Optional[int] = None,
    max_fees: Optional[int] = None,
    db: AsyncSession = Depends(get_db)
):

    query = select(College)
    conditions = []

    if min_percentile is not None:
        conditions.append(College.cutoff_percentile.isnot(None))
        conditions.append(College.cutoff_percentile >= min_percentile)

    if max_percentile is not None:
        conditions.append(College.cutoff_percentile <= max_percentile)

    if city and city != "All Cities":
        conditions.append(College.city == city)

    if min_fees is not None:
        conditions.append(College.fees >= min_fees)

    if max_fees is not None:
        conditions.append(College.fees <= max_fees)

    if conditions:
        query = query.where(and_(*conditions))

    result = await db.execute(query)
    colleges = result.scalars().all()

    college_list = []

    for college in colleges:
        college_list.append({
            "id": college.id,
            "name": college.college_name,
            "branch": college.branch_name,
            "cutoff": college.cutoff_percentile,
            "fees": college.fees,
            "city": college.city
        })

    return {
        "count": len(college_list),
        "colleges": college_list
    }


# ==============================
# 4️⃣ GET CITIES
# ==============================

@router.get("/cities")
async def get_cities(db: AsyncSession = Depends(get_db)):

    query = select(College.city).distinct().where(College.city.isnot(None))
    result = await db.execute(query)
    cities = result.scalars().all()

    return {"cities": ["All Cities"] + [city for city in cities if city]}


# ==============================
# 5️⃣ COMPARE COLLEGES
# ==============================

class CompareRequest(BaseModel):
    college1_name: str
    college2_name: str
    student_percentile: float
    exam_type: str = "MHT-CET"
    seat_category: str = "General Open"

@router.post("/compare")
async def compare_colleges(
    compare_data: CompareRequest,
    db: AsyncSession = Depends(get_db)
):

    # Fetch first college
    query1 = select(College).where(
        College.college_name.ilike(f"%{compare_data.college1_name}%")
    )

    # Fetch second college
    query2 = select(College).where(
        College.college_name.ilike(f"%{compare_data.college2_name}%")
    )

    result1 = await db.execute(query1)
    result2 = await db.execute(query2)

    college1_data = result1.scalars().first()
    college2_data = result2.scalars().first()

    if not college1_data or not college2_data:
        raise HTTPException(
            status_code=404,
            detail="One or both colleges not found"
        )

    # Build AI prompt
    prompt = f"""
Compare these two engineering colleges for a student with {compare_data.student_percentile}%ile
in {compare_data.exam_type} ({compare_data.seat_category} category).

College 1:
- Name: {college1_data.college_name}
- Branch: {college1_data.branch_name}
- Cutoff: {college1_data.cutoff_percentile}%
- Fees: ₹{college1_data.fees}
- City: {college1_data.city}

College 2:
- Name: {college2_data.college_name}
- Branch: {college2_data.branch_name}
- Cutoff: {college2_data.cutoff_percentile}%
- Fees: ₹{college2_data.fees}
- City: {college2_data.city}

Provide:
1. Admission chances
2. Cost vs value
3. Location pros/cons
4. Branch strength
5. Final recommendation
"""

    try:
        response = client.models.generate_content(
            model="models/gemini-2.5-flash",
            contents=prompt
        )

        return {
            "college1": {
                "name": college1_data.college_name,
                "branch": college1_data.branch_name,
                "cutoff": college1_data.cutoff_percentile,
                "fees": college1_data.fees,
                "city": college1_data.city
            },
            "college2": {
                "name": college2_data.college_name,
                "branch": college2_data.branch_name,
                "cutoff": college2_data.cutoff_percentile,
                "fees": college2_data.fees,
                "city": college2_data.city
            },
            "comparison": response.text,
            "student_percentile": compare_data.student_percentile,
            "chances": {
                "college1": (
                    "High"
                    if compare_data.student_percentile >= (college1_data.cutoff_percentile or 0)
                    else "Moderate"
                    if compare_data.student_percentile >= (college1_data.cutoff_percentile or 0) - 5
                    else "Low"
                ),
                "college2": (
                    "High"
                    if compare_data.student_percentile >= (college2_data.cutoff_percentile or 0)
                    else "Moderate"
                    if compare_data.student_percentile >= (college2_data.cutoff_percentile or 0) - 5
                    else "Low"
                )
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
