from sqlalchemy import Column, Integer, String, Float,Boolean,Date
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=False)
    password = Column(String, nullable=False)

class College(Base):
    __tablename__ = "colleges"

    id = Column(Integer, primary_key=True, index=True)
    college_name = Column(String, nullable=False)
    branch_name = Column(String, nullable=False)
    cutoff_percentile = Column(Float, nullable=True)
    fees = Column(Integer, nullable=False)
    city = Column(String, nullable=True)  # Add this field



class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, nullable=False)
    priority = Column(String, default="Medium")
    category = Column(String, default="Study")
    due_date = Column(Date, nullable=False)
    completed = Column(Boolean, default=False)
    overdue_notified = Column(Boolean, default=False)