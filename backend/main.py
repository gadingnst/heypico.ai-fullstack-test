from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging
from services.llm_service import LLMService, ChatRequest, ChatResponse
from configs.envs import config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
  CORSMiddleware,
  allow_origins=[config.FRONTEND_ORIGIN],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

@app.get("/healthz")
async def healthz():
  return {"ok": True}

@app.post("/v1/chat", response_model=ChatResponse)
async def chat(body: ChatRequest, authorization: str = Header(None)):
  if authorization != f"Bearer {config.BACKEND_BEARER}":
    raise HTTPException(status_code=401, detail="unauthorized")

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
