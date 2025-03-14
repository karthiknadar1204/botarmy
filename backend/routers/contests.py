# routers/contests.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from models.database import get_db
from models.contests import Contest
from scrapers.codeforces import CodeForcesScraper
from scrapers.codechef import CodeChefScraper
from scrapers.leetcode import LeetCodeScraper
from sqlalchemy import and_, or_, func
from pydantic import BaseModel

router = APIRouter(prefix="/contests", tags=["contests"])

@router.get("/")
async def get_contests(
    db: Session = Depends(get_db),
    platform: Optional[str] = Query(None, description="Filter by platform (codeforces, codechef, leetcode)"),
    status: Optional[str] = Query(None, description="Filter by status (upcoming, ongoing, past)"),
    past_days: Optional[int] = Query(7, description="Get past contests from last N days")
):
    """
    Get all contests with optional filters
    """
    query = db.query(Contest)
    
    # Apply platform filter
    if platform:
        platforms = platform.split(",")
        query = query.filter(Contest.platform.in_(platforms))
    
    # Apply status filter
    if status:
        if status == "past":
            # Only include past contests from the last N days
            cutoff_date = datetime.utcnow() - timedelta(days=past_days)
            query = query.filter(and_(
                Contest.status == "past",
                Contest.end_time >= cutoff_date
            ))
        else:
            query = query.filter(Contest.status == status)
    
    # Sort by start time
    # Upcoming and ongoing contests should appear first (sorted by start time ascending)
    # Past contests should appear last (sorted by end time descending - most recent first)
    query = query.order_by(
        # First criteria: status (upcoming and ongoing come before past)
        Contest.status != "past",
        # Second criteria: for upcoming/ongoing sort by start time ascending, for past sort by end time descending
        Contest.start_time.asc() if not status or status != "past" else Contest.end_time.desc()
    )
    
    return query.all()

@router.post("/refresh")
async def refresh_contests(db: Session = Depends(get_db)):
    """
    Refresh contests data from all platforms
    """
    try:
        codeforces_scraper = CodeForcesScraper()
        # codechef_scraper = CodeChefScraper()
        # leetcode_scraper = LeetCodeScraper()
        
        # Fetch contests from all platforms
        codeforces_contests = codeforces_scraper.get_contests()
        # codechef_contests = codechef_scraper.get_contests()
        # leetcode_contests = leetcode_scraper.get_contests()
        
        all_contests = codeforces_contests
        
        # Update contest statuses
        now = datetime.utcnow()
        
        # First, update statuses of existing contests
        db_contests = db.query(Contest).all()
        for contest in db_contests:
            if contest.start_time > now:
                contest.status = "upcoming"
            elif contest.end_time > now:
                contest.status = "ongoing"
            else:
                contest.status = "past"
        
        # Then, upsert fetched contests
        for contest_data in all_contests:
            # Check if contest already exists
            existing_contest = db.query(Contest).filter(
                and_(
                    Contest.platform == contest_data["platform"],
                    Contest.contest_id == contest_data["contest_id"]
                )
            ).first()
            
            if existing_contest:
                # Update existing contest
                for key, value in contest_data.items():
                    setattr(existing_contest, key, value)
            else:
                # Create new contest
                new_contest = Contest(**contest_data)
                db.add(new_contest)
        
        db.commit()
        return {"message": "Contests refreshed successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to refresh contests: {str(e)}")

class SolutionUpdate(BaseModel):
    solution_url: str

@router.put("/{contest_id}/solution")
async def update_solution_url(
    contest_id: str,
    solution: SolutionUpdate,
    db: Session = Depends(get_db)
):
    """
    Update the YouTube solution URL for a contest
    """
    contest = db.query(Contest).filter(Contest.id == contest_id).first()
    if not contest:
        raise HTTPException(status_code=404, detail="Contest not found")
    
    contest.solution_url = solution.solution_url
    db.commit()
    db.refresh(contest)
    return contest