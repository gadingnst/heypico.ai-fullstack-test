import httpx
import os
import json
from typing import Dict, Any
from pydantic import BaseModel
from .places_service import SearchRequest, LocationBias

# Configuration for LLM selection
USE_LOCAL_LLM = True  # Set to True to use local LLM, False for OpenAI
LOCAL_LLM_URL = "http://localhost:11434/v1/chat/completions"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

class ChatRequest(BaseModel):
  message: str
  location_context: str | None = None

class ChatResponse(BaseModel):
  search_request: SearchRequest
  explanation: str

class LLMService:
  """
  Service for handling LLM operations to extract search requests from natural language
  """

  @staticmethod
  async def extract_search_request(chat_request: ChatRequest) -> ChatResponse:
    """
    Extract SearchRequest from natural language using OpenAI compatible API or local LLM

    Args:
      chat_request: The chat request containing user message

    Returns:
      ChatResponse containing extracted SearchRequest and explanation
    """
    if not USE_LOCAL_LLM and not OPENAI_API_KEY:
      raise ValueError("OPENAI_API_KEY environment variable is required when using cloud LLM")

    # Create system prompt for extraction
    system_prompt = """
You are a helpful assistant that extracts place search parameters from natural language queries.

Your task is to analyze the user's message and extract the following information to create a search request:
- query: The main search term (e.g., "restaurant", "cafe", "hotel")
- limit: Number of results (default: 10, max: 20)
- min_rating: Minimum rating filter (1.0-5.0)
- open_now: Whether to filter for currently open places
- location_name: Location mentioned by user
- sort_by: "rating" or "distance"
- place_types: Array of place types (e.g., ["restaurant", "food"])
- cuisine: Array of cuisine types (e.g., ["italian", "japanese"])
- location_bias: Specific coordinates with radius if mentioned

Respond with a JSON object containing:
{
  "search_request": {
    "query": "extracted search term",
    "limit": 10,
    "min_rating": null,
    "open_now": null,
    "location_name": "extracted location",
    "sort_by": null,
    "place_types": null,
    "cuisine": null,
    "location_bias": null
  },
  "explanation": "Brief explanation of what was extracted"
}

Examples:
- "Find good restaurants in Jakarta" -> query: "restaurant", location_name: "Jakarta"
- "Show me 5 cafes near me that are open now" -> query: "cafe", limit: 5, open_now: true
- "Best rated sushi places in Tokyo" -> query: "sushi", location_name: "Tokyo", sort_by: "rating", cuisine: ["japanese"]
"""

    user_message = chat_request.message
    if chat_request.location_context:
      user_message += f" (Current location context: {chat_request.location_context})"

    # Prepare API request based on LLM selection
    if USE_LOCAL_LLM:
      # Local LLM configuration
      api_url = LOCAL_LLM_URL
      headers = {
        "Content-Type": "application/json"
      }
      payload = {
        "model": "llama3.2",  # Default model for local LLM
        "messages": [
          {"role": "system", "content": system_prompt},
          {"role": "user", "content": user_message}
        ],
        "temperature": 0.1,
        "max_tokens": 500
      }
    else:
      # OpenAI cloud LLM configuration
      api_url = "https://api.openai.com/v1/chat/completions"
      headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
      }
      payload = {
        "model": "gpt-3.5-turbo",
        "messages": [
          {"role": "system", "content": system_prompt},
          {"role": "user", "content": user_message}
        ],
        "temperature": 0.1,
        "max_tokens": 500
      }

    async with httpx.AsyncClient() as client:
      try:
        response = await client.post(
          api_url,
          headers=headers,
          json=payload,
          timeout=30.0
        )
        response.raise_for_status()

        result = response.json()
        content = result["choices"][0]["message"]["content"]

        # Parse the JSON response
        try:
          parsed_response = json.loads(content)

          # Create SearchRequest from parsed data
          search_data = parsed_response["search_request"]

          # Handle location_bias if provided
          location_bias = None
          if search_data.get("location_bias"):
            bias_data = search_data["location_bias"]
            location_bias = LocationBias(
              lat=bias_data["lat"],
              lng=bias_data["lng"],
              radius_m=bias_data.get("radius_m", 8000)
            )

          search_request = SearchRequest(
            query=search_data["query"],
            limit=search_data.get("limit", 10),
            min_rating=search_data.get("min_rating"),
            open_now=search_data.get("open_now"),
            location_name=search_data.get("location_name"),
            sort_by=search_data.get("sort_by"),
            place_types=search_data.get("place_types"),
            cuisine=search_data.get("cuisine"),
            location_bias=location_bias
          )

          return ChatResponse(
            search_request=search_request,
            explanation=parsed_response.get("explanation", "Search request extracted successfully")
          )

        except json.JSONDecodeError as e:
          raise ValueError(f"Failed to parse LLM response as JSON: {e}")
        except KeyError as e:
          raise ValueError(f"Missing required field in LLM response: {e}")

      except httpx.HTTPStatusError as e:
        llm_type = "Local LLM" if USE_LOCAL_LLM else "OpenAI API"
        raise ValueError(f"{llm_type} error: {e.response.status_code} - {e.response.text}")
      except httpx.TimeoutException:
        llm_type = "Local LLM" if USE_LOCAL_LLM else "OpenAI API"
        raise ValueError(f"{llm_type} request timed out")
      except Exception as e:
        llm_type = "Local LLM" if USE_LOCAL_LLM else "OpenAI API"
        raise ValueError(f"Unexpected error calling {llm_type}: {str(e)}")
