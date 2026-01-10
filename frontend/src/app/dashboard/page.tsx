'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getMechanics, type Mechanic, createRequest, getUserRequests, type Request } from '@/lib/firestore';
import { Search, MapPin, Phone, Star, Clock, Filter, Wrench, ArrowRight, MessageCircle, User, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import ChatModal from '@/components/ChatModal';
import Navbar from '@/components/Navbar';
import AIChatWidget from '@/components/AIChatWidget';


export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [filteredMechanics, setFilteredMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRequests, setUserRequests] = useState<Request[]>([]);

  // Chat State
  const [selectedChatRequest, setSelectedChatRequest] = useState<Request | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const router = useRouter();

  // Handle redirects based on auth state and user type
  useEffect(() => {
    if (authLoading) return; // Wait for auth to load

    if (!user) {
      router.push('/login');
      return;
    }

    // Redirect mechanics to their dashboard
    if (user.userType === 'mechanic') {
      router.push('/mechanic-dashboard');
      return;
    }
  }, [user, authLoading, router]);

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

    const fetchMechanicsAndRequests = async () => {
      setLoading(true);
      // Load mechanics
      const fetchedMechanics = await getMechanics();
      setMechanics(fetchedMechanics);
      setFilteredMechanics(fetchedMechanics);

      // Load user requests
      if (user) {
        const reqs = await getUserRequests(user.uid);
        setUserRequests(reqs);
      }

      setLoading(false);
    };

    fetchMechanicsAndRequests();
  }, [user]);

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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.userType === 'mechanic') {
    // Show loading while redirecting
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-slate-600">Redirecting...</p>
        </div>
      </div>
    );
  }

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

  const handleRequestService = async (mechanicId: string, serviceType: string = 'general', urgency: 'low' | 'medium' | 'high' | 'emergency' = 'low') => {
    if (!user) return;

    try {
      // Find the mechanic details
      const mechanic = mechanics.find(m => m.id === mechanicId);
      if (!mechanic) return;

      await createRequest({
        userId: user.uid,
        mechanicId,
        userName: user.displayName || user.email || 'User',
        mechanicName: mechanic.name,
        serviceType,
        status: 'pending',
        urgency,
        description: `Service request for ${serviceType} from dashboard`,
      });

      alert(`Service request (${serviceType}) sent successfully!`);
    } catch (error) {
      console.error('Error creating request:', error);
      alert('Failed to send service request. Please try again.');
    }
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
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Active Requests Section */}
        {userRequests.length > 0 && (
          <div className="mb-10 animate-in slide-in-from-bottom-5 duration-500">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-500" />
                Your Active Requests
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userRequests.map((req) => (
                <div key={req.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-slate-900 line-clamp-1">{req.mechanicName}</h3>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                        <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                        {req.serviceType.toUpperCase()}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${req.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                      req.status === 'accepted' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        req.status === 'in_progress' ? 'bg-purple-50 text-purple-700 border border-purple-200 animate-pulse' :
                          req.status === 'completed' ? 'bg-green-50 text-green-700 border border-green-200' :
                            'bg-slate-100 text-slate-600'
                      }`}>
                      {req.status}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 mb-4 line-clamp-2 bg-slate-50 p-3 rounded-xl border border-slate-50">
                    {req.description || "No description provided."}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
                    <span className="text-xs text-slate-400 font-medium">
                      {req.createdAt?.toDate().toLocaleDateString()}
                    </span>

                    {(req.status === 'pending' || req.status === 'accepted' || req.status === 'in_progress') && (
                      <button
                        onClick={() => {
                          setSelectedChatRequest(req);
                          setIsChatOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-[0.98]"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Chat
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search mechanics or workshops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-400  text-slate-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
            </div>

            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="px-4 py-3 border border-slate-400 rounded-xl focus:ring-2 text-slate-600 focus:ring-red-500 focus:border-transparent bg-white"
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
            <div className="mt-6 pt-6 border-t border-slate-100 animate-in slide-in-from-top-2">
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
                  <select className="w-full px-4 py-2.5 border border-slate-200  text-slate-500 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent">
                    <option>4+ Stars</option>
                    <option>3+ Stars</option>
                    <option>Any Rating</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Availability
                  </label>
                  <select className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-slate-500  focus:ring-2 focus:ring-red-500 focus:border-transparent">
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
                    <p className="text-slate-700 text-sm flex items-center gap-1 mt-1">
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
                      {service}
                    </span>
                  ))}
                  {mechanic.services.length > 3 && (
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md">
                      +{mechanic.services.length - 3}
                    </span>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                  {userLocation && (
                    <div className="text-slate-500 text-sm font-medium">
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
                      className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                    </a>

                    {mechanic.services.includes('emergency') && (
                      <button
                        onClick={() => handleRequestService(mechanic.id, 'emergency', 'emergency')}
                        className="flex items-center gap-1 bg-red-600 text-white px-3 py-2 rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-md hover:shadow-lg animate-pulse"
                        title="Request Emergency Assistance"
                      >
                        <AlertCircle className="w-4 h-4" />
                        SOS
                      </button>
                    )}

                    <button
                      onClick={() => handleRequestService(
                        mechanic.id,
                        selectedService && selectedService !== 'emergency' ? selectedService : 'general',
                        'medium'
                      )}
                      className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-slate-800 transition-all shadow-md hover:shadow-lg"
                    >
                      Book Now
                      <ArrowRight className="w-4 h-4" />
                    </button>
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
            <h3 className="text-xl font-bold text-slate-900 mb-2">No workshops found</h3>
            <p className="text-slate-500 max-w-md mx-auto">
              We couldn't find any workshops matching your search. Try adjusting your filters or search terms.
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

      {/* Chat Modal */}
      {selectedChatRequest && user && (
        <ChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          requestId={selectedChatRequest.id || ''}
          currentUserId={user.uid}
          otherUserId={selectedChatRequest.mechanicUserId || ''}
          otherUserName={selectedChatRequest.mechanicName}
          isMechanic={false}
          currentUserName={user.displayName || 'User'}
          mechanicId={selectedChatRequest.mechanicId}
        />
      )}

      {/* AI Chat Widget - Shows when no results */}
      <AIChatWidget showTrigger={filteredMechanics.length === 0 ? 'no-results' : 'always'} />
    </div>
  );
}
