from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.auth import router as auth_router
from app.database import engine, Base
from app.schemas import GuidanceRequest, GuidanceResponse
from app.recommendation import get_ai_guidance
from app.recommendation import router as recommendation_router
import os
from app.counselor import router as counselor_router
from app.taskkeeper import router as task_router

from dotenv import load_dotenv
load_dotenv()

app = FastAPI(title="INNOMINDS Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(recommendation_router)
app.include_router(counselor_router)
app.include_router(task_router)


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
async def root():
    return {"status": "Backend running 🚀"}


@app.post("/guidance/analyze", response_model=GuidanceResponse)
async def analyze_guidance(data: GuidanceRequest):
    ai_text = await get_ai_guidance(
        student_type=data.student_type,
        answers=data.answers
    )

    return {
        "roadmap": ai_text,
        "chances": "High, based on interests and academic alignment",
        "suggested_domains": [
            "AI / Technology",
            "Engineering",
            "Research",
            "Management"
        ]
    }

@app.get("/health/gemini")
async def gemini_health_check():
    """Check if Gemini API is working"""
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        return {
            "status": "error",
            "message": "GEMINI_API_KEY not set in environment variables"
        }
    
    try:
        # Try to list models
        import google.genai as genai
        client = genai.Client(api_key=api_key)
        models = client.models.list()
        
        return {
            "status": "healthy",
            "api_key_set": True,
            "available_models": [m.name for m in models],
            "total_models": len(models)
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "api_key_set": bool(api_key)
        }