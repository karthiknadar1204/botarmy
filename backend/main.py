# main.py
from fastapi import FastAPI, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from models.bookmarks import Bookmark
from routers import contests, bookmarks, users


from sqlalchemy import and_
from contextlib import contextmanager
from datetime import datetime








    version="1.0.0"
)


    CORSMiddleware,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(contests.router)
app.include_router(bookmarks.router)
app.include_router(users.router)


@contextmanager
def get_db_context():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def scrape_all_contests():
    logger.info("Running scheduled scraping job")
    
    try:

        with get_db_context() as db:

            codeforces_scraper = CodeForcesScraper()
            codeforces_contests = codeforces_scraper.get_contests()
            

            leetcode_scraper = LeetCodeScraper()
            leetcode_contests = leetcode_scraper.get_contests()
            

            all_contests = codeforces_contests + leetcode_contests
            

            now = datetime.utcnow()
            

            db_contests = db.query(Contest).all()
            for contest in db_contests:
                if contest.start_time > now:
                    contest.status = "upcoming"
                elif contest.end_time > now:
                    contest.status = "ongoing"
                else:
                    contest.status = "past"
            

            for contest_data in all_contests:

                existing_contest = db.query(Contest).filter(
                    and_(
                        Contest.platform == contest_data["platform"],
                        Contest.contest_id == contest_data["contest_id"]
                    )
                ).first()
                
                if existing_contest:

                    for key, value in contest_data.items():
                        setattr(existing_contest, key, value)
                else:

*contest_data)
                    db.add(new_contest)
            
            db.commit()
            logger.info(f"Successfully scraped and stored {len(all_contests)} contests")
    except Exception as e:
        logger.error(f"Error in scheduled scraping job: {e}")


scheduler = BackgroundScheduler(daemon=True)
scheduler.add_job(

    id="scrape_contests_weekly",
    name="Scrape contests from all platforms weekly",
    misfire_grace_time=3600  
)

@app.on_event("startup")
def start_scheduler():
    scheduler.start()
    logger.info("Started background scheduler")
    

    with get_db_context() as db:
        contest_count = db.query(Contest).count()
        if contest_count == 0:
            logger.info("Database empty, running initial scrape")
            scrape_all_contests()
        else:
            logger.info(f"Database already contains {contest_count} contests, skipping initial scrape")

@app.on_event("shutdown")
def shutdown_scheduler():
    scheduler.shutdown()
    logger.info("Shut down background scheduler")

@app.get("/scrape-codeforces")
async def scrape_codeforces(db: Session = Depends(get_db)):
    """
    Directly scrape Codeforces contests and store them in the database
    """
    try:
        logger.info("Scraping Codeforces contests...")
        scraper = CodeForcesScraper()
        contests = scraper.get_contests()
        

        for contest_data in contests:

            existing_contest = db.query(Contest).filter(
                and_(
                    Contest.platform == contest_data["platform"],
                    Contest.contest_id == contest_data["contest_id"]
                )
            ).first()
            
            if existing_contest:

                for key, value in contest_data.items():
                    setattr(existing_contest, key, value)
            else:

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
        

        for contest_data in contests:

            existing_contest = db.query(Contest).filter(
                and_(
                    Contest.platform == contest_data["platform"],
                    Contest.contest_id == contest_data["contest_id"]
                )
            ).first()
            
            if existing_contest:

                for key, value in contest_data.items():
                    setattr(existing_contest, key, value)
            else:

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
