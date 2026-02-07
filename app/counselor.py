import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from google import genai

# Load environment variables
load_dotenv()

router = APIRouter(
    prefix="/counselor",
    tags=["AI Counselor"]
)

# Gemini client (same pattern as your other endpoints)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY not found in .env")

client = genai.Client(api_key=GEMINI_API_KEY)

# ---------------- SYSTEM PROMPT ----------------
SYSTEM_PROMPT = """
You are a professional AI career counselor for Indian students (Class 8 to UG).

Your responsibilities:
- Help students choose streams (Science, Commerce, Arts/Humanities)
- Guide them about entrance exams (JEE, NEET, CUET, CLAT, CAT, GATE, UPSC, etc.)
- Suggest realistic career paths and future roadmaps
- Provide skill-building advice
- Be empathetic, motivating, and practical
- Respond in clear bullet points when possible
"""

# ---------------- SCHEMAS ----------------
class CounselorRequest(BaseModel):
    message: str

class CounselorResponse(BaseModel):
    reply: str

# ---------------- ROUTE ----------------
@router.post("/chat", response_model=CounselorResponse)
async def talk_to_ai_counselor(data: CounselorRequest):
    try:
        response = client.models.generate_content(
                model="models/gemini-2.5-flash",
            contents=[
                {
                    "role": "user",
                    "parts": [
                        {
                            "text": f"{SYSTEM_PROMPT}\n\nUser: {data.message}"
                        }
                    ]
                }
            ]
        )

        return {
            "reply": response.text
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
