'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface Workshop {
  id: number;
  name: string;
  address: string;
  rating: number;
  distance: string;
  services: string[];
  phone: string;
  lat: number;
  lng: number;
}

const mockWorkshops: Workshop[] = [
  {
    id: 1,
    name: "AutoCare Pro Workshop",
    address: "123 Main Street, Downtown",
    rating: 4.8,
    distance: "0.5 km",
    services: ["Engine Repair", "Brake Service", "Oil Change", "Transmission"],
    phone: "+1 234-567-8901",
    lat: 40.7128,
    lng: -74.0060
  },
  {
    id: 2,
    name: "Elite Motor Services",
    address: "456 Oak Avenue, Midtown",
    rating: 4.6,
    distance: "1.2 km",
    services: ["Transmission", "AC Repair", "Diagnostics", "Electrical"],
    phone: "+1 234-567-8902",
    lat: 40.7589,
    lng: -73.9851
  },
  {
    id: 3,
    name: "Quick Fix Garage",
    address: "789 Pine Road, Uptown",
    rating: 4.4,
    distance: "2.1 km",
    services: ["Tire Service", "Battery", "Inspection", "Alignment"],
    phone: "+1 234-567-8903",
    lat: 40.7831,
    lng: -73.9712
  },
  {
    id: 4,
    name: "Premium Auto Center",
    address: "321 Broadway, Central",
    rating: 4.9,
    distance: "0.8 km",
    services: ["Luxury Cars", "Detailing", "Performance", "Maintenance"],
    phone: "+1 234-567-8904",
    lat: 40.7505,
    lng: -73.9934
  },
  {
    id: 5,
    name: "City Mechanics Hub",
    address: "654 Park Avenue, East Side",
    rating: 4.3,
    distance: "1.8 km",
    services: ["General Repair", "Bodywork", "Paint", "Insurance Claims"],
    phone: "+1 234-567-8905",
    lat: 40.7282,
    lng: -73.9942
  }
];

