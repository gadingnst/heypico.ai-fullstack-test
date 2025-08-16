// Types for Google Maps and Places API
export interface LocationBias {
  lat: number;
  lng: number;
  radius_m: number;
}

export interface SearchRequest {
  query: string;
  limit?: number;
  min_rating?: number;
  open_now?: boolean;
  location_name?: string;
  sort_by?: string; // "rating" | "distance"
  place_types?: string[];
  cuisine?: string[];
  location_bias?: LocationBias;
}

export interface Place {
  name: string;
  place_id: string;
  address: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number | string;
  location: {
    lat: number;
    lng: number;
  };
  open_now?: boolean;
  embed_iframe_url: string;
  directions_url: string;
}

export interface SearchResponse {
  query: string;
  results: Place[];
  paging: {
    next_page_token: string | null;
  };
}

export interface ApiError {
  detail: string;
}
