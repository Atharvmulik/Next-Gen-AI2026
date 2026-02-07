from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update, delete
from datetime import date

from .database import get_db
from .models import Task
from .schemas import TaskCreate, TaskResponse


router = APIRouter(
    prefix="/tasks",
    tags=["Task Keeper"]
)

# ============================
# CREATE TASK
# ============================

@router.post("/", response_model=TaskResponse)
async def create_task(task: TaskCreate, db: AsyncSession = Depends(get_db)):

    new_task = Task(
        text=task.text,
        priority=task.priority,
        category=task.category,
        due_date=task.due_date,
        completed=False,
        overdue_notified=False
    )

    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)

    return new_task


# ============================
# GET ALL TASKS
# ============================

@router.get("/", response_model=list[TaskResponse])
async def get_tasks(db: AsyncSession = Depends(get_db)):

    result = await db.execute(select(Task))
    tasks = result.scalars().all()

    return tasks


# ============================
# TOGGLE COMPLETE
# ============================

@router.put("/{task_id}/toggle")
async def toggle_task(task_id: int, db: AsyncSession = Depends(get_db)):

    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.completed = not task.completed

    await db.commit()
    await db.refresh(task)

    return {"message": "Task updated", "completed": task.completed}


# ============================
# UPDATE OVERDUE FLAG
# ============================

@router.put("/{task_id}/overdue")
async def mark_overdue_notified(task_id: int, db: AsyncSession = Depends(get_db)):

    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.overdue_notified = True

    await db.commit()

    return {"message": "Overdue notification updated"}


# ============================
# DELETE TASK
# ============================

@router.delete("/{task_id}")
async def delete_task(task_id: int, db: AsyncSession = Depends(get_db)):

    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    await db.delete(task)
    await db.commit()

    return {"message": "Task deleted"}


