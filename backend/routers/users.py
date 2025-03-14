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

@router.post("/sync")
async def sync_user(user_data: dict, db: Session = Depends(get_db)):
    """
    Sync user data from Clerk to our database
    """
    # Extract data from the request body
    user_id = user_data.get("id")
    email = user_data.get("email")
    full_name = user_data.get("name", "")
    
    # Split full name into first and last name
    name_parts = full_name.split(" ", 1) if full_name else ["", ""]
    first_name = name_parts[0]
    last_name = name_parts[1] if len(name_parts) > 1 else ""
    
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID is required")
    
    # Find or create user
    db_user = db.query(User).filter(User.clerk_id == user_id).first()
    
    if db_user:
        # Update existing user
        db_user.email = email
        db_user.first_name = first_name
        db_user.last_name = last_name
        db_user.updated_at = datetime.utcnow()
    else:
        # Create new user
        db_user = User(
            clerk_id=user_id,
            email=email,
            first_name=first_name,
            last_name=last_name
        )
        db.add(db_user)
    
    try:
        db.commit()
        db.refresh(db_user)
        return {"status": "success", "user_id": user_id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}") 