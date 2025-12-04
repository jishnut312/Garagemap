'use client';

import { useState, useEffect } from 'react';
import { getMechanics, type Mechanic } from '@/lib/firestore';
import { Search, MapPin, Phone, Star, Filter, Wrench, Mail, Clock } from 'lucide-react';
import Link from 'next/link';

export default function FindMechanicsPage() {
    const [mechanics, setMechanics] = useState<Mechanic[]>([]);
    const [filteredMechanics, setFilteredMechanics] = useState<Mechanic[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedService, setSelectedService] = useState('');
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        // Get user location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.log('Location access denied:', error);
                    // Use default location (NYC)
                    setUserLocation({ lat: 40.7128, lng: -74.0060 });
                }
            );
        }

        const fetchMechanics = async () => {
            const fetchedMechanics = await getMechanics();
            setMechanics(fetchedMechanics);
            setFilteredMechanics(fetchedMechanics);
            setLoading(false);
        };

        fetchMechanics();
    }, []);

    useEffect(() => {
        // Filter mechanics based on search and service type
        let filtered = mechanics;

        if (searchTerm) {
            filtered = filtered.filter(mechanic =>
                mechanic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                mechanic.workshop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                mechanic.city?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedService) {
            filtered = filtered.filter(mechanic =>
                mechanic.services.includes(selectedService)
            );
        }

        setFilteredMechanics(filtered);
    }, [searchTerm, selectedService, mechanics]);

    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading mechanics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navigation */}
            <nav className="bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <Link href="/" className="flex items-center space-x-3 group">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-red-500/25 transition-all duration-300">
                                <span className="text-white font-bold text-xl">G</span>
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tight group-hover:text-red-400 transition-colors">
                                GarageMap
                            </span>
                        </Link>
                        <div className="flex items-center space-x-4">
                            <Link href="/" className="text-slate-300 hover:text-white font-medium transition-colors">
                                Home
                            </Link>
                            <Link href="/map-workshop" className="text-slate-300 hover:text-white font-medium transition-colors">
                                Map View
                            </Link>
                            <Link href="/login" className="text-slate-300 hover:text-white font-medium transition-colors">
                                Login
                            </Link>
                            <Link href="/signup" className="bg-red-500 text-white px-6 py-2.5 rounded-full font-bold hover:bg-red-600 transition-all duration-300 shadow-lg shadow-red-500/20">
                                Sign Up
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Find Expert <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">Mechanics</span>
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            Browse our directory of verified mechanics and workshops. Connect with professionals near you.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search and Filters */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name, workshop, or city..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 border border-slate-300 text-slate-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                            />
                        </div>

                        <select
                            value={selectedService}
                            onChange={(e) => setSelectedService(e.target.value)}
                            className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 text-slate-600 focus:ring-red-500 focus:border-transparent bg-white"
                        >
                            <option value="">All Services</option>
                            <option value="car">Car Service</option>
                            <option value="bike">Bike Service</option>
                            <option value="truck">Truck Service</option>
                            <option value="emergency">Emergency</option>
                            <option value="towing">Towing</option>
                            <option value="oil_change">Oil Change</option>
                            <option value="tire">Tire Service</option>
                            <option value="brake">Brake Service</option>
                        </select>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center space-x-2 px-6 py-3 border rounded-xl transition-all font-medium ${showFilters
                                ? 'border-red-500 text-red-500 bg-red-50'
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <Filter className="h-5 w-5" />
                            <span>Filters</span>
                        </button>
                    </div>

                    {showFilters && (
                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Distance
                                    </label>
                                    <select className="w-full px-4 py-2.5 border border-slate-200 text-slate-500 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent">
                                        <option>Within 5 km</option>
                                        <option>Within 10 km</option>
                                        <option>Within 20 km</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Rating
                                    </label>
                                    <select className="w-full px-4 py-2.5 border border-slate-200 text-slate-500 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent">
                                        <option>4+ Stars</option>
                                        <option>3+ Stars</option>
                                        <option>Any Rating</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Availability
                                    </label>
                                    <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-500 focus:ring-2 focus:ring-red-500 focus:border-transparent">
                                        <option>Open Now</option>
                                        <option>Open Today</option>
                                        <option>Any Time</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Count */}
                <div className="mb-6">
                    <p className="text-slate-600">
                        Showing <span className="font-bold text-slate-900">{filteredMechanics.length}</span> mechanic{filteredMechanics.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Mechanics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMechanics.map((mechanic) => (
                        <div key={mechanic.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-red-100 transition-all duration-300 group overflow-hidden flex flex-col">
                            {/* Card Image */}
                            <div className="h-48 w-full bg-slate-100 relative overflow-hidden">
                                {mechanic.photo ? (
                                    <img
                                        src={mechanic.photo}
                                        alt={mechanic.workshop_name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                        }}
                                    />
                                ) : null}
                                <div className={`w-full h-full flex items-center justify-center bg-slate-100 ${mechanic.photo ? 'hidden' : ''}`}>
                                    <Wrench className="w-12 h-12 text-slate-300" />
                                </div>
                                <div className="absolute top-4 right-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${mechanic.is_open
                                        ? 'bg-green-500 text-white'
                                        : 'bg-slate-900 text-white'
                                        }`}>
                                        {mechanic.is_open ? 'OPEN' : 'CLOSED'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 line-clamp-1">{mechanic.workshop_name}</h3>
                                        <p className="text-slate-600 text-sm mt-1">{mechanic.name}</p>
                                        <p className="text-slate-500 text-sm flex items-center gap-1 mt-1">
                                            <MapPin className="w-3 h-3" />
                                            {mechanic.city || 'Location available'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        <span className="font-bold text-slate-900 text-sm">{mechanic.rating}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 my-4">
                                    {mechanic.services.slice(0, 3).map((service) => (
                                        <span
                                            key={service}
                                            className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md capitalize"
                                        >
                                            {service.replace('_', ' ')}
                                        </span>
                                    ))}
                                    {mechanic.services.length > 3 && (
                                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md">
                                            +{mechanic.services.length - 3}
                                        </span>
                                    )}
                                </div>

                                <div className="mt-auto pt-4 border-t border-slate-100">
                                    {userLocation && (
                                        <div className="text-slate-500 text-sm font-medium mb-3 flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {calculateDistance(
                                                userLocation.lat,
                                                userLocation.lng,
                                                mechanic.latitude,
                                                mechanic.longitude
                                            ).toFixed(1)} km away
                                        </div>
                                    )}

                                    <div className="flex gap-2">
                                        <a
                                            href={`tel:${mechanic.phone}`}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition-colors"
                                        >
                                            <Phone className="w-4 h-4" />
                                            Call
                                        </a>
                                        <Link
                                            href="/signup"
                                            className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-red-600 transition-all shadow-md hover:shadow-lg"
                                        >
                                            Contact
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredMechanics.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-10 h-10 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No mechanics found</h3>
                        <p className="text-slate-500 max-w-md mx-auto">
                            We couldn't find any mechanics matching your search. Try adjusting your filters or search terms.
                        </p>
                        <button
                            onClick={() => { setSearchTerm(''); setSelectedService(''); }}
                            className="mt-6 text-red-500 font-semibold hover:text-red-600"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-100 mt-16 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-xl">G</span>
                            </div>
                            <span className="text-2xl font-bold text-slate-900">GarageMap</span>
                        </div>
                        <p className="text-slate-400 text-sm">© 2024 GarageMap. All rights reserved.</p>
                        <div className="flex gap-6">
                            <Link href="/privacy" className="text-slate-400 hover:text-slate-900 text-sm">Privacy</Link>
                            <Link href="/terms" className="text-slate-400 hover:text-slate-900 text-sm">Terms</Link>
                            <Link href="/mechanics" className="text-slate-400 hover:text-slate-900 text-sm">Join as Mechanic</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
