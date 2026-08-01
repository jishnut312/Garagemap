'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { getNearbyWorkshops, Workshop } from '@/lib/django-api';
import { MapPin, Phone, Star, Navigation, AlertTriangle, Loader2, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';

// Dynamically import map to avoid SSR issues
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
    </div>
  ),
});

const SERVICE_LABELS: Record<string, string> = {
  car: 'Car Repair',
  bike: 'Bike Repair',
  truck: 'Truck Repair',
  emergency: 'Emergency',
  towing: 'Towing',
  inspection: 'Inspection',
};

const SERVICE_COLORS: Record<string, string> = {
  car: 'bg-blue-100 text-blue-700',
  bike: 'bg-green-100 text-green-700',
  truck: 'bg-orange-100 text-orange-700',
  emergency: 'bg-red-100 text-red-700',
  towing: 'bg-purple-100 text-purple-700',
  inspection: 'bg-slate-100 text-slate-700',
};

export default function FindGaragePage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [radiusKm, setRadiusKm] = useState(10);
  const [serviceFilter, setServiceFilter] = useState('');
  const [selected, setSelected] = useState<Workshop | null>(null);

  const fetchNearby = async (lat: number, lng: number, radius: number, service: string) => {
    setLoading(true);
    try {
      const results = await getNearbyWorkshops({
        lat,
        lng,
        radius,
        ...(service ? { service_type: service } : {}),
      });
      setWorkshops(results);
    } catch (err) {
      console.error('Failed to fetch nearby workshops:', err);
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () => {
    setLocationError(null);
    setLoading(true);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(loc);
        fetchNearby(loc.lat, loc.lng, radiusKm, serviceFilter);
      },
      (err) => {
        const messages: Record<number, string> = {
          1: 'Location access denied. Please allow location in your browser.',
          2: 'Location unavailable. Try again.',
          3: 'Location request timed out.',
        };
        setLocationError(messages[err.code] || 'Could not get your location.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Re-fetch when filters change (if we already have location)
  const applyFilters = () => {
    if (userLocation) {
      fetchNearby(userLocation.lat, userLocation.lng, radiusKm, serviceFilter);
    }
  };

  useEffect(() => {
    getLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Map-compatible garage format
  const mapGarages = workshops.map((w) => ({
    id: String(w.id),
    name: w.workshop_name,
    lat: Number(w.latitude),
    lng: Number(w.longitude),
    type: w.services?.[0] ? SERVICE_LABELS[w.services[0]] : 'Workshop',
    address: w.address,
    phone: w.phone,
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-5">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">GarageMap</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-slate-300 hover:text-white font-medium transition-colors">Home</Link>
              <Link href="/find-garage" className="text-white font-semibold border-b-2 border-red-500 pb-0.5">Garages</Link>
              <Link href="/services" className="text-slate-300 hover:text-white font-medium transition-colors">Services</Link>
              <Link href="/login" className="text-slate-300 hover:text-white font-medium transition-colors">Login</Link>
              <Link href="/emergency" className="bg-red-500 text-white px-4 py-2 rounded-full font-medium hover:bg-red-600 transition-all flex items-center gap-2 animate-pulse">
                <AlertTriangle className="w-4 h-4" /> Emergency
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Find Nearby Garages</h1>
          <p className="text-lg text-slate-600">
            Registered workshops near you — sorted by distance
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl p-5 shadow-md mb-6 border border-slate-100">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            {/* Location button */}
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Your Location</label>
              <button
                id="btn-get-location"
                onClick={getLocation}
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Searching...</>
                ) : (
                  <><Navigation className="w-4 h-4" /> Use My Location</>
                )}
              </button>
            </div>

            {/* Radius */}
            <div className="w-full md:w-44">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Radius</label>
              <select
                id="select-radius"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-slate-50"
              >
                <option value={2}>2 km</option>
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={20}>20 km</option>
                <option value={50}>50 km</option>
              </select>
            </div>

            {/* Service filter */}
            <div className="w-full md:w-52">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Service Type</label>
              <select
                id="select-service-type"
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-slate-50"
              >
                <option value="">All Services</option>
                {Object.entries(SERVICE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            {/* Apply */}
            <button
              id="btn-apply-filters"
              onClick={applyFilters}
              disabled={!userLocation || loading}
              className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-slate-700 transition disabled:opacity-40 whitespace-nowrap"
            >
              <SlidersHorizontal className="w-4 h-4" /> Apply Filters
            </button>
          </div>

          {/* Error */}
          {locationError && (
            <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 rounded-xl px-4 py-3 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {locationError}
            </div>
          )}

          {/* Summary */}
          {userLocation && !loading && (
            <p className="mt-3 text-sm text-slate-500">
              📍 {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)} &nbsp;·&nbsp;
              <span className="font-semibold text-slate-700">{workshops.length}</span> workshop{workshops.length !== 1 ? 's' : ''} found within {radiusKm} km
            </p>
          )}
        </div>

        {/* Map + List */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-md overflow-hidden border border-slate-100" style={{ height: 560 }}>
            <MapComponent
              userLocation={userLocation}
              garages={mapGarages}
              loading={loading}
            />
          </div>

          {/* Results List */}
          <div className="flex flex-col gap-3 max-h-[560px] overflow-y-auto pr-1">
            <h2 className="text-lg font-bold text-slate-900 px-1">
              Nearby Workshops
              {workshops.length > 0 && (
                <span className="ml-2 text-sm font-normal text-slate-500">({workshops.length})</span>
              )}
            </h2>

            {loading && (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-3" />
                <p className="text-sm">Finding nearby workshops…</p>
              </div>
            )}

            {!loading && workshops.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-center">
                <MapPin className="w-12 h-12 mb-3 text-slate-300" />
                <p className="font-medium text-slate-600">No workshops found</p>
                <p className="text-sm mt-1">Try increasing the radius or changing the service filter.</p>
              </div>
            )}

            {!loading && workshops.map((w) => (
              <div
                key={w.id}
                onClick={() => setSelected(selected?.id === w.id ? null : w)}
                className={`bg-white rounded-xl p-4 shadow-sm border cursor-pointer transition-all duration-200 hover:shadow-md hover:border-red-200
                  ${selected?.id === w.id ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-100'}`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{w.workshop_name}</h3>
                    <p className="text-sm text-slate-500 truncate">{w.mechanic_name}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {w.distance_km !== undefined && (
                      <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                        {w.distance_km} km
                      </span>
                    )}
                    {w.rating !== undefined && w.rating > 0 && (
                      <span className="flex items-center gap-0.5 text-xs text-yellow-600 font-medium">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {Number(w.rating).toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Services */}
                {w.services && w.services.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {w.services.slice(0, 3).map((s) => (
                      <span key={s} className={`text-xs px-2 py-0.5 rounded-full font-medium ${SERVICE_COLORS[s] || 'bg-slate-100 text-slate-600'}`}>
                        {SERVICE_LABELS[s] || s}
                      </span>
                    ))}
                    {w.services.length > 3 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                        +{w.services.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Expanded details */}
                {selected?.id === w.id && (
                  <div className="border-t border-slate-100 pt-3 mt-1 space-y-2 text-sm text-slate-600 animate-in fade-in duration-150">
                    {w.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <span>{w.address}{w.city ? `, ${w.city}` : ''}</span>
                      </div>
                    )}
                    {w.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <a href={`tel:${w.phone}`} className="text-red-500 hover:underline font-medium">{w.phone}</a>
                      </div>
                    )}
                    <div className="flex gap-2 pt-1">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${w.latitude},${w.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-center bg-red-500 hover:bg-red-600 text-white text-xs font-semibold py-2 rounded-lg transition"
                      >
                        Directions
                      </a>
                      <Link
                        href={`/request/${w.id}`}
                        className="flex-1 text-center bg-slate-900 hover:bg-slate-700 text-white text-xs font-semibold py-2 rounded-lg transition"
                      >
                        Request Service
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
