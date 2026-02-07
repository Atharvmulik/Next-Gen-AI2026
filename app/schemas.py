from pydantic import BaseModel, EmailStr
from typing import Dict, Any, List
from datetime import date


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    confirm_password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr

    class Config:
        from_attributes = True

class RecommendationRequest(BaseModel):
    exam: str
    percentile: float
    max_fees: int | None = None

class GuidanceRequest(BaseModel):
    student_type: str   # school | 11-12 | engineering
    answers: Dict[str, Any]

class GuidanceResponse(BaseModel):
    roadmap: str
    chances: str
    suggested_domains: List[str]

class TaskCreate(BaseModel):
    text: str
    priority: str
    category: str
    due_date: date


class TaskResponse(BaseModel):
    id: int
    text: str
    priority: str
    category: str
    due_date: date
    completed: bool
    overdue_notified: bool

    class Config:
        orm_mode = True