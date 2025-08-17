import os
from typing import Optional

class Config:
  """Centralized configuration for the backend application"""

  # Server Configuration
  FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
  BACKEND_BEARER: str = os.getenv("BACKEND_BEARER", "change_me_strong_token")

  # LLM Configuration
  USE_LOCAL_LLM: bool = os.getenv("USE_LOCAL_LLM", "false").lower() == "true"
  LOCAL_LLM_URL: str = os.getenv("LOCAL_LLM_URL", "http://host.docker.internal:11434/v1/chat/completions")
  CLOUD_LLM_URL: str = os.getenv("CLOUD_LLM_URL", "https://api.openai.com/v1/chat/completions")
  CLOUD_LLM_API_KEY: Optional[str] = os.getenv("CLOUD_LLM_API_KEY")

  # LLM Model Configuration
  LOCAL_MODEL_NAME: str = os.getenv("LOCAL_MODEL_NAME", "phi3:3.8b")
  CLOUD_MODEL_NAME: str = os.getenv("CLOUD_MODEL_NAME", "gpt-3.5-turbo")

  # LLM Parameters
  LLM_TEMPERATURE: float = float(os.getenv("LLM_TEMPERATURE", "0.7"))
  LLM_MAX_TOKENS: int = int(os.getenv("LLM_MAX_TOKENS", "2048"))
  LLM_TIMEOUT: float = float(os.getenv("LLM_TIMEOUT", "30.0"))

  # System Prompt
  SYSTEM_PROMPT: str = os.getenv("SYSTEM_PROMPT", """
    You are a helpful and friendly AI assistant. Respond naturally to the user's message in English.
    Keep your responses conversational, helpful, and engaging.
  """)

# Create a global config instance
config = Config()
