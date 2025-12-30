'use client';

import { useEffect, useState } from 'react';
import { getMechanics, type Mechanic } from '@/lib/firestore';
import Navbar from '@/components/Navbar';

interface Workshop {
  id: string | number;
  workshop_name: string;
  mechanic_name: string;
  address: string;
  rating: number;
  services: string[];
  phone: string;
  latitude: number;
  longitude: number;
  image: string | null;
  distance?: string;
}

export default function MapWorkshop() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState<string>('');
  const [userPos, setUserPos] = useState<{ lat: number, lng: number } | null>(null);
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance');
  const [loading, setLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);


  // Fetch workshops from Firestore
  useEffect(() => {
    const fetchWorkshops = async () => {
      try {
        const mechanics = await getMechanics();
        const formattedData = mechanics.map((m: Mechanic) => ({
          id: m.id,
          workshop_name: m.workshop_name,
          mechanic_name: m.name,
          address: m.city || 'Address not available',
          rating: m.rating,
          services: m.services,
          phone: m.phone,
          latitude: m.latitude || 0, // Default to 0 if missing
          longitude: m.longitude || 0,
          image: m.photo,
          distance: undefined
        }));
        setWorkshops(formattedData);
      } catch (error) {
        console.error('Error fetching workshops:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkshops();
  }, []);

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    // Basic validation
    if (!lat1 || !lng1 || !lat2 || !lng2) return Infinity;

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
    if (userPos && workshop.latitude && workshop.longitude) {
      const dist = calculateDistance(userPos.lat, userPos.lng, workshop.latitude, workshop.longitude);
      if (dist === Infinity) return 'N/A';
      return dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(1)} km`;
    }
    return 'N/A';
  };

  const filteredWorkshops = workshops
    .filter(workshop =>
      workshop.workshop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workshop.services.some(service => service.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      // Use calculated distance if user position available
      if (userPos) {
        const distA = calculateDistance(userPos.lat, userPos.lng, a.latitude, a.longitude);
        const distB = calculateDistance(userPos.lat, userPos.lng, b.latitude, b.longitude);
        return distA - distB;
      }
      return 0;
    });

  const handleUseLocation = () => {
    console.log("Requesting location...");
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Location received:", position.coords);
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserPos(userPos);
          setUserLocation(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
          setSortBy('distance'); // Auto-switch to distance sort
          setIsLocating(false);
        },
        (error) => {
          console.error("Location error:", error);
          let errorMessage = 'Unable to get your location.';
          if (error.code === 1) errorMessage = 'Location permission denied. Please enable it in your browser settings.';
          else if (error.code === 2) errorMessage = 'Location unavailable.';
          else if (error.code === 3) errorMessage = 'Location request timed out.';

          alert(errorMessage);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-red-500/30">
      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-400 mb-2">
              Find Workshop
            </h1>
            <p className="text-slate-400 text-lg">
              Discover top-rated automotive experts near you.
            </p>
          </div>

          <button
            onClick={handleUseLocation}
            disabled={isLocating}
            className="group flex items-center gap-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-red-500/50 text-slate-200 px-5 py-3 rounded-2xl transition-all duration-300 backdrop-blur-sm disabled:opacity-50 disabled:cursor-wait"
          >
            <div className="p-1.5 rounded-full bg-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              {isLocating ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </div>
            <span className="font-medium">{isLocating ? 'Locating...' : 'Use My Location'}</span>
          </button>
        </div>

        {/* Controls Bar */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-4 mb-10 shadow-2xl backdrop-blur-xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search */}
            <div className="md:col-span-5 relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-500 group-focus-within:text-red-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-11 pr-4 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all shadow-inner"
              />
            </div>

            {/* Sort */}
            <div className="md:col-span-3 relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'distance' | 'rating')}
                className="block w-full pl-4 pr-10 py-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all appearance-none cursor-pointer shadow-inner"
              >
                <option value="distance">Sort by Distance</option>
                <option value="rating">Sort by Rating</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Mobile Actions / Mechanic Filter */}
            <div className="md:col-span-4">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSortBy('rating');
                }}
                className="w-full h-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold py-3.5 px-6 rounded-2xl shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                For Mechanics
              </button>
            </div>
          </div>

          {/* Location Status */}
          {userLocation && (
            <div className="mt-4 flex items-center gap-2 text-sm text-blue-400 bg-blue-500/10 py-2 px-4 rounded-lg border border-blue-500/20 inline-flex">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Current Location: <span className="font-mono text-blue-300">{userLocation}</span></span>
            </div>
          )}
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-slate-700 border-t-red-500 rounded-full animate-spin"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <p className="mt-6 text-slate-400 font-medium animate-pulse">Finding best workshops...</p>
          </div>
        ) : filteredWorkshops.length === 0 ? (
          <div className="text-center py-24 bg-slate-900/30 rounded-3xl border border-slate-800/50 border-dashed">
            <div className="bg-slate-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-300 mb-2">No workshops found</h3>
            <p className="text-slate-500 max-w-sm mx-auto">We couldn't find any workshops matching your criteria. Try adjusting filters or expanding availability.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkshops.map((workshop) => (
              <div
                key={workshop.id}
                onClick={() => setSelectedWorkshop(workshop)}
                className={`group relative bg-slate-900 border transition-all duration-300 rounded-3xl overflow-hidden hover:-translate-y-1 hover:shadow-2xl hover:shadow-red-900/10 cursor-pointer ${selectedWorkshop?.id === workshop.id
                  ? 'border-red-500 ring-1 ring-red-500 shadow-red-500/20'
                  : 'border-slate-800 hover:border-slate-700'
                  }`}
              >
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10 opacity-60"></div>
                  {workshop.image ? (
                    <img
                      src={workshop.image}
                      alt={workshop.workshop_name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                      <svg className="w-12 h-12 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 z-20 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 flex items-center gap-1.5 shadow-lg">
                    <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-sm font-bold text-white">{workshop.rating}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 relative z-20">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors line-clamp-1">{workshop.workshop_name}</h3>
                  </div>

                  <div className="flex items-center gap-2 mb-4 text-slate-400 text-sm">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="line-clamp-1">{workshop.address}</span>
                  </div>

                  {/* Services Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {workshop.services.slice(0, 3).map((service, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium rounded-full">
                        {service}
                      </span>
                    ))}
                    {workshop.services.length > 3 && (
                      <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-400 text-xs font-medium rounded-full">
                        +{workshop.services.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Footer Stats & Action */}
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500 font-uppercase tracking-wider">Distance</span>
                      <span className="text-red-400 font-bold">{getDistanceString(workshop)} away</span>
                    </div>

                    <button className="bg-white text-slate-900 p-2.5 rounded-xl hover:bg-slate-200 transition-colors hover:scale-105 active:scale-95">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
