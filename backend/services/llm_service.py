import httpx
import os
from typing import List, Optional
from pydantic import BaseModel

# Configuration for LLM selection
USE_LOCAL_LLM = False  # Set to True to use local LLM, False for OpenAI
LOCAL_LLM_URL = "http://host.docker.internal:11434/v1/chat/completions"
CLOUD_LLM_URL = "https://api.openai.com/v1/chat/completions"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

class ChatMessage(BaseModel):
  role: str  # "user" or "assistant"
  content: str

class ChatRequest(BaseModel):
  message: str
  chat_history: Optional[List[ChatMessage]] = None

class ChatResponse(BaseModel):
  response: str

class LLMService:
  """
  Service for handling standard LLM chat operations
  """

  @staticmethod
  async def chat(chat_request: ChatRequest) -> ChatResponse:
    if not USE_LOCAL_LLM and not OPENAI_API_KEY:
      raise ValueError("OPENAI_API_KEY environment variable is required when using cloud LLM")

    # Create system prompt
    system_prompt = """
      You are a helpful and friendly AI assistant. Respond naturally to the user's message in English.
      Keep your responses conversational, helpful, and engaging.
    """

    messages = [{"role": "system", "content": system_prompt}]

    # Add chat history if provided
    if chat_request.chat_history:
      for chat in chat_request.chat_history:
        messages.append({"role": chat.role, "content": chat.content})

    # Add current user message
    messages.append({"role": "user", "content": chat_request.message})

    # Prepare API request
    if USE_LOCAL_LLM:
      api_url = LOCAL_LLM_URL
      headers = {
        "Content-Type": "application/json"
      }
      payload = {
        "model": "phi3:3.8b",
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 2048
      }
    else:
      api_url = CLOUD_LLM_URL
      headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
      }
      payload = {
        "model": "gpt-3.5-turbo",
        "messages": messages,
        "temperature": 0.7,
        "max_completion_tokens": 2048
      }

    async with httpx.AsyncClient() as client:
      try:
        response = await client.post(api_url, headers=headers, json=payload, timeout=30.0)
        response.raise_for_status()
        result = response.json()
        ai_response = result["choices"][0]["message"]["content"]
        return ChatResponse(response=ai_response)
      except Exception as e:
        llm_type = "Local LLM" if USE_LOCAL_LLM else "OpenAI API"
        print(f"🚨 {llm_type} Error in chat: {str(e)}")
        return ChatResponse(response="Sorry, I'm having trouble responding. Please try again.")
