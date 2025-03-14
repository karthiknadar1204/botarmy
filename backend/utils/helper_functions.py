# utils/helper_functions.py
import requests
import logging
from typing import Any, Dict, Optional, Union
import json

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_response(url: str, response_type: str = "text", headers: Optional[Dict[str, str]] = None, params: Optional[Dict[str, Any]] = None) -> Union[str, Dict[str, Any], None]:
    """
    Make a GET request and return the response based on the specified type
    
    Args:
        url (str): URL to make the request to
        response_type (str): Type of response to return ("text", "json", "raw")
        headers (Dict[str, str], optional): Headers to include in the request
        params (Dict[str, Any], optional): Query parameters
        
    Returns:
        Union[str, Dict[str, Any], None]: Response in the specified format, or None if request fails
    """
    try:
        # Set default headers if not provided
        if headers is None:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
            
        # Make the request
        response = requests.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()
        
        # Return response based on specified type
        if response_type.lower() == "json":
            return response.json()
        elif response_type.lower() == "raw":
            return response
        else:
            return response.text
    except requests.exceptions.RequestException as e:
        logger.error(f"Error making request to {url}: {e}")
        return None
    except json.JSONDecodeError:
        logger.error(f"Error decoding JSON from {url}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return None