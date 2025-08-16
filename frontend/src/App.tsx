import { useState } from 'react';
import SearchForm from './components/SearchForm';
import GoogleMap from './components/GoogleMap';
import PlaceCard from './components/PlaceCard';
import { apiService } from './services/api';
import type { SearchRequest, Place, SearchResponse } from './types';

/**
 * Main application component for place search with map integration
 */
function App() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: -6.2088, lng: 106.8456 });

  /**
   * Handle search form submission
   */
  const handleSearch = async (searchRequest: SearchRequest) => {
    setIsLoading(true);
    setError(null);
    setSelectedPlace(null);

    try {
      const response: SearchResponse = await apiService.searchPlaces(searchRequest);
      setPlaces(response.places || []);

      // Update map center if location bias is provided
      if (searchRequest.location_bias) {
        setMapCenter({
          lat: searchRequest.location_bias.lat,
          lng: searchRequest.location_bias.lng,
        });
      }

      // If places found, center map on first place
      if (response.places && response.places.length > 0) {
        const firstPlace = response.places[0];
        setMapCenter({
          lat: firstPlace.location.lat,
          lng: firstPlace.location.lng,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search places');
      setPlaces([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle place selection from list
   */
  const handlePlaceSelect = (place: Place) => {
    setSelectedPlace(place);
    setMapCenter({
      lat: place.location.lat,
      lng: place.location.lng,
    });
  };

  /**
   * Handle place click from map
   */
  const handleMapPlaceClick = (place: Place) => {
    setSelectedPlace(place);
    // Scroll to the place card
    const placeElement = document.getElementById(`place-${place.place_id}`);
    if (placeElement) {
      placeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="bg-base-100 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary mb-2">
              🗺️ Places Finder
            </h1>
            <p className="text-base-content/70">
              Discover amazing places around you with Google Maps integration
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search and Results Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search Form */}
            <SearchForm onSearch={handleSearch} isLoading={isLoading} />

            {/* Error Display */}
            {error && (
              <div className="alert alert-error">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex justify-center py-8">
                <div className="loading loading-spinner loading-lg"></div>
              </div>
            )}

            {/* Results */}
            {!isLoading && places.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Search Results</h2>
                  <span className="badge badge-primary">{places.length} places</span>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {places.map((place) => (
                    <div
                      key={place.place_id}
                      id={`place-${place.place_id}`}
                      className={`transition-all duration-200 ${
                        selectedPlace?.place_id === place.place_id
                          ? 'ring-2 ring-primary ring-offset-2'
                          : ''
                      }`}
                    >
                      <PlaceCard
                        place={place}
                        onViewOnMap={() => handlePlaceSelect(place)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {!isLoading && places.length === 0 && !error && (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium mb-2">Ready to explore?</h3>
                <p className="text-base-content/60">
                  Enter a search query above to find amazing places near you!
                </p>
              </div>
            )}
          </div>

          {/* Map Panel */}
          <div className="lg:col-span-2">
            <div className="bg-base-100 rounded-lg shadow-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Map View</h2>
                {selectedPlace && (
                  <div className="text-sm text-base-content/70">
                    Selected: <span className="font-medium">{selectedPlace.name}</span>
                  </div>
                )}
              </div>

              <GoogleMap
                places={places}
                center={mapCenter}
                zoom={places.length > 0 ? 14 : 12}
                onPlaceClick={handleMapPlaceClick}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-base-100 border-t border-base-300 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-base-content/60">
            <p>Powered by Google Maps API • Built with React + Tailwind CSS + DaisyUI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
