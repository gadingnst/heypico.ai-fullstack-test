from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from services.places_service import PlacesService, SearchRequest
from services.geocoding_service import GeocodingService

app = FastAPI()

app.add_middleware(
  CORSMiddleware,
  allow_origins=[os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

BACKEND_BEARER = os.getenv("BACKEND_BEARER", "change_me")

@app.get("/healthz")
async def healthz():
  return {"ok": True}

@app.post("/v1/places/search")
async def search_places(body: SearchRequest, authorization: str = Header(None)):
  if authorization != f"Bearer {BACKEND_BEARER}":
    raise HTTPException(status_code=401, detail="unauthorized")

  # Geocode location if location_name is provided but no location_bias
  geocoded_location = None
  if body.location_name and not body.location_bias:
    geocoded_location = await GeocodingService.geocode_location(body.location_name)

  # Search for places using the places service
  return await PlacesService.search_places(body, geocoded_location)
