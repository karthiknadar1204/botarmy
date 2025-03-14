from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime
import uuid

class Reminder(Base):
    __tablename__ = "reminders"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    contest_id = Column(String, ForeignKey("contests.id"), nullable=False)
    user_id = Column(String, nullable=False)  # Clerk user ID
    reminder_minutes = Column(Integer, nullable=False)  # Minutes before contest to send reminder
    custom_email = Column(String, nullable=True)  # Optional custom email
    first_name = Column(String, nullable=True)  # User's first name
    is_sent = Column(Integer, default=0)  # 0: not sent, 1: sent
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship with contest
    contest = relationship("Contest")
    
    # Composite unique constraint
    __table_args__ = (
        # UniqueConstraint('user_id', 'contest_id', name='unique_user_contest_reminder'),
    ) 