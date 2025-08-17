from fastapi import HTTPException
from pydantic import BaseModel
from typing import Dict
from datetime import datetime
import uuid
from configs.envs import config

class AuthRequest(BaseModel):
  username: str
  password: str

class AuthResponse(BaseModel):
  token: str

class AuthService:
  # Store active tokens
  _tokens: Dict[str, datetime] = {}

  @classmethod
  def authenticate(cls, username: str, password: str) -> str:
    """
    User authentication (now only with dummy predefined username and password).
    Returns a token if authentication is successful.
    """
    if username == config.DUMMY_BYPASS_UNAME and password == config.DUMMY_BYPASS_PASSWORD:
      token = uuid.uuid4().hex
      cls._tokens[token] = datetime.utcnow()
      return token
    raise HTTPException(status_code=401, detail="invalid credentials")

  @classmethod
  def validate_token(cls, token: str) -> bool:
    """
    Validate if the token exists and is active.
    """
    return token in cls._tokens

  @classmethod
  def extract_token_from_header(cls, authorization: str) -> str:
    """
    Extract token from Authorization header.
    """
    if not authorization or not authorization.startswith("Bearer "):
      raise HTTPException(status_code=401, detail="unauthorized")

    token = authorization.split(" ", 1)[1]
    if not cls.validate_token(token):
      raise HTTPException(status_code=401, detail="unauthorized")

    return token

  @classmethod
  def revoke_token(cls, token: str) -> None:
    """
    Revoke a token.
    """
    if token in cls._tokens:
      del cls._tokens[token]
