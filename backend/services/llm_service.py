import httpx
from typing import List, Optional
from pydantic import BaseModel
from configs.envs import config

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
    if not config.USE_LOCAL_LLM and not config.CLOUD_LLM_API_KEY:
      raise ValueError("CLOUD_LLM_API_KEY environment variable is required when using cloud LLM")

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
        return ChatResponse(response=ai_response)
      except Exception as e:
        llm_type = "Local LLM" if config.USE_LOCAL_LLM else "OpenAI API"
        print(f"🚨 {llm_type} Error in chat: {str(e)}")
        return ChatResponse(response="Sorry, I'm having trouble responding. Please try again.")
