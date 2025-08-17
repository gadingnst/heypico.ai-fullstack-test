import httpx
from typing import List, Optional
from configs.envs import config

class MapService:
    """Service for interacting with Google Maps APIs"""

    @staticmethod
    async def search_places(query: str) -> Optional[List[dict]]:
        """Search for places and return processed results with embed URLs."""
        if not config.GMAPS_SERVER_KEY or not config.GMAPS_EMBED_KEY:
            return None

        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": config.GMAPS_SERVER_KEY,
            "X-Goog-FieldMask": (
                "places.id,places.displayName,places.formattedAddress,places.location,"
                "places.rating,places.userRatingCount,places.priceLevel,places.currentOpeningHours.openNow"
            ),
        }
        payload = {"textQuery": query}
        url = "https://places.googleapis.com/v1/places:searchText"

        async with httpx.AsyncClient() as client:
            try:
                resp = await client.post(url, headers=headers, json=payload, timeout=10)
                resp.raise_for_status()
                data = resp.json()
                places = data.get("places")
                if not places:
                    return None

                results: List[dict] = []
                for place in places:
                    location = place.get("location", {})
                    place_id = place.get("id")
                    rating = place.get("rating")

                    # Convert Google's string price level to integer expected by frontend
                    price_level_str = place.get("priceLevel")
                    price_mapping = {
                        "PRICE_LEVEL_INEXPENSIVE": 1,
                        "PRICE_LEVEL_MODERATE": 2,
                        "PRICE_LEVEL_EXPENSIVE": 3,
                        "PRICE_LEVEL_VERY_EXPENSIVE": 4,
                    }
                    price_level = price_mapping.get(price_level_str)

                    processed = {
                        "name": place.get("displayName", {}).get("text"),
                        "place_id": place_id,
                        "address": place.get("formattedAddress"),
                        "rating": rating,
                        "user_ratings_total": place.get("userRatingCount"),
                        "price_level": price_level,
                        "location": {
                            "lat": location.get("latitude"),
                            "lng": location.get("longitude"),
                        },
                        "open_now": place.get("currentOpeningHours", {}).get("openNow"),
                        "embed_iframe_url": (
                            f"https://www.google.com/maps/embed/v1/place?q=place_id:{place_id}&key={config.GMAPS_EMBED_KEY}"
                            if place_id else None
                        ),
                        "directions_url": (
                            f"https://www.google.com/maps/dir/?api=1&destination=place_id:{place_id}&destination_place_id={place_id}"
                            if place_id else None
                        ),
                    }
                    results.append(processed)

                return results
            except Exception as e:
                print(f"🚨 MapService Error: {e}")
                return None
