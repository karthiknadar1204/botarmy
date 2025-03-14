from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from models.database import get_db
from models.users import User
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/users", tags=["users"])

class UserCreate(BaseModel):
    clerk_id: str
    email: str
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    image_url: Optional[str] = None

@router.post("/")
async def create_or_update_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new user or update existing user
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.clerk_id == user_data.clerk_id).first()
    
    if existing_user:
        # Update existing user
        for key, value in user_data.dict().items():
            setattr(existing_user, key, value)
        existing_user.updated_at = datetime.utcnow()
    else:
        # Create new user
        new_user = User(**user_data.dict())
        db.add(new_user)
    
    db.commit()
    
    if existing_user:
        db.refresh(existing_user)
        return existing_user
    else:
        # Get the newly created user
        user = db.query(User).filter(User.clerk_id == user_data.clerk_id).first()
        return user

@router.get("/me")
async def get_current_user(
    db: Session = Depends(get_db),
    user_id: str = Header(..., description="Clerk user ID")
):
    """
    Get current user information
    """
    user = db.query(User).filter(User.clerk_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user 