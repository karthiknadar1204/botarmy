# main.py
from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from models.database import engine, Base, get_db
from models.contests import Contest
from models.bookmarks import Bookmark
from routers import contests, bookmarks
from scrapers.codeforces import CodeForcesScraper
from scrapers.leetcode import LeetCodeScraper
import os
import logging
from sqlalchemy.orm import Session
from sqlalchemy import and_

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Coding Contests API",
    description="API for tracking coding contests from CodeForces, CodeChef, and LeetCode",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(contests.router)
app.include_router(bookmarks.router)

@app.get("/scrape-codeforces")
async def scrape_codeforces(db: Session = Depends(get_db)):
    """
    Directly scrape Codeforces contests and store them in the database
    """
    try:
        logger.info("Scraping Codeforces contests...")
        scraper = CodeForcesScraper()
        contests = scraper.get_contests()
        
        # Store contests in database
        for contest_data in contests:
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
        
        return {
            "message": f"Successfully scraped and stored {len(contests)} Codeforces contests",
            "contests": contests
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to scrape Codeforces contests: {e}")
        return {"error": str(e)}

@app.get("/scrape-leetcode")
async def scrape_leetcode(db: Session = Depends(get_db)):
    """
    Directly scrape LeetCode contests and store them in the database
    """
    try:
        logger.info("Scraping LeetCode contests...")
        scraper = LeetCodeScraper()
        contests = scraper.get_contests()
        
        # Store contests in database
        for contest_data in contests:
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
        
        return {
            "message": f"Successfully scraped and stored {len(contests)} LeetCode contests",
            "contests": contests
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to scrape LeetCode contests: {e}")
        return {"error": str(e)}

@app.get("/")
async def root():
    return {
        "message": "Coding Contests API",
        "endpoints": {
            "/contests": "Get all contests with optional filters",
            "/contests/refresh": "Refresh contests data from all platforms",
            "/bookmarks": "Manage bookmarked contests",
            "/scrape-codeforces": "Directly scrape Codeforces contests",
            "/scrape-leetcode": "Directly scrape LeetCode contests"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)