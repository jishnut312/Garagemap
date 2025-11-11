'use client';

import { useEffect, useRef } from 'react';

interface Mechanic {
  id: number;
  name: string;
  workshop_name: string;
  latitude: number;
  longitude: number;
  services: string[];
  rating: number;
  is_open: boolean;
}

interface SimpleMapProps {
  mechanics: Mechanic[];
  userLocation?: { lat: number; lng: number };
  onMechanicClick?: (mechanic: Mechanic) => void;
}

export default function SimpleMap({ mechanics, userLocation, onMechanicClick }: SimpleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // This is a placeholder for map integration
    // In a real implementation, you would initialize Google Maps or Leaflet here
    console.log('Map would be initialized with:', { mechanics, userLocation });
  }, [mechanics, userLocation]);

  return (
    <div className="w-full h-96 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4">🗺️</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Interactive Map</h3>
        <p className="text-gray-500 mb-4">
          Map will show {mechanics.length} mechanics near you
        </p>
        {userLocation && (
          <p className="text-sm text-gray-400">
            Your location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </p>
        )}
        <div className="mt-4 space-y-2">
          {mechanics.slice(0, 3).map((mechanic) => (
            <div
              key={mechanic.id}
              className="bg-white p-2 rounded border cursor-pointer hover:bg-gray-50"
              onClick={() => onMechanicClick?.(mechanic)}
            >
              <div className="text-sm font-medium">{mechanic.name}</div>
              <div className="text-xs text-gray-500">{mechanic.workshop_name}</div>
            </div>
          ))}
          {mechanics.length > 3 && (
            <div className="text-xs text-gray-400">
              +{mechanics.length - 3} more mechanics
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
