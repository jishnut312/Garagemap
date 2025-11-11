'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mechanicAPI, type Mechanic } from '@/lib/api';
import { Search, MapPin, Phone, Star, Clock, Filter } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [filteredMechanics, setFilteredMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Mock mechanics data for demo
  const mockMechanics: Mechanic[] = [
    {
      id: 1,
      name: 'John Smith',
      phone: '+1234567890',
      workshop_name: 'Smith Auto Repair',
      latitude: 40.7128,
      longitude: -74.0060,
      services: ['car', 'emergency'],
      rating: 4.5,
      is_open: true,
      photo: 'https://via.placeholder.com/100',
      reviews_count: 23
    },
    {
      id: 2,
      name: 'Maria Garcia',
      phone: '+1234567891',
      workshop_name: 'Garcia Bike Service',
      latitude: 40.7589,
      longitude: -73.9851,
      services: ['bike', 'emergency'],
      rating: 4.8,
      is_open: true,
      photo: 'https://via.placeholder.com/100',
      reviews_count: 45
    },
    {
      id: 3,
      name: 'Ahmed Hassan',
      phone: '+1234567892',
      workshop_name: 'Hassan Motors',
      latitude: 40.7282,
      longitude: -73.7949,
      services: ['car', 'truck', 'towing'],
      rating: 4.2,
      is_open: false,
      photo: 'https://via.placeholder.com/100',
      reviews_count: 18
    }
  ];

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

    // Load mechanics (using mock data for now)
    setMechanics(mockMechanics);
    setFilteredMechanics(mockMechanics);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Filter mechanics based on search and service type
    let filtered = mechanics;

    if (searchTerm) {
      filtered = filtered.filter(mechanic => 
        mechanic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mechanic.workshop_name.toLowerCase().includes(searchTerm.toLowerCase())
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
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handleRequestService = (mechanicId: number) => {
    // This will open a modal or navigate to request page
    alert(`Service request sent to mechanic ${mechanicId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading mechanics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-xl font-bold text-gray-900">GarageMap</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.displayName || 'User'}</span>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">
                  {user?.displayName?.charAt(0) || 'U'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search mechanics or workshops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Services</option>
              <option value="car">Car Service</option>
              <option value="bike">Bike Service</option>
              <option value="truck">Truck Service</option>
              <option value="emergency">Emergency</option>
              <option value="towing">Towing</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distance
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>Within 5 km</option>
                    <option>Within 10 km</option>
                    <option>Within 20 km</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>4+ Stars</option>
                    <option>3+ Stars</option>
                    <option>Any Rating</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>Open Now</option>
                    <option>Open Today</option>
                    <option>Any Time</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMechanics.map((mechanic) => (
            <div key={mechanic.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={mechanic.photo}
                      alt={mechanic.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{mechanic.name}</h3>
                      <p className="text-gray-600">{mechanic.workshop_name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">
                            {mechanic.rating} ({mechanic.reviews_count} reviews)
                          </span>
                        </div>
                        <div className={`flex items-center space-x-1 ${mechanic.is_open ? 'text-green-600' : 'text-red-600'}`}>
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">{mechanic.is_open ? 'Open' : 'Closed'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {userLocation && (
                    <div className="text-right">
                      <div className="flex items-center text-gray-500 text-sm">
                        <MapPin className="h-4 w-4 mr-1" />
                        {calculateDistance(
                          userLocation.lat,
                          userLocation.lng,
                          mechanic.latitude,
                          mechanic.longitude
                        ).toFixed(1)} km
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {mechanic.services.map((service) => (
                      <span
                        key={service}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => handleRequestService(mechanic.id)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Request Service
                  </button>
                  <a
                    href={`tel:${mechanic.phone}`}
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                  </a>
                  <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <MapPin className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredMechanics.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No mechanics found</div>
            <p className="text-gray-500 mt-2">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
