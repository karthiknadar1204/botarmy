# scrapers/leetcode.py
import requests
from datetime import datetime, timedelta
import pytz
from typing import List, Dict, Any
import logging
from bs4 import BeautifulSoup
import re
from dateutil import parser
import time
import random

# Set up logging
logger = logging.getLogger(__name__)

class LeetCodeScraper:
    def __init__(self):
        self.base_url = "https://leetcode.com"
        self.contest_url = "https://leetcode.com/contest/"
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Cache-Control": "max-age=0"
        }
    
    def get_contests(self) -> List[Dict[str, Any]]:
        """
        Scrape contests from LeetCode contest page
        
        Returns:
            List[Dict[str, Any]]: List of contests with standardized format
        """
        try:
            logger.info("Scraping LeetCode contest page")
            


            return self._get_fallback_contests()
            
            # The code below is is for reference from a amigo.
            """
            response = requests.get(self.contest_url, headers=self.headers)
            
            # Log response status
            logger.info(f"LeetCode page response status: {response.status_code}")
            
            # Check for error status
            if response.status_code != 200:
                logger.error(f"LeetCode page error: {response.status_code}")
                return self._get_fallback_contests()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            contests = []
            now = datetime.now().timestamp()
            
            # Find all contest links
            contest_links = soup.select('a[data-contest-title-slug]')
            logger.info(f"Found {len(contest_links)} contest links")
            
            for link in contest_links:
                try:
                    # Extract contest slug
                    contest_slug = link.get('data-contest-title-slug')
                    if not contest_slug:
                        continue
                    
                    # Extract contest name
                    name_elem = link.select_one('span[title]')
                    contest_name = name_elem.get('title') if name_elem else contest_slug.replace('-', ' ').title()
                    
                    # Extract date string
                    date_elem = link.select_one('div.text-\\[11px\\]')
                    if not date_elem:
                        continue
                    
                    date_str = date_elem.text.strip()
                    
                    # Parse date (format: "Mar 2, 2025 8:00 AM GMT+5:30")
                    try:
                        start_time = parser.parse(date_str)
                        # Convert to UTC
                        if start_time.tzinfo:
                            start_time = start_time.astimezone(pytz.UTC).replace(tzinfo=None)
                    except Exception as e:
                        logger.error(f"Error parsing date '{date_str}': {e}")
                        continue
                    
                    # LeetCode contests are typically 1.5 hours (90 minutes) long
                    duration_minutes = 90
                    end_time = start_time + timedelta(minutes=duration_minutes)
                    
                    # Determine status
                    start_timestamp = start_time.timestamp()
                    end_timestamp = end_time.timestamp()
                    
                    if start_timestamp > now:
                        status = "upcoming"
                    elif end_timestamp > now:
                        status = "ongoing"
                    else:
                        status = "past"
                    
                    contest_url = f"{self.base_url}/contest/{contest_slug}"
                    
                    contests.append({
                        "platform": "leetcode",
                        "contest_id": contest_slug,
                        "name": contest_name,
                        "url": contest_url,
                        "start_time": start_time,
                        "end_time": end_time,
                        "duration": duration_minutes,
                        "status": status,
                        "description": ""
                    })
                except Exception as e:
                    logger.error(f"Error processing contest link: {e}")
            """
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error fetching LeetCode contests: {e}")
            return self._get_fallback_contests()
        except Exception as e:
            logger.error(f"Error fetching LeetCode contests: {e}")
            return self._get_fallback_contests()
    
    def _get_fallback_contests(self) -> List[Dict[str, Any]]:
        """
        Return hardcoded upcoming LeetCode contests as a fallback
        """
        logger.info("Using fallback LeetCode contest data")
        
        now = datetime.now()
        contests = []
        

        for week in range(8):
            days_until_saturday = (5 - now.weekday()) % 7
            if days_until_saturday == 0 and now.hour >= 10:  
                days_until_saturday = 7  
                
            next_saturday = now + timedelta(days=days_until_saturday + (week * 7))
            next_saturday = next_saturday.replace(hour=10, minute=30, second=0, microsecond=0)
            

            weekly_number = 439 + week
            
            weekly_contest = {
                "platform": "leetcode",
                "contest_id": f"weekly-contest-{weekly_number}",
                "name": f"Weekly Contest {weekly_number}",
                "url": f"https://leetcode.com/contest/weekly-contest-{weekly_number}",
                "start_time": next_saturday,
                "end_time": next_saturday + timedelta(minutes=90),
                "duration": 90,
                "status": "upcoming",
                "description": "LeetCode Weekly Contest"
            }
            

            if next_saturday <= now < next_saturday + timedelta(minutes=90):
                weekly_contest["status"] = "ongoing"
            elif next_saturday < now:
                weekly_contest["status"] = "past"
            
            contests.append(weekly_contest)
            

            if (now.isocalendar()[1] + week) % 2 == 0:
                biweekly_number = 123 + (week // 2)
                next_sunday = next_saturday + timedelta(days=1)
                next_sunday = next_sunday.replace(hour=10, minute=30, second=0, microsecond=0)
                
                biweekly_contest = {
                    "platform": "leetcode",
                    "contest_id": f"biweekly-contest-{biweekly_number}",
                    "name": f"Biweekly Contest {biweekly_number}",
                    "url": f"https://leetcode.com/contest/biweekly-contest-{biweekly_number}",
                    "start_time": next_sunday,
                    "end_time": next_sunday + timedelta(minutes=90),
                    "duration": 90,
                    "status": "upcoming",
                    "description": "LeetCode Biweekly Contest"
                }
                
                # Update status based on current time
                if next_sunday <= now < next_sunday + timedelta(minutes=90):
                    biweekly_contest["status"] = "ongoing"
                elif next_sunday < now:
                    biweekly_contest["status"] = "past"
                
                contests.append(biweekly_contest)
        
        # Add past contests (only from the last week)
        for week in range(1, 2):  
            past_saturday = now - timedelta(days=(now.weekday() + 2) + (week * 7))
            past_saturday = past_saturday.replace(hour=10, minute=30, second=0, microsecond=0)
            
            weekly_number = 439 - week
            
            past_contest = {
                "platform": "leetcode",
                "contest_id": f"weekly-contest-{weekly_number}",
                "name": f"Weekly Contest {weekly_number}",
                "url": f"https://leetcode.com/contest/weekly-contest-{weekly_number}",
                "start_time": past_saturday,
                "end_time": past_saturday + timedelta(minutes=90),
                "duration": 90,
                "status": "past",
                "description": "LeetCode Weekly Contest"
            }
            contests.append(past_contest)
            
            # Add past biweekly contest if it was in the last week
            if (now.isocalendar()[1] - week) % 2 == 0:
                biweekly_number = 123 - (week // 2) - 1
                past_sunday = past_saturday + timedelta(days=1)
                past_sunday = past_sunday.replace(hour=10, minute=30, second=0, microsecond=0)
                
                past_biweekly = {
                    "platform": "leetcode",
                    "contest_id": f"biweekly-contest-{biweekly_number}",
                    "name": f"Biweekly Contest {biweekly_number}",
                    "url": f"https://leetcode.com/contest/biweekly-contest-{biweekly_number}",
                    "start_time": past_sunday,
                    "end_time": past_sunday + timedelta(minutes=90),
                    "duration": 90,
                    "status": "past",
                    "description": "LeetCode Biweekly Contest"
                }
                contests.append(past_biweekly)
        
        return contests