# routers/bookmarks.py
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from models.database import get_db
from models.contests import Contest
from models.bookmarks import Bookmark
from sqlalchemy import and_

router = APIRouter(prefix="/bookmarks", tags=["bookmarks"])

@router.get("/")
async def get_user_bookmarks(
    db: Session = Depends(get_db),
    user_id: str = Header(..., description="Clerk user ID")
):
    """
    Get all bookmarked contests for a user
    """
    # Query bookmarks for the user and join with contests
    bookmarked_contests = db.query(Contest).join(
        Bookmark, Contest.id == Bookmark.contest_id
    ).filter(
        Bookmark.user_id == user_id
    ).all()
    
    return bookmarked_contests

@router.post("/{contest_id}")
async def bookmark_contest(
    contest_id: str,
    db: Session = Depends(get_db),
    user_id: str = Header(..., description="Clerk user ID")
):
    """
    Bookmark a contest
    """
    # Check if contest exists
    contest = db.query(Contest).filter(Contest.id == contest_id).first()
    if not contest:
        raise HTTPException(status_code=404, detail="Contest not found")
    
    # Check if bookmark already exists
    existing_bookmark = db.query(Bookmark).filter(
        and_(
            Bookmark.contest_id == contest_id,
            Bookmark.user_id == user_id
        )
    ).first()
    
    if existing_bookmark:
        raise HTTPException(status_code=400, detail="Contest already bookmarked")
    
    # Create new bookmark
    bookmark = Bookmark(
        contest_id=contest_id,
        user_id=user_id
    )
    
    db.add(bookmark)
    db.commit()
    db.refresh(bookmark)
    
    return {"message": "Contest bookmarked successfully"}

@router.delete("/{contest_id}")
async def remove_bookmark(
    contest_id: str,
    db: Session = Depends(get_db),
    user_id: str = Header(..., description="Clerk user ID")
):
    """
    Remove a bookmark
    """
    # Find the bookmark
    bookmark = db.query(Bookmark).filter(
        and_(
            Bookmark.contest_id == contest_id,
            Bookmark.user_id == user_id
        )
    ).first()
    
    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    
    # Delete the bookmark
    db.delete(bookmark)
    db.commit()
    
    return {"message": "Bookmark removed successfully"}