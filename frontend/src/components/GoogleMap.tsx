/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from 'react';
import type { Place } from '../types';

// Google Maps type declarations
type GoogleMap = any;
type GoogleMarker = any;
type GoogleInfoWindow = any;
type GoogleLatLngBounds = any;

declare global {
  interface Window {
    google: {
      maps: {
        Map: new (element: HTMLElement, options: Record<string, unknown>) => GoogleMap;
        Marker: new (options: Record<string, unknown>) => GoogleMarker;
        InfoWindow: new (options: Record<string, unknown>) => GoogleInfoWindow;
        LatLngBounds: new () => GoogleLatLngBounds;
        Animation: { DROP: unknown };
        event: {
          addListener: (instance: unknown, event: string, handler: () => void) => unknown;
          removeListener: (listener: unknown) => void;
        };
      };
    };
  }
}

interface GoogleMapProps {
  places: Place[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onPlaceClick?: (place: Place) => void;
}

/**
 * Google Maps component for displaying places with markers
 */
const GoogleMap: React.FC<GoogleMapProps> = ({
  places,
  center = { lat: -6.2088, lng: 106.8456 }, // Default to Jakarta
  zoom = 12,
  onPlaceClick,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<GoogleMap | null>(null);
  const [markers, setMarkers] = useState<GoogleMarker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Google Maps
  useEffect(() => {
    const initializeMap = async () => {
      try {
        // Check if Google Maps is already loaded
        if (typeof window.google !== 'undefined' && window.google.maps) {
          createMap();
          return;
        }

        // Load Google Maps API
        const script = document.createElement('script');
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
          throw new Error('Google Maps API key is not configured');
        }

        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
          createMap();
        };

        script.onerror = () => {
          setError('Failed to load Google Maps API');
        };

        document.head.appendChild(script);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize map');
      }
    };

    const createMap = () => {
      if (!mapRef.current) return;

      const google = window.google;
      const mapInstance = new google.maps.Map(mapRef.current, {
        center,
        zoom,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }],
          },
        ],
      });

      setMap(mapInstance);
      setIsLoaded(true);
    };

    initializeMap();
  }, [center, zoom]);

  // Update markers when places change
  useEffect(() => {
    if (!map || !isLoaded) return;

    const google = window.google;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    // Create new markers
    const newMarkers = places.map((place) => {
      const marker = new google.maps.Marker({
        position: {
          lat: place.location.lat,
          lng: place.location.lng,
        },
        map,
        title: place.name,
        animation: google.maps.Animation.DROP,
      });

      // Add click listener
      marker.addListener('click', () => {
        if (onPlaceClick) {
          onPlaceClick(place);
        }

        // Create info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-bold text-lg">${place.name}</h3>
              <p class="text-sm text-gray-600">${place.address}</p>
              ${place.rating ? `<p class="text-sm">⭐ ${place.rating} (${place.user_ratings_total || 0} reviews)</p>` : ''}
              ${place.directions_url ? `<a href="${place.directions_url}" target="_blank" class="text-blue-500 hover:underline">Get Directions</a>` : ''}
            </div>
          `,
        });

        infoWindow.open(map, marker);
      });

      return marker;
    });

    setMarkers(newMarkers);

    // Adjust map bounds to fit all markers
    if (newMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      newMarkers.forEach(marker => {
        const position = marker.getPosition();
        if (position) {
          bounds.extend(position);
        }
      });
      map.fitBounds(bounds);

      // Ensure minimum zoom level
      const listener = google.maps.event.addListener(map, 'bounds_changed', () => {
        if (map.getZoom() && map.getZoom() > 15) {
          map.setZoom(15);
        }
        google.maps.event.removeListener(listener);
      });
    }
  }, [map, places, isLoaded, onPlaceClick]);

  if (error) {
    return (
      <div className="map-container flex items-center justify-center bg-error/10 border border-error/20">
        <div className="text-center">
          <div className="text-error text-lg mb-2">⚠️</div>
          <p className="text-error font-medium">Map Error</p>
          <p className="text-error/70 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={mapRef} className="map-container" />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-base-200/50">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      )}
    </div>
  );
};

export default GoogleMap;
