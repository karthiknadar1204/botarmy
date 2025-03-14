# scrapers/codeforces.py
import requests
import time
import hashlib
import random
from datetime import datetime
from typing import List, Dict, Any
import os
from dotenv import load_dotenv

load_dotenv()

class CodeForcesScraper:
    def __init__(self):
        self.base_url = "https://codeforces.com/api"
        self.api_key = os.getenv("CODEFORCES_API_KEY")
        self.api_secret = os.getenv("CODEFORCES_API_SECRET")
        
    def _generate_auth_params(self, method_name, params=None):
        """Generate authentication parameters for Codeforces API"""
        if not self.api_key or not self.api_secret:
            return params or {}
            
        if params is None:
            params = {}
            
        # Add API key and current time
        params["apiKey"] = self.api_key
        params["time"] = str(int(time.time()))
        
        # Generate random string for apiSig
        rand = random.randint(100000, 999999)
        
        # Create signature string
        param_strings = []
        for key in sorted(params.keys()):
            param_strings.append(f"{key}={params[key]}")
        
        signature_string = f"{rand}/{method_name}?{'&'.join(param_strings)}#{self.api_secret}"
        
        # Calculate hash
        hash_value = hashlib.sha512(signature_string.encode()).hexdigest()
        
        # Add apiSig to params
        params["apiSig"] = f"{rand}{hash_value}"
        
        return params
        
    def get_contests(self) -> List[Dict[str, Any]]:
        """
        Fetch all contests from Codeforces API
        
        Returns:
            List[Dict[str, Any]]: List of contests with standardized format
        """
        try:
            method_name = "contest.list"
            params = self._generate_auth_params(method_name)
            
            response = requests.get(f"{self.base_url}/{method_name}", params=params)
            response.raise_for_status()
            data = response.json()
            
            if data["status"] != "OK":
                return []
                
            contests = []
            current_time = datetime.now().timestamp()
            one_week_ago = current_time - (7 * 24 * 60 * 60)  # 7 days in seconds
            
            for contest in data["result"]:
                # Skip gym contests
                if contest.get("phase") == "FINISHED" and contest.get("gym", False):
                    continue
                
                start_time = datetime.fromtimestamp(contest["startTimeSeconds"])
                duration_seconds = contest["durationSeconds"]
                end_time = datetime.fromtimestamp(contest["startTimeSeconds"] + duration_seconds)
                
                # Determine contest status
                if contest["phase"] == "BEFORE":
                    status = "upcoming"
                elif contest["phase"] == "CODING":
                    status = "ongoing"
                else:
                    status = "past"
                
                # Skip past contests older than 1 week
                if contest["startTimeSeconds"] < one_week_ago and status == "past":
                    continue
                
                contests.append({
                    "platform": "codeforces",
                    "contest_id": str(contest["id"]),
                    "name": contest["name"],
                    "url": f"https://codeforces.com/contest/{contest['id']}",
                    "start_time": start_time,
                    "end_time": end_time,
                    "duration": duration_seconds // 60,  # Convert to minutes
                    "status": status,
                    "description": contest.get("description", "")
                })
            
            return contests
        except Exception as e:
            print(f"Error fetching Codeforces contests: {e}")
            return []