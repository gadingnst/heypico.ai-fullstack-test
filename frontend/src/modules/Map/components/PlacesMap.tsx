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
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_EMBED_KEY as string | undefined;
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
      let currentInfoWindow: google.maps.InfoWindow | null = null;

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
          // Create styled info window content
          const placeId = `place-${Math.random().toString(36).substr(2, 9)}`;
          const createInfoContent = (place: PlaceResult) => {
            const rating = place.rating ? `⭐ ${place.rating}` : '';
            const userRatings = place.user_ratings_total ? ` (${place.user_ratings_total} reviews)` : '';
            const priceLevel = place.price_level ? '💰'.repeat(place.price_level) : '';
            const openStatus = place.open_now !== undefined
              ? (place.open_now ? '<span style="color: green;">🟢 Open</span>' : '<span style="color: red;">🔴 Closed</span>')
              : '';

            return `
              <style>
                .gm-style-iw-chr {
                  display: none !important;
                }
              </style>
              <div style="
                max-width: 280px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.4;
                padding-top: 16px;
              ">
                <div style="
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                  margin-bottom: 8px;
                ">
                  <h3 style="
                    margin: 0;
                    font-size: 16px;
                    font-weight: 600;
                    color: #1f2937;
                    flex: 1;
                    padding-right: 8px;
                  ">${place.name || 'Unknown Place'}</h3>
                </div>

                ${place.address ? `
                  <p style="
                    margin: 0 0 8px 0;
                    font-size: 13px;
                    color: #6b7280;
                    line-height: 1.3;
                  ">📍 ${place.address}</p>
                ` : ''}

                <div style="
                  display: flex;
                  flex-wrap: wrap;
                  gap: 12px;
                  margin-bottom: 12px;
                  font-size: 13px;
                ">
                  ${rating ? `
                    <div style="color: #f59e0b; font-weight: 500;">
                      ${rating}${userRatings}
                    </div>
                  ` : ''}

                  ${priceLevel ? `
                    <div style="color: #10b981;">
                      ${priceLevel}
                    </div>
                  ` : ''}

                  ${openStatus ? `
                    <div>
                      ${openStatus}
                    </div>
                  ` : ''}
                </div>

                <div style="
                   margin-top: 12px;
                   display: flex;
                   gap: 8px;
                   align-items: center;
                 ">
                   ${place.directions_url ? `
                     <a href="${place.directions_url}"
                        target="_blank"
                        rel="noopener noreferrer"
                        style="
                          display: inline-block;
                          background: #3b82f6;
                          color: white;
                          padding: 8px 16px;
                          border-radius: 6px;
                          text-decoration: none;
                          font-size: 13px;
                          font-weight: 500;
                          transition: background-color 0.2s;
                        "
                        onmouseover="this.style.backgroundColor='#2563eb'"
                        onmouseout="this.style.backgroundColor='#3b82f6'">
                       🗺️ Get Directions
                     </a>
                   ` : ''}

                   <button
                       id="close-info-btn-${placeId}"
                       style="
                         background: #6b7280;
                         color: white;
                         border: none;
                         padding: 8px 12px;
                         border-radius: 6px;
                         font-size: 13px;
                         font-weight: 500;
                         cursor: pointer;
                         transition: background-color 0.2s;
                       "
                       onmouseover="this.style.backgroundColor='#4b5563'"
                       onmouseout="this.style.backgroundColor='#6b7280'">
                       ✕ Close
                     </button>
                 </div>
              </div>
            `;
          };

          const infoWindow = new google.maps.InfoWindow({
            maxWidth: 300
          });

          // Set content with close button functionality
          const content = createInfoContent(p);
          infoWindow.setContent(content);

          // Add event listener for close button after content is set
          google.maps.event.addListener(infoWindow, 'domready', () => {
            const closeBtn = document.querySelector(`#close-info-btn-${placeId}`);
            if (closeBtn) {
              closeBtn.addEventListener('click', () => {
                infoWindow.close();
                currentInfoWindow = null;
              });
            }
          });

          marker.addListener('click', () => {
            // Close any currently open infoWindow
            if (currentInfoWindow) {
              currentInfoWindow.close();
            }

            // Open new infoWindow and set as current
            infoWindow.open({ anchor: marker, map });
            currentInfoWindow = infoWindow;
          });

          // Handle infoWindow close event
          infoWindow.addListener('closeclick', () => {
            currentInfoWindow = null;
          });
        }
      });

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds);
      }
    });
  }, [places]);

  return <div ref={mapRef} className="w-full h-96 rounded-md" />;
}

export default PlacesMap;
