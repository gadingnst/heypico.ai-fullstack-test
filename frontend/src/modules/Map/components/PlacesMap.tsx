import { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import type { PlaceResult } from '@/modules/AIChat/AIChat.api';

interface PlacesMapProps {
  places: PlaceResult[];
}

/**
 * Displays a Google Map with markers for provided places.
 * Each marker opens an info window linking to Google Maps directions.
 */
function PlacesMap({ places }: PlacesMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
    if (!mapRef.current || !apiKey || places.length === 0) {
      return;
    }

    const loader = new Loader({ apiKey, version: 'weekly' });

    loader.load().then(() => {
      if (!mapRef.current) {
        return;
      }

      const firstLocation = places[0].location;
      const map = new google.maps.Map(mapRef.current, {
        center: firstLocation
          ? { lat: firstLocation.lat ?? 0, lng: firstLocation.lng ?? 0 }
          : { lat: 0, lng: 0 },
        zoom: 13
      });

      const bounds = new google.maps.LatLngBounds();

      places.forEach((p) => {
        if (!p.location) return;
        const position = { lat: p.location.lat ?? 0, lng: p.location.lng ?? 0 };
        bounds.extend(position);

        const marker = new google.maps.Marker({
          position,
          map,
          title: p.name
        });

        if (p.name || p.directions_url) {
          const infoWindow = new google.maps.InfoWindow({
            content: `<div>${p.name ? `<strong>${p.name}</strong><br/>` : ''}${p.directions_url ? `<a href="${p.directions_url}" target="_blank" rel="noopener noreferrer">Directions</a>` : ''}</div>`
          });
          marker.addListener('click', () => {
            infoWindow.open({ anchor: marker, map });
          });
        }
      });

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds);
      }
    });
  }, [places]);

  return <div ref={mapRef} className="w-full h-64 rounded-md" />;
}

export default PlacesMap;
