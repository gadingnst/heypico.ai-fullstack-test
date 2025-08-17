from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
from services.places_service import PlacesService, SearchRequest
from services.geocoding_service import GeocodingService
from services.llm_service import LLMService, ChatRequest, ChatResponse, ChatSearchResponse, RegularChatResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
  CORSMiddleware,
  allow_origins=[os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

BACKEND_BEARER = os.getenv("BACKEND_BEARER", "change_me")

@app.get("/healthz")
async def healthz():
  return {"ok": True}

@app.post("/v1/places/search")
async def search_places(body: SearchRequest, authorization: str = Header(None)):
  if authorization != f"Bearer {BACKEND_BEARER}":
    raise HTTPException(status_code=401, detail="unauthorized")

  # Geocode location if location_name is provided but no location_bias
  geocoded_location = None
  if body.location_name and not body.location_bias:
    geocoded_location = await GeocodingService.geocode_location(body.location_name)

  # Search for places using the places service
  return await PlacesService.search_places(body, geocoded_location)

@app.post("/v1/chat/extract", response_model=ChatResponse)
async def extract_search_request(body: ChatRequest, authorization: str = Header(None)):
  """
  Extract search request from natural language using LLM
  """
  if authorization != f"Bearer {BACKEND_BEARER}":
    raise HTTPException(status_code=401, detail="unauthorized")
  
  try:
    return await LLMService.extract_search_request(body)
  except ValueError as e:
    raise HTTPException(status_code=400, detail=str(e))
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/v1/chat/search")
async def chat_and_search(body: ChatRequest, authorization: str = Header(None)):
  """
  Handle chat messages with intent detection - either search for places or regular chat
  """
  if authorization != f"Bearer {BACKEND_BEARER}":
    raise HTTPException(status_code=401, detail="unauthorized")
  
  try:
    logger.info(f"💬 Chat request: '{body.message}'")
    
    # Prepare chat history for context
    chat_history = []
    if body.chat_history:
      chat_history = [{"role": msg.role, "content": msg.content} for msg in body.chat_history]
    
    # Detect if message requires search or is regular chat
    requires_search = await LLMService.detect_search_intent(body.message, chat_history)
    logger.info(f"🔍 Search intent detected: {requires_search} (with context: {len(chat_history)} messages)")
    
    if requires_search:
      # Handle search request
      chat_response = await LLMService.extract_search_request(body)
      search_request = chat_response.search_request
      
      logger.info(f"🤖 LLM extracted: query='{search_request.query}', location_name='{search_request.location_name}'")
      
      # Geocode location if location_name is provided but no location_bias
      geocoded_location = None
      if search_request.location_name and not search_request.location_bias:
        logger.info(f"🗺️ Geocoding location: '{search_request.location_name}'")
        geocoded_location = await GeocodingService.geocode_location(search_request.location_name)
        if geocoded_location:
          logger.info(f"✅ Geocoding successful: {geocoded_location}")
        else:
          logger.warning(f"❌ Geocoding failed for: '{search_request.location_name}'")
      
      # Search for places using the places service
      search_results = await PlacesService.search_places(search_request, geocoded_location)
      
      logger.info(f"🎯 Search completed: {len(search_results.get('results', []))} results found")
      
      # Generate response message from LLM
      response_message = await LLMService.generate_response_message(body.message, search_results)
      
      logger.info(f"💬 Generated search response: '{response_message}'")
      
      return ChatSearchResponse(
        query=search_request.query,
        places=search_results.get('results', []),
        response_message=response_message
      )
    else:
      # Handle regular chat
      response_message = await LLMService.generate_regular_chat_response(body.message, chat_history)
      
      logger.info(f"💬 Generated regular chat response: '{response_message}'")
      
      return RegularChatResponse(
        response_message=response_message,
        is_search_intent=False
      )
    
  except ValueError as e:
    raise HTTPException(status_code=400, detail=str(e))
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
