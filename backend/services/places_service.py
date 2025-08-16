import httpx
import os
from typing import List, Dict, Any
from pydantic import BaseModel, Field

GMAPS_SERVER_KEY = os.getenv("GMAPS_SERVER_KEY")
GMAPS_EMBED_KEY = os.getenv("GMAPS_EMBED_KEY")

class LocationBias(BaseModel):
  lat: float
  lng: float
  radius_m: int = Field(ge=100, le=50000, default=8000)

class SearchRequest(BaseModel):
  query: str
  limit: int = Field(default=5, ge=1, le=20)
  min_rating: float | None = None
  open_now: bool | None = None
  location_name: str | None = None
  sort_by: str | None = Field(default=None)  # "rating" | "distance"
  place_types: list[str] | None = None
  cuisine: list[str] | None = None
  location_bias: LocationBias | None = None

class PlacesService:
  """
  Service for handling Google Places API operations using the new Places API
  """
  
  @staticmethod
  async def search_places(search_request: SearchRequest, geocoded_location: dict | None = None) -> Dict[str, Any]:
    """
    Search for places using Google Places API (New)
    
    Args:
      search_request: The search request parameters
      geocoded_location: Optional geocoded location coordinates
      
    Returns:
      Dictionary containing search results and metadata
    """
    # Use the new Places API endpoint
    url = "https://places.googleapis.com/v1/places:searchText"
    
    headers = {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GMAPS_SERVER_KEY,
      "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.priceLevel,places.location,places.currentOpeningHours,places.id"
    }
    
    # Build request body for new API
    request_body = {
      "textQuery": search_request.query,
      "maxResultCount": search_request.limit,
      "languageCode": "id",
      "regionCode": "ID"
    }
    
    # Handle location bias
    if search_request.location_bias:
      request_body["locationBias"] = {
        "circle": {
          "center": {
            "latitude": search_request.location_bias.lat,
            "longitude": search_request.location_bias.lng
          },
          "radius": search_request.location_bias.radius_m
        }
      }
    elif geocoded_location:
      request_body["locationBias"] = {
        "circle": {
          "center": {
            "latitude": geocoded_location.get("lat"),
            "longitude": geocoded_location.get("lng")
          },
          "radius": 8000
        }
      }
    
    # Add rating filter if specified
    if search_request.min_rating:
      request_body["minRating"] = search_request.min_rating
    
    # Add open now filter
    if search_request.open_now:
      request_body["openNow"] = True
    
    # Call new Places API
    async with httpx.AsyncClient(timeout=10) as client:
      response = await client.post(url, json=request_body, headers=headers)
      response.raise_for_status()
      data = response.json()
    
    # Process results
    results = PlacesService._process_new_api_results(
      data.get("places", []),
      search_request
    )
    
    return {
      "query": search_request.query,
      "results": results,
      "paging": {"next_page_token": None}  # New API handles pagination differently
    }
  
  @staticmethod
  def _process_new_api_results(raw_results: List[Dict], search_request: SearchRequest) -> List[Dict[str, Any]]:
    """
    Process results from the new Places API
    
    Args:
      raw_results: Raw results from new Places API
      search_request: Original search request for filtering
      
    Returns:
      List of processed results
    """
    results = []
    
    for place in raw_results:
      # Extract place data from new API format
      place_id = place.get("id")
      location = place.get("location", {})
      rating = place.get("rating")
      
      # Apply minimum rating filter (if not already filtered by API)
      if search_request.min_rating and (rating or 0) < search_request.min_rating:
        continue
      
      processed_result = {
        "name": place.get("displayName", {}).get("text"),
        "place_id": place_id,
        "address": place.get("formattedAddress"),
        "rating": rating,
        "user_ratings_total": place.get("userRatingCount"),
        "price_level": place.get("priceLevel"),
        "location": {
          "lat": location.get("latitude"),
          "lng": location.get("longitude")
        },
        "open_now": place.get("currentOpeningHours", {}).get("openNow"),
        "embed_iframe_url": f"https://www.google.com/maps/embed/v1/place?q=place_id:{place_id}&key={GMAPS_EMBED_KEY}",
        "directions_url": f"https://www.google.com/maps/dir/?api=1&destination=place_id:{place_id}&destination_place_id={place_id}"
      }
      
      results.append(processed_result)
    
    # Sort results if needed
    if search_request.sort_by != "distance":  # New API can sort by distance natively
      results.sort(
        key=lambda x: ((x.get("rating") or 0), (x.get("user_ratings_total") or 0)),
        reverse=True
      )
    
    return results