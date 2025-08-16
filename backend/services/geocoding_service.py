import httpx
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

GMAPS_SERVER_KEY = os.getenv("GMAPS_SERVER_KEY")

class GeocodingService:
  """
  Service for handling geocoding operations using Google Maps API
  """

  @staticmethod
  async def geocode_location(location_name: str) -> dict | None:
    """
    Geocode a location name to get latitude and longitude coordinates using Google Maps API

    Args:
      location_name: The location name to geocode

    Returns:
      Dictionary with lat/lng coordinates or None if not found
    """
    logger.info(f"🔍 Geocoding location: '{location_name}'")

    try:
      async with httpx.AsyncClient(timeout=10) as client:
        params = {
          "address": location_name,
          "language": "id",
          "key": GMAPS_SERVER_KEY
        }

        logger.info(f"📡 Geocoding API request params: {params}")

        response = await client.get(
          "https://maps.googleapis.com/maps/api/geocode/json",
          params=params
        )
        response.raise_for_status()
        data = response.json()

        logger.info(f"📍 Geocoding API response status: {data.get('status')}")
        logger.info(f"📍 Geocoding API results count: {len(data.get('results', []))}")

        if data["status"] == "OK" and data["results"]:
          result = data["results"][0]
          location = result["geometry"]["location"]
          formatted_address = result["formatted_address"]
          logger.info(f"✅ Geocoding successful: {formatted_address} -> {location}")
          return location
        else:
          logger.warning(f"❌ Geocoding failed: No results found for '{location_name}'")
          logger.warning(f"❌ Full API response: {data}")
          return None

    except Exception as e:
      logger.error(f"❌ Geocoding error for '{location_name}': {str(e)}")
      return None
