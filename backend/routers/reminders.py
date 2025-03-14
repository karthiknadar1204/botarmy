from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from models.database import get_db
from models.contests import Contest
from models.reminders import Reminder
from models.users import User
from sqlalchemy import and_
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta

router = APIRouter(prefix="/reminders", tags=["reminders"])

class ReminderCreate(BaseModel):
    contest_id: str
    reminder_minutes: int
    custom_email: Optional[EmailStr] = None
    first_name: Optional[str] = None

class ReminderResponse(BaseModel):
    id: str
    contest_id: str
    reminder_minutes: int
    custom_email: Optional[str] = None
    is_sent: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

@router.get("/")
async def get_user_reminders(
    db: Session = Depends(get_db),
    user_id: str = Header(..., description="Clerk user ID")
):
    """
    Get all reminders for a user
    """
    reminders = db.query(Reminder).filter(
        Reminder.user_id == user_id
    ).all()
    
    return reminders

@router.get("/{contest_id}")
async def get_reminder(
    contest_id: str,
    db: Session = Depends(get_db),
    user_id: str = Header(..., description="Clerk user ID")
):
    """
    Get a specific reminder
    """
    reminder = db.query(Reminder).filter(
        and_(
            Reminder.contest_id == contest_id,
            Reminder.user_id == user_id
        )
    ).first()
    
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    return reminder

@router.post("/")
async def create_or_update_reminder(
    reminder_data: ReminderCreate,
    db: Session = Depends(get_db),
    user_id: str = Header(..., description="Clerk user ID")
):
    """
    Create or update a reminder
    """
    # Check if contest exists
    contest = db.query(Contest).filter(Contest.id == reminder_data.contest_id).first()
    if not contest:
        raise HTTPException(status_code=404, detail="Contest not found")
    
    # Check if contest is in the past
    if contest.status == "past":
        raise HTTPException(status_code=400, detail="Cannot set reminder for past contests")
    
    # Check if reminder time is valid (not after contest start)
    contest_start = contest.start_time
    now = datetime.utcnow()
    minutes_until_start = (contest_start - now).total_seconds() / 60
    
    if reminder_data.reminder_minutes > minutes_until_start:
        raise HTTPException(
            status_code=400, 
            detail=f"Reminder time is after contest start. Contest starts in {int(minutes_until_start)} minutes."
        )
    
    # Check if user exists
    user = db.query(User).filter(User.clerk_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if reminder already exists
    existing_reminder = db.query(Reminder).filter(
        and_(
            Reminder.contest_id == reminder_data.contest_id,
            Reminder.user_id == user_id
        )
    ).first()
    
    if existing_reminder:
        # Update existing reminder
        existing_reminder.reminder_minutes = reminder_data.reminder_minutes
        existing_reminder.custom_email = reminder_data.custom_email
        existing_reminder.first_name = reminder_data.first_name
        existing_reminder.is_sent = 0  # Reset sent status
        existing_reminder.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing_reminder)
        return existing_reminder
    else:
        # Create new reminder
        new_reminder = Reminder(
            contest_id=reminder_data.contest_id,
            user_id=user_id,
            reminder_minutes=reminder_data.reminder_minutes,
            custom_email=reminder_data.custom_email,
            first_name=reminder_data.first_name
        )
        db.add(new_reminder)
        db.commit()
        db.refresh(new_reminder)
        return new_reminder

@router.delete("/{contest_id}")
async def delete_reminder(
    contest_id: str,
    db: Session = Depends(get_db),
    user_id: str = Header(..., description="Clerk user ID")
):
    """
    Delete a reminder
    """
    reminder = db.query(Reminder).filter(
        and_(
            Reminder.contest_id == contest_id,
            Reminder.user_id == user_id
        )
    ).first()
    
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    db.delete(reminder)
    db.commit()
    
    return {"message": "Reminder deleted successfully"} 