export default function MapWorkshop() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState<string>('');
  const [userPos, setUserPos] = useState<{lat: number, lng: number} | null>(null);
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance');
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Get distance string for display
  const getDistanceString = (workshop: Workshop): string => {
    if (userPos) {
      const dist = calculateDistance(userPos.lat, userPos.lng, workshop.lat, workshop.lng);
      return dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(1)} km`;
    }
    return workshop.distance;
  };

  const filteredWorkshops = mockWorkshops
    .filter(workshop => 
      workshop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workshop.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      // Use calculated distance if user position available, otherwise use mock distance
      if (userPos) {
        const distA = calculateDistance(userPos.lat, userPos.lng, a.lat, a.lng);
        const distB = calculateDistance(userPos.lat, userPos.lng, b.lat, b.lng);
        return distA - distB;
      }
      return parseFloat(a.distance) - parseFloat(b.distance);
    });

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        version: 'weekly',
        libraries: ['places']
      });

      try {
        await loader.load();
        
        if (mapRef.current) {
          const mapInstance = new google.maps.Map(mapRef.current, {
            center: { lat: 40.7128, lng: -74.0060 }, // NYC default
            zoom: 13,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          });

          setMap(mapInstance);

          // Add workshop markers
          const newMarkers: google.maps.Marker[] = [];
          mockWorkshops.forEach((workshop) => {
            const marker = new google.maps.Marker({
              position: { lat: workshop.lat, lng: workshop.lng },
              map: mapInstance,
              title: workshop.name,
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="18" fill="#ef4444" stroke="white" stroke-width="4"/>
                    <path d="M19 12L21 12L21 20L19 20L19 12Z" fill="white"/>
                    <path d="M19 22L21 22L21 24L19 24L19 22Z" fill="white"/>
                  </svg>
                `),
                scaledSize: new google.maps.Size(40, 40)
              }
            });

            marker.addListener('click', () => {
              setSelectedWorkshop(workshop);
            });

            newMarkers.push(marker);
          });

          setMarkers(newMarkers);
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initMap();
  }, []);

  const handleUseLocation = () => {
    if (navigator.geolocation && map) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserPos(userPos);
          setUserLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
          
          // Create bounds including user location and all workshops
          const bounds = new google.maps.LatLngBounds();
          bounds.extend(userPos);
          mockWorkshops.forEach(workshop => {
            bounds.extend({ lat: workshop.lat, lng: workshop.lng });
          });
          
          // Fit map to bounds
          map.fitBounds(bounds);
          
          // Add user location marker
          new google.maps.Marker({
            position: userPos,
            map: map,
            title: 'Your Location',
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="15" cy="15" r="13" fill="#3b82f6" stroke="white" stroke-width="4"/>
                  <circle cx="15" cy="15" r="6" fill="white"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(30, 30)
            }
          });
        },
        () => {
          alert('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

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
              <a href="/dashboard" className="text-slate-300 hover:text-white font-medium transition-colors">Garages</a>
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
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-88px)]">
        {/* Sidebar */}
        <div className="w-1/3 bg-white border-r border-slate-200 overflow-y-auto">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Find Workshop</h1>
            <p className="text-slate-600 mb-6">Discover nearby automotive workshops and services</p>
            
            {/* Use My Location Button */}
            <button
              onClick={handleUseLocation}
              className="w-full mb-4 bg-blue-500 text-white px-4 py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Use My Location
            </button>

            {/* Search Bar */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search workshops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent"
              />
              <svg className="w-5 h-5 text-slate-400 absolute left-4 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'distance' | 'rating')}
              className="w-full mb-6 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent"
            >
              <option value="distance">Sort by Distance</option>
              <option value="rating">Sort by Rating</option>
            </select>

            {/* Location Display */}
            {userLocation && (
              <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-blue-700 text-sm font-medium">Location: {userLocation}</span>
                </div>
              </div>
            )}

            {/* Workshop List */}
            <div className="space-y-4">
              {filteredWorkshops.map((workshop) => (
                <div
                  key={workshop.id}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                    selectedWorkshop?.id === workshop.id
                      ? 'border-red-400 bg-red-50'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                  }`}
                  onClick={() => setSelectedWorkshop(workshop)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-900">{workshop.name}</h3>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm text-slate-600">{workshop.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-slate-600 mb-2">{workshop.address}</p>
                  <p className="text-sm text-red-500 font-medium mb-3">{getDistanceString(workshop)} away</p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {workshop.services.slice(0, 2).map((service, index) => (
                      <span key={index} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                        {service}
                      </span>
                    ))}
                    {workshop.services.length > 2 && (
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                        +{workshop.services.length - 2} more
                      </span>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="flex-1 bg-red-400 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-500 transition-colors">
                      Book Now
                    </button>
                    <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                      Call
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results in Sidebar */}
            {filteredWorkshops.length === 0 && (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-slate-600 mb-1">No workshops found</h3>
                <p className="text-slate-500 text-sm">Try adjusting your search.</p>
              </div>
            )}
          </div>
        </div>

        {/* Google Maps Section */}
        <div className="flex-1 relative">
          {/* Google Maps Container */}
          <div ref={mapRef} className="w-full h-full" />

          {/* Selected Workshop Info Card */}
          {selectedWorkshop && (
            <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl shadow-xl p-6 max-w-md mx-auto">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{selectedWorkshop.name}</h3>
                  <p className="text-slate-600">{selectedWorkshop.address}</p>
                </div>
                <button
                  onClick={() => setSelectedWorkshop(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-medium">{selectedWorkshop.rating}</span>
                </div>
                <span className="text-sm text-red-500 font-medium">{getDistanceString(selectedWorkshop)}</span>
                <span className="text-sm text-slate-600">{selectedWorkshop.phone}</span>
              </div>
              
              <div className="flex space-x-3">
                <button className="flex-1 bg-red-400 text-white py-3 px-6 rounded-xl font-semibold hover:bg-red-500 transition-colors">
                  Book Appointment
                </button>
                <button className="px-6 py-3 border border-slate-300 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
                  Call Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
