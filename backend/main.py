from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging
from services.llm_service import LLMService, ChatRequest, ChatResponse
from configs.envs import config
from pydantic import BaseModel
from typing import Dict, List
from datetime import datetime, timedelta
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

TOKEN_REQUESTS: Dict[str, List[datetime]] = {}
RATE_LIMIT = 10
RATE_WINDOW = timedelta(minutes=30)

app.add_middleware(
  CORSMiddleware,
  allow_origins=[config.FRONTEND_ORIGIN],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

class AuthRequest(BaseModel):
  username: str
  password: str

class AuthResponse(BaseModel):
  token: str

@app.get("/healthz")
async def healthz():
  return {"ok": True}

@app.post("/v1/auth", response_model=AuthResponse)
async def auth(body: AuthRequest):
  if body.username == config.DUMMY_BYPASS_UNAME and body.password == config.DUMMY_BYPASS_PASSWORD:
    token = uuid.uuid4().hex
    TOKEN_REQUESTS[token] = []
    return {"token": token}
  raise HTTPException(status_code=401, detail="invalid credentials")

@app.post("/v1/chat", response_model=ChatResponse)
async def chat(body: ChatRequest, authorization: str = Header(None)):
  if not authorization or not authorization.startswith("Bearer "):
    raise HTTPException(status_code=401, detail="unauthorized")

  token = authorization.split(" ", 1)[1]
  if token not in TOKEN_REQUESTS:
    raise HTTPException(status_code=401, detail="unauthorized")

  now = datetime.utcnow()
  recent = [t for t in TOKEN_REQUESTS[token] if now - t < RATE_WINDOW]
  if len(recent) >= RATE_LIMIT:
    raise HTTPException(
      status_code=429,
      detail="You have reached the maximum usage limit. Please try sending the message again later."
    )
  recent.append(now)
  TOKEN_REQUESTS[token] = recent

  try:
    logger.info(f"💬 Chat request: '{body.message}'")

    # Generate chat response using LLM service
    chat_response = await LLMService.chat(body)

    logger.info(f"💬 Generated response: '{chat_response.response}'")

    return chat_response

  except ValueError as e:
    raise HTTPException(status_code=400, detail=str(e))
  except Exception as e:
    raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
