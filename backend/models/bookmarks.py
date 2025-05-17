# models/bookmarks.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

datetime
import uuid

class Bookmark(Base):
    __tablename__ = "bookmarks"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    contest_id = Column(String, ForeignKey("contests.id"), nullable=False)
    user_id = Column(String, nullable=False)  # Clerk user ID
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship with contest
    contest = relationship("Contest", back_populates="bookmarks")
    
    # Composite unique constraint
    __table_args__ = (
        # UniqueConstraint('user_id', 'contest_id', name='unique_user_contest_bookmark'),
    )
