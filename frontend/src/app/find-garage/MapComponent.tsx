'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Garage {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  address?: string;
  phone?: string;
  website?: string;
}

interface MapComponentProps {
  userLocation: {lat: number, lng: number} | null;
  garages: Garage[];
  loading: boolean;
}

export default function MapComponent({ userLocation, garages, loading }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([40.7128, -74.0060], 13);

      // Add OpenStreetMap tiles (free)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);

      // Initialize markers layer
      markersRef.current = L.layerGroup().addTo(mapInstanceRef.current);
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !markersRef.current) return;

    // Clear existing markers
    markersRef.current.clearLayers();

    // Add user location marker
    if (userLocation) {
      const userIcon = L.divIcon({
        html: `
          <div style="
            background-color: #f87171;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>
        `,
        className: 'custom-user-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .bindPopup('<b>Your Location</b>')
        .addTo(markersRef.current);

      // Center map on user location
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 13);
    }

    // Add garage markers
    garages.forEach((garage) => {
      if (!garage.lat || !garage.lng) return;

      // Create custom icon based on garage type
      const getMarkerColor = (type: string) => {
        switch (type) {
          case 'Auto Repair': return '#ef4444'; // red
          case 'Petrol Station': return '#3b82f6'; // blue
          case 'Car Dealership': return '#10b981'; // green
          case 'Parking Garage': return '#8b5cf6'; // purple
          case 'Tyre Workshop': return '#f59e0b'; // amber
          case 'Parts Store': return '#06b6d4'; // cyan
          case 'Car Wash': return '#84cc16'; // lime
          default: return '#6b7280'; // gray
        }
      };

      const garageIcon = L.divIcon({
        html: `
          <div style="
            background-color: ${getMarkerColor(garage.type)};
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>
        `,
        className: 'custom-garage-marker',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1f2937;">${garage.name}</h3>
          <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">${garage.type}</p>
          ${garage.address ? `<p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px;">📍 ${garage.address}</p>` : ''}
          ${garage.phone ? `<p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px;">📞 ${garage.phone}</p>` : ''}
          <div style="display: flex; gap: 8px; margin-top: 8px;">
            <button onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${garage.lat},${garage.lng}', '_blank')" 
                    style="background: #f87171; color: white; border: none; padding: 4px 8px; border-radius: 4px; font-size: 12px; cursor: pointer;">
              Directions
            </button>
            <button style="background: #e5e7eb; color: #374151; border: none; padding: 4px 8px; border-radius: 4px; font-size: 12px; cursor: pointer;">
              Contact
            </button>
          </div>
        </div>
      `;

      L.marker([garage.lat, garage.lng], { icon: garageIcon })
        .bindPopup(popupContent)
        .addTo(markersRef.current!);
    });

    // Fit map to show all markers if we have garages
    if (garages.length > 0 && userLocation) {
      const group = new L.FeatureGroup([
        ...garages.map(garage => L.marker([garage.lat, garage.lng])),
        L.marker([userLocation.lat, userLocation.lng])
      ]);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [userLocation, garages]);

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        className="w-full h-96 rounded-lg"
        style={{ minHeight: '400px' }}
      />
      
      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-400"></div>
            <span className="text-slate-600">Searching for garages...</span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <h4 className="font-semibold text-sm text-slate-900 mb-2">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded-full border border-white"></div>
            <span>Your Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full border border-white"></div>
            <span>Auto Repair</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full border border-white"></div>
            <span>Petrol Station</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full border border-white"></div>
            <span>Tyre Workshop</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-500 rounded-full border border-white"></div>
            <span>Parts Store</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-lime-500 rounded-full border border-white"></div>
            <span>Car Wash</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full border border-white"></div>
            <span>Car Dealership</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full border border-white"></div>
            <span>Parking</span>
          </div>
        </div>
      </div>
    </div>
  );
}
