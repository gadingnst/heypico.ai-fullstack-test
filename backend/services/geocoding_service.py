import httpx
import os

GMAPS_SERVER_KEY = os.getenv("GMAPS_SERVER_KEY")

class GeocodingService:
  """
  Service for handling geocoding operations using Google Maps API
  """
  
  @staticmethod
  async def geocode_location(location_name: str) -> dict | None:
    """
    Geocode a location name to get latitude and longitude coordinates
    
    Args:
      location_name: The location name to geocode
      
    Returns:
      Dictionary with lat/lng coordinates or None if not found
    """
    async with httpx.AsyncClient(timeout=10) as client:
      response = await client.get(
        "https://maps.googleapis.com/maps/api/geocode/json",
        params={
          "address": location_name,
          "language": "id",
          "key": GMAPS_SERVER_KEY
        }
      )
      response.raise_for_status()
      data = response.json()
      
      results = data.get("results") or []
      if results:
        return results[0].get("geometry", {}).get("location")
      
      return None