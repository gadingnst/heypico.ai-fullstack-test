import { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import type { Place } from '../types';

interface GoogleMapEmbedProps {
  places: Place[];
}

/**
 * Google Map embed component for displaying places in chat
 */
function GoogleMapEmbed({ places }: GoogleMapEmbedProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    if (!places.length || !mapRef.current) return;

    const initMap = async () => {
      const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
        version: 'weekly',
        libraries: ['places'],
      });

      try {
        await loader.load();

        // Calculate center and bounds
        const bounds = new google.maps.LatLngBounds();
        places.forEach(place => {
          bounds.extend(new google.maps.LatLng(place.location.lat, place.location.lng));
        });

        const center = bounds.getCenter();

        // Create map
        const map = new google.maps.Map(mapRef.current!, {
          center: center || { lat: places[0].location.lat, lng: places[0].location.lng },
          zoom: 13,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }],
            },
          ],
        });

        mapInstanceRef.current = map;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        // Add markers for each place
        places.forEach((place, index) => {
          const marker = new google.maps.Marker({
            position: { lat: place.location.lat, lng: place.location.lng },
            map: map,
            title: place.name,
            label: {
              text: (index + 1).toString(),
              color: 'white',
              fontWeight: 'bold',
            },
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 20,
              fillColor: '#3B82F6',
              fillOpacity: 1,
              strokeColor: 'white',
              strokeWeight: 2,
            },
          });

          // Info window
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div class="p-2">
                <h3 class="font-bold text-lg">${place.name}</h3>
                <p class="text-sm text-gray-600 mb-2">${place.address}</p>
                ${place.rating ? `<p class="text-sm">⭐ ${place.rating} (${place.user_ratings_total || 0} reviews)</p>` : ''}
                <div class="mt-2 space-x-2">
                  <a href="${place.directions_url}" target="_blank" class="text-blue-600 hover:underline text-sm">📍 Directions</a>
                </div>
              </div>
            `,
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });

          markersRef.current.push(marker);
        });

        // Fit map to show all markers
        if (places.length > 1) {
          map.fitBounds(bounds);
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initMap();

    return () => {
      // Cleanup markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, [places]);

  if (!places.length) {
    return null;
  }

  return (
    <div className="mt-3">
      <div className="text-sm font-semibold mb-2 text-base-content/80">
        📍 {places.length} lokasi ditemukan:
      </div>
      <div className="bg-base-300 rounded-lg overflow-hidden">
        <div 
          ref={mapRef} 
          className="w-full h-64"
          style={{ minHeight: '256px' }}
        />
      </div>
      <div className="mt-2 space-y-1">
        {places.slice(0, 3).map((place, index) => (
          <div key={place.place_id} className="text-xs bg-base-200 rounded p-2">
            <span className="font-semibold">{index + 1}. {place.name}</span>
            {place.rating && (
              <span className="ml-2 text-warning">⭐ {place.rating}</span>
            )}
          </div>
        ))}
        {places.length > 3 && (
          <div className="text-xs text-base-content/60 text-center py-1">
            +{places.length - 3} lokasi lainnya di peta
          </div>
        )}
      </div>
    </div>
  );
}

export default GoogleMapEmbed;