import { useState } from 'react';
import type { SearchRequest, LocationBias } from '../types';

interface SearchFormProps {
  onSearch: (searchRequest: SearchRequest) => void;
  isLoading?: boolean;
}

/**
 * Search form component for place queries
 */
const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading = false }) => {
  const [query, setQuery] = useState('');
  const [useLocationBias, setUseLocationBias] = useState(false);
  const [locationBias, setLocationBias] = useState<LocationBias>({
    lat: -6.2088,
    lng: 106.8456,
    radius_m: 5000,
  });

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const searchRequest: SearchRequest = {
      query: query.trim(),
      limit: 10,
      ...(useLocationBias && { location_bias: locationBias }),
    };

    onSearch(searchRequest);
  };

  /**
   * Handle location bias input changes
   */
  const handleLocationBiasChange = (field: keyof LocationBias, value: number) => {
    setLocationBias(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Get current location using browser geolocation
   */
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationBias({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          radius_m: locationBias.radius_m,
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your current location. Please enter coordinates manually.');
      }
    );
  };

  return (
    <div className="bg-base-100 shadow-lg rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Search Query */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">What are you looking for?</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g., restaurants, coffee shops, gas stations..."
              className="input input-bordered w-full pr-12"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 btn btn-sm btn-primary"
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                '🔍'
              )}
            </button>
          </div>
        </div>

        {/* Location Bias Toggle */}
        <div className="form-control">
          <label className="label cursor-pointer justify-start gap-3">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={useLocationBias}
              onChange={(e) => setUseLocationBias(e.target.checked)}
              disabled={isLoading}
            />
            <span className="label-text">Search near a specific location</span>
          </label>
        </div>

        {/* Location Bias Settings */}
        {useLocationBias && (
          <div className="bg-base-200 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-medium text-sm">Location Settings</h4>
              <button
                type="button"
                onClick={getCurrentLocation}
                className="btn btn-xs btn-outline"
                disabled={isLoading}
              >
                📍 Use My Location
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Latitude */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs">Latitude</span>
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="-6.2088"
                  className="input input-bordered input-sm"
                  value={locationBias.lat}
                  onChange={(e) => handleLocationBiasChange('lat', parseFloat(e.target.value) || 0)}
                  disabled={isLoading}
                />
              </div>

              {/* Longitude */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs">Longitude</span>
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="106.8456"
                  className="input input-bordered input-sm"
                  value={locationBias.lng}
                  onChange={(e) => handleLocationBiasChange('lng', parseFloat(e.target.value) || 0)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Radius */}
            <div className="form-control">
              <label className="label">
                <span className="label-text text-xs">Search Radius (meters)</span>
                <span className="label-text-alt">{(locationBias.radius_m / 1000).toFixed(1)} km</span>
              </label>
              <input
                type="range"
                min="500"
                max="50000"
                step="500"
                className="range range-primary range-sm"
                value={locationBias.radius_m}
                onChange={(e) => handleLocationBiasChange('radius_m', parseInt(e.target.value))}
                disabled={isLoading}
              />
              <div className="w-full flex justify-between text-xs px-2 text-base-content/60">
                <span>0.5km</span>
                <span>25km</span>
                <span>50km</span>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="btn btn-primary w-full"
        >
          {isLoading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              Searching...
            </>
          ) : (
            '🔍 Search Places'
          )}
        </button>
      </form>
    </div>
  );
};

export default SearchForm;