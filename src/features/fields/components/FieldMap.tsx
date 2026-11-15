import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Field } from '../../../types/index';

interface FieldMapProps {
  latitude?: number;
  longitude?: number;
  onChangeLocation?: (lat: number, lng: number) => void;
  interactive?: boolean;
  otherFields?: Field[];
  height?: string;
  className?: string;
}

// Custom crisp SVG icons using brand colors (no broken asset paths in bundler)
const createPinIcon = (color: string, label?: string) => {
  return L.divIcon({
    className: 'custom-field-pin',
    html: `
      <div style="position: relative; width: 32px; height: 42px; transform: translate(-50%, -100%);">
        <svg viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 10.5 16 26 16 26s16-15.5 16-26c0-8.837-7.163-16-16-16z" fill="${color}"/>
          <circle cx="16" cy="16" r="6" fill="#FFFFFF"/>
        </svg>
        ${
          label
            ? `<div style="position: absolute; top: -20px; left: 50%; transform: translateX(-50%); background: #0F172A; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; white-space: nowrap; font-weight: 500;">${label}</div>`
            : ''
        }
      </div>
    `,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  });
};

const activePinIcon = createPinIcon('#1B4332'); // Forest Green
const fieldPinIcon = createPinIcon('#2D6A4F'); // Secondary Forest Green

export const FieldMap: React.FC<FieldMapProps> = ({
  latitude = 7.8731, // Default Sri Lanka center
  longitude = 80.7718,
  onChangeLocation,
  interactive = true,
  otherFields = [],
  height = '400px',
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const activeMarkerRef = useRef<L.Marker | null>(null);
  const otherMarkersRef = useRef<L.Marker[]>([]);

  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = latitude || 7.8731;
    const initialLng = longitude || 80.7718;
    const initialZoom = latitude && longitude && (latitude !== 7.8731 || longitude !== 80.7718) ? 13 : 8;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update active marker & handle interactivity
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (interactive && onChangeLocation) {
      // Map click handler
      const handleMapClick = (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        onChangeLocation(
          parseFloat(lat.toFixed(6)),
          parseFloat(lng.toFixed(6)),
        );
      };

      map.on('click', handleMapClick);

      return () => {
        map.off('click', handleMapClick);
      };
    }
  }, [interactive, onChangeLocation]);

  // Position active marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (latitude && longitude) {
      if (!activeMarkerRef.current) {
        const marker = L.marker([latitude, longitude], {
          icon: activePinIcon,
          draggable: interactive,
        }).addTo(map);

        if (interactive && onChangeLocation) {
          marker.on('dragend', () => {
            const pos = marker.getLatLng();
            onChangeLocation(
              parseFloat(pos.lat.toFixed(6)),
              parseFloat(pos.lng.toFixed(6)),
            );
          });
        }

        activeMarkerRef.current = marker;
      } else {
        activeMarkerRef.current.setLatLng([latitude, longitude]);
        activeMarkerRef.current.setIcon(activePinIcon);
      }
    } else if (activeMarkerRef.current) {
      activeMarkerRef.current.remove();
      activeMarkerRef.current = null;
    }
  }, [latitude, longitude, interactive, onChangeLocation]);

  // Render other fields markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    otherMarkersRef.current.forEach((m) => m.remove());
    otherMarkersRef.current = [];

    otherFields.forEach((field) => {
      if (field.latitude === latitude && field.longitude === longitude) {
        // Skip current active field to avoid overlap
        return;
      }

      const marker = L.marker([field.latitude, field.longitude], {
        icon: fieldPinIcon,
      }).addTo(map);

      const areaText = field.area ? `<br/>Area: ${field.area} ${field.areaUnit || 'ha'}` : '';
      const locationText = field.district || field.village ? `<br/>${[field.village, field.district].filter(Boolean).join(', ')}` : '';

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 13px;">
          <strong style="color: #1B4332; font-size: 14px;">${field.name}</strong>
          ${locationText}
          ${areaText}
          <br/><span style="color: #64748B; font-size: 11px;">${field.latitude.toFixed(4)}, ${field.longitude.toFixed(4)}</span>
        </div>
      `);

      otherMarkersRef.current.push(marker);
    });
  }, [otherFields, latitude, longitude]);

  // "Use my location" browser geolocation handler
  const handleUseMyLocation = useCallback(() => {
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const lng = parseFloat(position.coords.longitude.toFixed(6));

        if (onChangeLocation) {
          onChangeLocation(lat, lng);
        }

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 14, { animate: true });
        }

        setGeoLoading(false);
      },
      (error) => {
        setGeoLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError(
            'Location permission denied. Please allow location access or select your field on the map.',
          );
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setGeoError(
            'Location information is unavailable. Please select your field on the map.',
          );
        } else if (error.code === error.TIMEOUT) {
          setGeoError(
            'The request to get your location timed out. Please try again or click the map.',
          );
        } else {
          setGeoError('An unknown error occurred while retrieving location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      },
    );
  }, [onChangeLocation]);

  return (
    <div className={`relative rounded-[20px] overflow-hidden border border-slate-200 shadow-sm ${className}`}>
      {/* Controls Overlay */}
      {interactive && (
        <div className="absolute top-3 right-3 z-[1000] flex flex-col space-y-2">
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={geoLoading}
            className="min-h-[44px] px-3.5 py-2 bg-white/95 backdrop-blur text-[#1B4332] rounded-xl shadow-md font-medium text-xs flex items-center space-x-1.5 border border-slate-200 hover:bg-[#F3F7F4] transition-all disabled:opacity-50"
            title="Use current device location"
          >
            {geoLoading ? (
              <span className="w-4 h-4 border-2 border-[#1B4332] border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            )}
            <span>Use My Location</span>
          </button>
        </div>
      )}

      {/* Geolocation Denial / Error Notice */}
      {geoError && (
        <div className="absolute top-16 left-3 right-3 z-[1000] bg-amber-50/95 border border-amber-300 text-amber-800 p-2.5 rounded-xl text-xs flex items-center justify-between shadow-md">
          <span>{geoError}</span>
          <button
            type="button"
            onClick={() => setGeoError(null)}
            className="ml-2 font-bold text-amber-900 hover:underline px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        style={{ height, width: '100%' }}
        className="z-0 bg-slate-100"
      />

      {/* Map Footer Note */}
      <div className="bg-white/90 border-t border-slate-100 px-3 py-1.5 text-[11px] text-[#64748B] flex items-center justify-between">
        <span>Click or drag pin to adjust coordinates</span>
        <span>Map: © OpenStreetMap</span>
      </div>
    </div>
  );
};
