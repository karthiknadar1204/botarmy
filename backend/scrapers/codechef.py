# scrapers/codechef.py
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import pytz
from typing import List, Dict, Any
import re

class CodeChefScraper:
    def __init__(self):
        self.base_url = "https://www.codechef.com"
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        }
    
    def parse_date(self, date_str: str) -> datetime:
        """Parse CodeChef date format to datetime object"""
        # Format: 15:30 IST, 12 Mar, 2023
        try:
            # Extract components
            time_part = date_str.split(",")[0].strip()  # "15:30 IST"
            date_part = ",".join(date_str.split(",")[1:]).strip()  # "12 Mar, 2023"
            
            # Parse time
            hour, minute = map(int, time_part.split()[0].split(":"))
            
            # Parse date
            date_obj = datetime.strptime(date_part, " %d %b, %Y")
            
            # Combine and convert to UTC
            ist = pytz.timezone("Asia/Kolkata")
            combined = ist.localize(datetime(
                date_obj.year, date_obj.month, date_obj.day, hour, minute
            ))
            return combined.astimezone(pytz.UTC).replace(tzinfo=None)
        except Exception as e:
            print(f"Error parsing date {date_str}: {e}")
            return datetime.now()  # Fallback
    
    def get_contests(self) -> List[Dict[str, Any]]:
        """
        Scrape contests from CodeChef
        
        Returns:
            List[Dict[str, Any]]: List of contests with standardized format
        """
        try:
            response = requests.get(f"{self.base_url}/contests", headers=self.headers)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")
            
            contests = []
            
            # Present and upcoming contests
            contest_tables = soup.select('.contest-tables')
            if contest_tables:
                for table in contest_tables:
                    table_rows = table.select('tbody tr')
                    for row in table_rows:
                        cells = row.select('td')
                        if len(cells) >= 4:
                            # Extract contest data
                            code_element = cells[0].select_one('a')
                            if not code_element:
                                continue
                                
                            contest_code = code_element.text.strip()
                            contest_name = cells[1].text.strip()
                            contest_url = self.base_url + code_element['href']
                            
                            # Extract start and end times
                            start_time_str = cells[2].text.strip()
                            end_time_str = cells[3].text.strip()
                            
                            start_time = self.parse_date(start_time_str)
                            end_time = self.parse_date(end_time_str)
                            
                            # Calculate duration in minutes
                            duration = int((end_time - start_time).total_seconds() / 60)
                            
                            # Determine status
                            now = datetime.now()
                            if start_time > now:
                                status = "upcoming"
                            elif end_time > now:
                                status = "ongoing"
                            else:
                                status = "past"
                            
                            contests.append({
                                "platform": "codechef",
                                "contest_id": contest_code,
                                "name": contest_name,
                                "url": contest_url,
                                "start_time": start_time,
                                "end_time": end_time,
                                "duration": duration,
                                "status": status,
                                "description": ""  # CodeChef doesn't provide description on contests page
                            })
            
            return contests
        except Exception as e:
            print(f"Error fetching CodeChef contests: {e}")
            return []