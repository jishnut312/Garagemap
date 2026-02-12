'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getMechanics, type Mechanic, createRequest, getUserRequests, type Request } from '@/lib/firestore';
import { createReview } from '@/lib/django-api';
import { Search, MapPin, Phone, Star, Clock, Filter, Wrench, ArrowRight, MessageCircle, User, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import ChatModal from '@/components/ChatModal';
import RatingModal from '@/components/RatingModal';
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

  // Rating State
  const [selectedRatingRequest, setSelectedRatingRequest] = useState<Request | null>(null);
  const [isRatingOpen, setIsRatingOpen] = useState(false);

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

  // Check if chat history is still available (within 2 weeks of completion)
  const isChatAvailable = (request: Request): boolean => {
    if (request.status !== 'completed') return true; // Always available for active requests

    // Check if request was completed within the last 2 weeks
    const twoWeeksInMs = 14 * 24 * 60 * 60 * 1000; // 2 weeks in milliseconds
    const completedAt = request.updatedAt?.toMillis() || request.createdAt?.toMillis() || 0;
    const now = Date.now();
    const timeSinceCompletion = now - completedAt;

    return timeSinceCompletion <= twoWeeksInMs;
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
        mechanicUserId: mechanic.userId, // Link the mechanic's user account for chat/notifications
        userName: user.displayName || user.email || 'User',
        mechanicName: mechanic.name,
        serviceType,
        status: 'pending',
        urgency,
        description: `Service request for ${serviceType} from dashboard`,
      });

      alert(`Service request (${serviceType}) sent successfully!`);
      // Refresh requests
      const reqs = await getUserRequests(user.uid);
      setUserRequests(reqs);
    } catch (error) {
      console.error('Error creating request:', error);
      alert('Failed to send service request. Please try again.');
    }
  };

  const handleSubmitRating = async (rating: number, comment: string) => {
    if (!selectedRatingRequest || !user) return;

    try {
      const workshopId = Number(selectedRatingRequest.mechanicId);
      if (!Number.isFinite(workshopId)) {
        throw new Error('Unable to map this request to a workshop for rating submission.');
      }

      // Submit review to Django backend
      await createReview({
        workshop_id: workshopId,
        rating,
        comment,
      });

      alert('Thank you for your rating!');

      // Refresh requests to update UI
      const reqs = await getUserRequests(user.uid);
      setUserRequests(reqs);
    } catch (error) {
      console.error('Error submitting rating:', error);
      throw error; // Re-throw to let the modal handle it
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
                <div key={req.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                  {/* Header */}
                  <div className="p-6 pb-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                          {req.mechanicName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-lg">{req.mechanicName}</h3>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span className="capitalize font-medium text-slate-700">{req.serviceType}</span>
                            <span>•</span>
                            <span>{req.createdAt?.toDate().toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${req.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        req.status === 'accepted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          req.status === 'in_progress' ? 'bg-purple-50 text-purple-700 border-purple-200 animate-pulse' :
                            req.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              'bg-slate-100 text-slate-600'
                        }`}>
                        {req.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Progress Stepper */}
                    <div className="relative flex items-center justify-between mt-6 px-2 mb-6">
                      {/* Connection Line */}
                      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -z-10 bg-gradient-to-r from-red-500/20 to-slate-200"></div>

                      {/* Steps */}
                      {[
                        { id: 'pending', label: 'Sent' },
                        { id: 'accepted', label: 'Accepted' },
                        { id: 'in_progress', label: 'Work' },
                        { id: 'completed', label: 'Done' }
                      ].map((step, idx) => {
                        // Determine massive status logic
                        const statusOrder = ['pending', 'accepted', 'in_progress', 'completed'];
                        const currentIdx = statusOrder.indexOf(req.status);
                        const stepIdx = idx;
                        const isCompleted = stepIdx < currentIdx;
                        const isCurrent = stepIdx === currentIdx;

                        return (
                          <div key={step.id} className="flex flex-col items-center gap-2 bg-white px-2">
                            <div className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${isCompleted ? 'bg-red-500 border-red-500' :
                              isCurrent ? 'bg-white border-red-500 scale-125 ring-4 ring-red-50' :
                                'bg-slate-100 border-slate-300'
                              }`} />
                            <span className={`text-[10px] font-bold uppercase tracking-wide transition-colors ${isCurrent ? 'text-red-500' :
                              isCompleted ? 'text-slate-700' :
                                'text-slate-300'
                              }`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                      "{req.description || "No description provided."}"
                    </p>
                  </div>

                  {/* Actions Footer */}
                  <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {req.status === 'completed' ? 'Actions' : 'Action Required'}
                    </div>

                    {(req.status === 'pending') && (
                      <span className="text-sm text-slate-500 font-medium flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Waiting for response...
                      </span>
                    )}

                    {(req.status === 'accepted' || req.status === 'in_progress') && (
                      <button
                        onClick={() => {
                          setSelectedChatRequest(req);
                          setIsChatOpen(true);
                        }}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold rounded-xl hover:from-blue-500 hover:to-blue-600 transition-all shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 active:scale-[0.98] group-hover:scale-105"
                      >
                        <MessageCircle className="w-4 h-4 fill-white/20" />
                        Chat with Mechanic
                      </button>
                    )}

                    {req.status === 'completed' && (
                      <div className="flex gap-3">
                        {/* View Chat History Button - Only show if within 2 weeks */}
                        {isChatAvailable(req) ? (
                          <button
                            onClick={() => {
                              setSelectedChatRequest(req);
                              setIsChatOpen(true);
                            }}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-300 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all"
                          >
                            <MessageCircle className="w-4 h-4" />
                            View Chat
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            Chat expired (2 weeks)
                          </span>
                        )}

                        {/* Rate Service Button */}
                        <button
                          onClick={() => {
                            setSelectedRatingRequest(req);
                            setIsRatingOpen(true);
                          }}
                          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-sm font-bold rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all shadow-lg shadow-yellow-500/25 hover:-translate-y-0.5 active:scale-[0.98]"
                        >
                          <Star className="w-4 h-4 fill-white/50" />
                          Rate Service
                        </button>
                      </div>
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

      {/* Rating Modal */}
      {selectedRatingRequest && (
        <RatingModal
          isOpen={isRatingOpen}
          onClose={() => setIsRatingOpen(false)}
          mechanicName={selectedRatingRequest.mechanicName}
          onSubmit={handleSubmitRating}
        />
      )}

      {/* AI Chat Widget - Shows when no results */}
      <AIChatWidget showTrigger={filteredMechanics.length === 0 ? 'no-results' : 'always'} />
    </div>
  );
}
