from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from .database import get_db
from .models import User
from .schemas import RegisterRequest, LoginRequest
from .utils import hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["Authentication"])

# REGISTER
@router.post("/register")
async def register_user(data: RegisterRequest, db: AsyncSession = Depends(get_db)):

    if data.password != data.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    result = await db.execute(select(User).where(User.email == data.email))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=data.name,
        email=data.email,
        phone=data.phone,
        password=hash_password(data.password)
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return {"message": "User registered successfully"}

# LOGIN
@router.post("/login")
async def login_user(data: LoginRequest, db: AsyncSession = Depends(get_db)):

    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "message": "Login successful",
        "user_id": user.id,
        "email": user.email
    }
