'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-slate-100 rounded-lg flex items-center justify-center">
      <div className="text-slate-600">Loading map...</div>
    </div>
  )
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

export default function FindGaragePage() {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [garages, setGarages] = useState<Garage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchRadius, setSearchRadius] = useState(5000); // 5km default

  // Get user's current location
  const getCurrentLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          searchNearbyGarages(location.lat, location.lng);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to a sample location (you can change this)
          const defaultLocation = { lat: 40.7128, lng: -74.0060 }; // New York
          setUserLocation(defaultLocation);
          searchNearbyGarages(defaultLocation.lat, defaultLocation.lng);
        }
      );
    } else {
      console.error('Geolocation is not supported');
      setLoading(false);
    }
  };

  // Search for nearby garages using Overpass API (free)
  const searchNearbyGarages = async (lat: number, lng: number) => {
    try {
      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["shop"="car_repair"](around:${searchRadius},${lat},${lng});
          node["amenity"="fuel"](around:${searchRadius},${lat},${lng});
          node["shop"="car"](around:${searchRadius},${lat},${lng});
          node["amenity"="parking"](around:${searchRadius},${lat},${lng});
          node["craft"="car_repair"](around:${searchRadius},${lat},${lng});
          node["shop"="tyres"](around:${searchRadius},${lat},${lng});
          node["shop"="car_parts"](around:${searchRadius},${lat},${lng});
          node["amenity"="car_wash"](around:${searchRadius},${lat},${lng});
          way["shop"="car_repair"](around:${searchRadius},${lat},${lng});
          way["amenity"="fuel"](around:${searchRadius},${lat},${lng});
          way["craft"="car_repair"](around:${searchRadius},${lat},${lng});
          way["shop"="tyres"](around:${searchRadius},${lat},${lng});
          way["shop"="car_parts"](around:${searchRadius},${lat},${lng});
          way["amenity"="car_wash"](around:${searchRadius},${lat},${lng});
        );
        out center;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: overpassQuery,
        headers: {
          'Content-Type': 'text/plain',
        },
      });

      const data = await response.json();
      
      const foundGarages: Garage[] = data.elements.map((element: any, index: number) => ({
        id: element.id?.toString() || index.toString(),
        name: element.tags?.name || getBusinessTypeName(element.tags),
        lat: element.lat || element.center?.lat,
        lng: element.lon || element.center?.lon,
        type: getBusinessType(element.tags),
        address: element.tags?.['addr:full'] || element.tags?.['addr:street'],
        phone: element.tags?.phone,
        website: element.tags?.website,
      })).filter((garage: Garage) => garage.lat && garage.lng);

      setGarages(foundGarages);
    } catch (error) {
      console.error('Error fetching garages:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBusinessType = (tags: any) => {
    if (tags?.shop === 'car_repair' || tags?.craft === 'car_repair') return 'Auto Repair';
    if (tags?.amenity === 'fuel') return 'Petrol Station';
    if (tags?.shop === 'car') return 'Car Dealership';
    if (tags?.amenity === 'parking') return 'Parking Garage';
    if (tags?.shop === 'tyres') return 'Tyre Workshop';
    if (tags?.shop === 'car_parts') return 'Parts Store';
    if (tags?.amenity === 'car_wash') return 'Car Wash';
    return 'Automotive Service';
  };

  const getBusinessTypeName = (tags: any) => {
    if (tags?.shop === 'car_repair' || tags?.craft === 'car_repair') return 'Auto Repair Workshop';
    if (tags?.amenity === 'fuel') return 'Petrol Station';
    if (tags?.shop === 'car') return 'Car Dealership';
    if (tags?.amenity === 'parking') return 'Parking Garage';
    if (tags?.shop === 'tyres') return 'Tyre Workshop';
    if (tags?.shop === 'car_parts') return 'Auto Parts Store';
    if (tags?.amenity === 'car_wash') return 'Car Wash Service';
    return 'Automotive Business';
  };

  // Open directions to garage
  const openDirections = (lat: number, lng: number) => {
    // Try to open in Google Maps app first, fallback to web
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    const appleMapsUrl = `http://maps.apple.com/?daddr=${lat},${lng}`;
    
    // Detect if on mobile
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isMobile && isIOS) {
      // Try Apple Maps first on iOS
      window.open(appleMapsUrl, '_blank');
    } else {
      // Use Google Maps for all other cases
      window.open(googleMapsUrl, '_blank');
    }
  };

  // Contact garage function
  const contactGarage = (garage: Garage) => {
    if (garage.phone) {
      // If phone number exists, offer to call
      const cleanPhone = garage.phone.replace(/[^\d+]/g, '');
      if (confirm(`Call ${garage.name} at ${garage.phone}?`)) {
        window.open(`tel:${cleanPhone}`, '_self');
      }
    } else if (garage.website) {
      // If website exists, open it
      window.open(garage.website, '_blank');
    } else {
      // Fallback: Search for the business online
      const searchQuery = encodeURIComponent(`${garage.name} ${garage.type} contact`);
      window.open(`https://www.google.com/search?q=${searchQuery}`, '_blank');
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-slate-900/95 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-400 rounded-xl flex items-center justify-center">
                <span className="text-white font-semibold text-lg">G</span>
              </div>
              <span className="text-2xl font-semibold text-white tracking-tight">GarageMap</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-slate-300 hover:text-white font-medium transition-colors">Home</a>
              <a href="/find-garage" className="text-white font-medium">Garages</a>
              <a href="/services" className="text-slate-300 hover:text-white font-medium transition-colors">Services</a>
              <a href="/login" className="text-slate-300 hover:text-white font-medium transition-colors">Login</a>
              <a href="/emergency" className="bg-red-500 text-white px-4 py-2 rounded-full font-medium hover:bg-red-600 transition-all duration-300 flex items-center gap-2 animate-pulse">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Emergency
              </a>
              <a href="/signup" className="bg-red-400 text-white px-6 py-2.5 rounded-full font-medium hover:bg-red-500 transition-all duration-300">Get Started</a>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="text-slate-300 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Find Nearest Garages & Workshops</h1>
          <p className="text-xl text-slate-600">Discover automotive services, workshops, and repair facilities near your location</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={getCurrentLocation}
                disabled={loading}
                className="bg-red-400 text-white px-6 py-3 rounded-full font-medium hover:bg-red-500 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {loading ? 'Searching...' : 'Find My Location'}
              </button>
              
              <select
                value={searchRadius}
                onChange={(e) => setSearchRadius(Number(e.target.value))}
                className="border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                <option value={1000}>1 km radius</option>
                <option value={2000}>2 km radius</option>
                <option value={5000}>5 km radius</option>
                <option value={10000}>10 km radius</option>
                <option value={20000}>20 km radius</option>
              </select>
            </div>
            
            <div className="text-slate-600">
              Found {garages.length} automotive services
            </div>
          </div>
        </div>

        {/* Map and Results */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <MapComponent 
                userLocation={userLocation}
                garages={garages}
                loading={loading}
              />
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900">Nearby Services</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {garages.map((garage) => (
                <div key={garage.id} className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                  <h4 className="font-semibold text-slate-900">{garage.name}</h4>
                  <p className="text-sm text-slate-600 mb-2">{garage.type}</p>
                  {garage.address && (
                    <p className="text-sm text-slate-500 mb-2">{garage.address}</p>
                  )}
                  {garage.phone && (
                    <p className="text-sm text-slate-500 mb-2">📞 {garage.phone}</p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button 
                      onClick={() => openDirections(garage.lat, garage.lng)}
                      className="bg-red-400 text-white px-3 py-1 rounded text-sm hover:bg-red-500 transition-colors"
                    >
                      Directions
                    </button>
                    <button 
                      onClick={() => contactGarage(garage)}
                      className="border border-slate-300 text-slate-700 px-3 py-1 rounded text-sm hover:bg-slate-50 transition-colors"
                    >
                      Contact
                    </button>
                  </div>
                </div>
              ))}
              
              {garages.length === 0 && !loading && (
                <div className="text-center py-8 text-slate-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p>Click "Find My Location" to discover nearby garages and automotive services.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
