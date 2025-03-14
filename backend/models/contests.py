# models/contests.py
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime
import uuid

class Contest(Base):
    __tablename__ = "contests"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    platform = Column(String, nullable=False)  # codeforces, codechef, leetcode
    contest_id = Column(String, nullable=False)
    name = Column(String, nullable=False)
    url = Column(String, nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    duration = Column(Integer, nullable=False)  # in minutes
    status = Column(String, nullable=False)  # upcoming, ongoing, past
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship with bookmarks
    bookmarks = relationship("Bookmark", back_populates="contest", cascade="all, delete-orphan")

