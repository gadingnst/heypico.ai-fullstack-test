from fastapi import HTTPException, Request
from typing import Dict, List, Callable, Any
from datetime import datetime, timedelta
from functools import wraps

# Default rate limiter configuration (10req/30min)
DEFAULT_RATE_LIMIT = 10
DEFAULT_RATE_WINDOW = timedelta(minutes=30)

class RateLimiter:
  # Store requests per token
  _token_requests: Dict[str, List[datetime]] = {}

  #
  def __init__(self, limit: int = DEFAULT_RATE_LIMIT, window: timedelta = DEFAULT_RATE_WINDOW):
    """
    Initialize rate limiter with limit and time window.

    Args:
      limit: Maximum number of requests allowed
      window: Time window for rate limiting
    """
    self.limit = limit
    self.window = window

  def check_rate_limit(self, token: str) -> None:
    """
    Check if the token has exceeded the rate limit.
    Raises HTTPException if limit is exceeded.

    Args:
      token: The authentication token to check
    """
    now = datetime.utcnow()

    # Initialize token requests if not exists
    if token not in self._token_requests:
      self._token_requests[token] = []

    # Filter recent requests within the time window
    recent = [t for t in self._token_requests[token] if now - t < self.window]

    # Check if limit is exceeded
    if len(recent) >= self.limit:
      raise HTTPException(
        status_code=429,
        detail="You have reached the maximum usage limit. Please try sending the message again later."
      )

    # Add current request timestamp
    recent.append(now)
    self._token_requests[token] = recent

  def middleware(self, token_extractor: Callable[[Any], str]):
    """
    Create a middleware decorator for rate limiting.

    Args:
      token_extractor: Function to extract token from request parameters

    Returns:
      Decorator function
    """
    def decorator(func: Callable) -> Callable:
      @wraps(func)
      async def wrapper(*args, **kwargs):
        # Extract token using the provided extractor
        token = token_extractor(*args, **kwargs)

        # Check rate limit
        self.check_rate_limit(token)

        # Call the original function
        return await func(*args, **kwargs)

      return wrapper
    return decorator

# Default rate limiter instance
default_rate_limiter = RateLimiter(limit=DEFAULT_RATE_LIMIT, window=DEFAULT_RATE_WINDOW)
