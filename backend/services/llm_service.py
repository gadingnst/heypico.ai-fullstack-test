import httpx
from typing import List, Optional
from pydantic import BaseModel
from configs.envs import config
from .maps_service import MapService

class ChatMessage(BaseModel):
  role: str  # "user" or "assistant"
  content: str

class ChatRequest(BaseModel):
  message: str
  chat_history: Optional[List[ChatMessage]] = None


class Location(BaseModel):
  lat: Optional[float]
  lng: Optional[float]


class PlaceResult(BaseModel):
  name: Optional[str]
  place_id: Optional[str]
  address: Optional[str]
  rating: Optional[float]
  user_ratings_total: Optional[int]
  price_level: Optional[int]
  location: Optional[Location]
  open_now: Optional[bool]
  embed_iframe_url: Optional[str]
  directions_url: Optional[str]


class ChatResponse(BaseModel):
  response: str
  places: Optional[List[PlaceResult]] = None

class LLMService:
  """
  Service for handling standard LLM chat operations
  """

  _last_places: Optional[List[dict]] = None

  @staticmethod
  async def _is_follow_up(message: str) -> bool:
    """Use LLM to determine if user refers to previous places"""
    try:
      messages = [
        {
          "role": "system",
          "content": "You are an intent classifier. Reply with YES or NO only.",
        },
        {
          "role": "user",
          "content": (
            "Does the following message refer to previously mentioned places or ask which of them is best? "
            "Answer YES or NO only.\n\n" + message
          ),
        },
      ]

      if config.USE_LOCAL_LLM:
        api_url = config.LOCAL_LLM_URL
        headers = {"Content-Type": "application/json"}
        payload = {
          "model": config.LOCAL_MODEL_NAME,
          "messages": messages,
          "temperature": 0,
          "max_tokens": 5,
        }
      else:
        api_url = config.CLOUD_LLM_URL
        headers = {
          "Authorization": f"Bearer {config.CLOUD_LLM_API_KEY}",
          "Content-Type": "application/json",
        }
        payload = {
          "model": config.CLOUD_MODEL_NAME,
          "messages": messages,
          "temperature": 0,
          "max_completion_tokens": 5,
        }

      async with httpx.AsyncClient() as client:
        resp = await client.post(api_url, headers=headers, json=payload, timeout=config.LLM_TIMEOUT)
        resp.raise_for_status()
        result = resp.json()
        content = result["choices"][0]["message"]["content"].strip().lower()
        return content.startswith("y")
    except Exception as e:
      llm_type = "Local LLM" if config.USE_LOCAL_LLM else "OpenAI API"
      print(f"🚨 {llm_type} Error detecting follow-up intent: {str(e)}")
      return False

  @staticmethod
  async def _needs_place_search(message: str) -> bool:
    """Use LLM to determine if message requires a place search"""
    try:
      messages = [
        {
          "role": "system",
          "content": "You are an intent classifier. Reply with YES or NO only.",
        },
        {
          "role": "user",
          "content": (
            "Does the following message ask to find or go to physical places such as restaurants, cafes, parks, stores or other locations? "
            "Answer YES or NO only.\n\n" + message
          ),
        },
      ]

      if config.USE_LOCAL_LLM:
        api_url = config.LOCAL_LLM_URL
        headers = {"Content-Type": "application/json"}
        payload = {
          "model": config.LOCAL_MODEL_NAME,
          "messages": messages,
          "temperature": 0,
          "max_tokens": 5,
        }
      else:
        api_url = config.CLOUD_LLM_URL
        headers = {
          "Authorization": f"Bearer {config.CLOUD_LLM_API_KEY}",
          "Content-Type": "application/json",
        }
        payload = {
          "model": config.CLOUD_MODEL_NAME,
          "messages": messages,
          "temperature": 0,
          "max_completion_tokens": 5,
        }

      async with httpx.AsyncClient() as client:
        resp = await client.post(api_url, headers=headers, json=payload, timeout=config.LLM_TIMEOUT)
        resp.raise_for_status()
        result = resp.json()
        content = result["choices"][0]["message"]["content"].strip().lower()
        return content.startswith("y")
    except Exception as e:
      llm_type = "Local LLM" if config.USE_LOCAL_LLM else "OpenAI API"
      print(f"🚨 {llm_type} Error detecting place intent: {str(e)}")
      return False

  @staticmethod
  async def chat(chat_request: ChatRequest) -> ChatResponse:
    if not config.USE_LOCAL_LLM and not config.CLOUD_LLM_API_KEY:
      raise ValueError("CLOUD_LLM_API_KEY environment variable is required when using cloud LLM")

    if LLMService._last_places and await LLMService._is_follow_up(chat_request.message):
      best_place = max(
        LLMService._last_places,
        key=lambda p: (p.get("rating", 0), p.get("user_ratings_total", 0)),
      )
      name = best_place.get("name")
      rating = best_place.get("rating")
      reviews = best_place.get("user_ratings_total")
      response = (
        f"Based on your previous search, {name} is the highest rated option "
        f"with a rating of {rating} from {reviews} reviews."
      )
      return ChatResponse(response=response, places=LLMService._last_places)

    messages = [{"role": "system", "content": config.SYSTEM_PROMPT}]

    # Add chat history if provided
    if chat_request.chat_history:
      for chat in chat_request.chat_history:
        messages.append({"role": chat.role, "content": chat.content})

    # Add current user message
    messages.append({"role": "user", "content": chat_request.message})

    # Prepare API request
    if config.USE_LOCAL_LLM:
      api_url = config.LOCAL_LLM_URL
      headers = {
        "Content-Type": "application/json"
      }
      payload = {
        "model": config.LOCAL_MODEL_NAME,
        "messages": messages,
        "temperature": config.LLM_TEMPERATURE,
        "max_tokens": config.LLM_MAX_TOKENS
      }
    else:
      api_url = config.CLOUD_LLM_URL
      headers = {
        "Authorization": f"Bearer {config.CLOUD_LLM_API_KEY}",
        "Content-Type": "application/json"
      }
      payload = {
        "model": config.CLOUD_MODEL_NAME,
        "messages": messages,
        "temperature": config.LLM_TEMPERATURE,
        "max_completion_tokens": config.LLM_MAX_TOKENS
      }

    async with httpx.AsyncClient() as client:
      try:
        response = await client.post(api_url, headers=headers, json=payload, timeout=config.LLM_TIMEOUT)
        response.raise_for_status()
        result = response.json()
        ai_response = result["choices"][0]["message"]["content"]

        places = None
        if await LLMService._needs_place_search(chat_request.message):
          places = await MapService.search_places(chat_request.message)
          if places:
            LLMService._last_places = places
            summaries = []
            for idx, p in enumerate(places, 1):
              line = f"{idx}. {p.get('name')}"
              addr = p.get('address')
              if addr:
                line += f" - {addr}"
              rating = p.get('rating')
              if rating:
                line += f" (Rating {rating})"
              summaries.append(line)
            ai_response = f"{ai_response}\n\n" + "\n".join(summaries)

        return ChatResponse(response=ai_response, places=places)
      except Exception as e:
        llm_type = "Local LLM" if config.USE_LOCAL_LLM else "OpenAI API"
        print(f"🚨 {llm_type} Error in chat: {str(e)}")
        return ChatResponse(response="Sorry, I'm having trouble responding. Please try again.")
