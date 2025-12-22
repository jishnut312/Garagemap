'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
    getMechanicRequests,
    getMechanicByUserId,
    updateRequestStatus,
    createMechanicProfile,
    updateMechanicProfile,
    type Request,
    type Mechanic
} from '@/lib/firestore';
import {
    Wrench,
    Clock,
    CheckCircle,
    XCircle,
    Phone,
    MapPin,
    Star,
    User,
    TrendingUp,
    AlertCircle,
    LogOut,
    Building,
    Edit,
    X,
    Upload,
    Calendar,
    ChevronRight,
    Search
} from 'lucide-react';
import Navbar from '@/components/Navbar';

export default function MechanicDashboard() {
    const { user, loading: authLoading, signOut } = useAuth();
    const [mechanic, setMechanic] = useState<Mechanic | null>(null);
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'completed'>('pending');
    const [showWorkshopModal, setShowWorkshopModal] = useState(false);
    const [workshopForm, setWorkshopForm] = useState({
        name: '',
        phone: '',
        workshop_name: '',
        city: '',
        latitude: 0,
        longitude: 0,
        services: [] as string[],
        rating: 0,
        is_open: true,
        photo: '',
        reviews_count: 0
    });
    const [isSavingWorkshop, setIsSavingWorkshop] = useState(false);
    const [workshopImageFile, setWorkshopImageFile] = useState<File | null>(null);
    const [workshopImagePreview, setWorkshopImagePreview] = useState<string>('');
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user && user.userType !== 'mechanic') {
            router.push('/dashboard');
            return;
        }

        const fetchData = async () => {
            if (!user) return;

            try {
                const mechanicData = await getMechanicByUserId(user.uid);
                setMechanic(mechanicData);

                if (mechanicData) {
                    const requestsData = await getMechanicRequests(user.uid);
                    setRequests(requestsData);
                }
            } catch (error) {
                console.error('Error fetching mechanic data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, authLoading, router]);

    const openWorkshopModal = (editMode = false) => {
        if (editMode && mechanic) {
            setWorkshopForm({
                name: mechanic.name,
                phone: mechanic.phone,
                workshop_name: mechanic.workshop_name,
                city: mechanic.city || '',
                latitude: mechanic.latitude,
                longitude: mechanic.longitude,
                services: mechanic.services,
                rating: mechanic.rating,
                is_open: mechanic.is_open,
                photo: mechanic.photo,
                reviews_count: mechanic.reviews_count
            });
            setWorkshopImagePreview(mechanic.photo || '');
            setWorkshopImageFile(null);
        } else {
            setWorkshopForm({
                name: '',
                phone: '',
                workshop_name: '',
                city: '',
                latitude: 0,
                longitude: 0,
                services: [],
                rating: 0,
                is_open: true,
                photo: '',
                reviews_count: 0
            });
            setWorkshopImagePreview('');
            setWorkshopImageFile(null);
        }
        setShowWorkshopModal(true);
    };

    const handleWorkshopImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const MAX_SIZE = 800;
                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    const base64String = canvas.toDataURL('image/jpeg', 0.7);
                    setWorkshopImagePreview(base64String);
                    setWorkshopForm({ ...workshopForm, photo: base64String });
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const removeWorkshopImage = () => {
        setWorkshopImageFile(null);
        setWorkshopImagePreview('');
        setWorkshopForm({ ...workshopForm, photo: '' });
    };

    const handleWorkshopSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSavingWorkshop(true);
        try {
            let lat = workshopForm.latitude;
            let lon = workshopForm.longitude;

            if (workshopForm.city) {
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(workshopForm.city)}`);
                    const data = await response.json();
                    if (data && data.length > 0) {
                        lat = parseFloat(data[0].lat);
                        lon = parseFloat(data[0].lon);
                    }
                } catch (error) {
                    console.error('Geocoding error:', error);
                }
            }

            const dataToSave = {
                ...workshopForm,
                latitude: lat,
                longitude: lon
            };

            if (mechanic) {
                await updateMechanicProfile(mechanic.id, dataToSave);
                const updatedMechanic = await getMechanicByUserId(user.uid);
                setMechanic(updatedMechanic);
            } else {
                await createMechanicProfile(user.uid, dataToSave);
                const newMechanic = await getMechanicByUserId(user.uid);
                setMechanic(newMechanic);
            }
            setShowWorkshopModal(false);
        } catch (error) {
            console.error('Error saving workshop:', error);
            alert('Failed to save workshop. Please try again.');
        } finally {
            setIsSavingWorkshop(false);
        }
    };

    const handleServiceToggle = (service: string) => {
        setWorkshopForm(prev => ({
            ...prev,
            services: prev.services.includes(service)
                ? prev.services.filter(s => s !== service)
                : [...prev.services, service]
        }));
    };

    const handleAcceptRequest = async (requestId: string) => {
        try {
            await updateRequestStatus(requestId, 'accepted');
            if (mechanic) {
                const updatedRequests = await getMechanicRequests(mechanic.id);
                setRequests(updatedRequests);
            }
        } catch (error) {
            console.error('Error accepting request:', error);
            alert('Failed to accept request. Please try again.');
        }
    };

    const handleRejectRequest = async (requestId: string) => {
        try {
            await updateRequestStatus(requestId, 'cancelled');
            if (mechanic) {
                const updatedRequests = await getMechanicRequests(mechanic.id);
                setRequests(updatedRequests);
            }
        } catch (error) {
            console.error('Error rejecting request:', error);
            alert('Failed to reject request. Please try again.');
        }
    };

    const handleCompleteRequest = async (requestId: string) => {
        try {
            await updateRequestStatus(requestId, 'completed');
            if (mechanic) {
                const updatedRequests = await getMechanicRequests(mechanic.id);
                setRequests(updatedRequests);
            }
        } catch (error) {
            console.error('Error completing request:', error);
            alert('Failed to complete request. Please try again.');
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
                    <p className="mt-4 text-slate-600 font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!mechanic) {
        return (
            <div className="min-h-screen bg-slate-50 relative">
                <Navbar />
                <div className="flex items-center justify-center min-h-[calc(100vh-80px)] pt-20">
                    <div className="text-center max-w-lg mx-auto p-8 rounded-3xl bg-white shadow-xl border border-slate-100">
                        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Building className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Setup Your Workshop</h2>
                        <p className="text-slate-600 mb-8 text-lg">
                            Complete your workshop profile to start receiving service requests from customers nearby.
                        </p>
                        <button
                            onClick={() => openWorkshopModal(false)}
                            className="w-full px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-500 hover:to-orange-500 transition-all font-bold shadow-xl shadow-red-500/20 hover:shadow-red-500/30 transform hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Create Workshop Profile
                        </button>
                    </div>
                </div>
                {/* Modal (included below) */}
                {renderWorkshopModal()}
            </div>
        );
    }

    const pendingRequests = requests.filter(r => r.status === 'pending');
    const activeRequests = requests.filter(r => r.status === 'accepted' || r.status === 'in_progress');
    const completedRequests = requests.filter(r => r.status === 'completed');

    const displayRequests =
        activeTab === 'pending' ? pendingRequests :
            activeTab === 'active' ? activeRequests :
                completedRequests;

    function renderWorkshopModal() {
        if (!showWorkshopModal) return null;
        return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
                    <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 p-6 flex items-center justify-between rounded-t-3xl z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
                                <Building className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">
                                    {mechanic ? 'Edit Workshop' : 'Add Workshop'}
                                </h2>
                                <p className="text-sm text-slate-500 font-medium">Update your workshop details</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowWorkshopModal(false)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleWorkshopSubmit} className="p-8 space-y-8">
                        {/* Personal Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                                <User className="w-5 h-5 text-red-500" /> Personal Information
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Your Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={workshopForm.name}
                                        onChange={(e) => setWorkshopForm({ ...workshopForm, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all font-medium text-slate-900"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        required
                                        value={workshopForm.phone}
                                        onChange={(e) => setWorkshopForm({ ...workshopForm, phone: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all font-medium text-slate-900"
                                        placeholder="+1234567890"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Workshop Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                                <Building className="w-5 h-5 text-red-500" /> Workshop Details
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Workshop Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={workshopForm.workshop_name}
                                        onChange={(e) => setWorkshopForm({ ...workshopForm, workshop_name: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all font-medium text-slate-900"
                                        placeholder="Awesome Auto Repair"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">City</label>
                                    <input
                                        type="text"
                                        required
                                        value={workshopForm.city}
                                        onChange={(e) => setWorkshopForm({ ...workshopForm, city: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all font-medium text-slate-900"
                                        placeholder="City, State"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Workshop Image</label>
                                {!workshopImagePreview ? (
                                    <label className="relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all hover:border-red-400 group">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-red-100 transition-all">
                                                <Upload className="w-6 h-6" />
                                            </div>
                                            <p className="mb-1 text-sm text-slate-500 font-medium">Click to upload photo</p>
                                            <p className="text-xs text-slate-400">PNG, JPG or WEBP (MAX. 5MB)</p>
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleWorkshopImageChange} />
                                    </label>
                                ) : (
                                    <div className="relative w-full h-48 rounded-2xl overflow-hidden group shadow-md ring-1 ring-slate-200">
                                        <img src={workshopImagePreview} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={removeWorkshopImage}
                                                className="bg-white text-red-600 p-3 rounded-full hover:bg-red-50 transition-all transform hover:scale-110 shadow-lg"
                                            >
                                                <X className="w-6 h-6" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Services */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                                <Wrench className="w-5 h-5 text-red-500" /> Services Offered
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {['car', 'bike', 'truck', 'emergency', 'towing', 'inspection'].map((service) => (
                                    <button
                                        key={service}
                                        type="button"
                                        onClick={() => handleServiceToggle(service)}
                                        className={`px-4 py-3 rounded-xl font-bold text-sm transition-all border transform active:scale-[0.98] ${workshopForm.services.includes(service)
                                            ? 'bg-red-50 border-red-200 text-red-600 shadow-sm ring-1 ring-red-200'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-red-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        {service.charAt(0).toUpperCase() + service.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4 pt-6 mt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setShowWorkshopModal(false)}
                                className="flex-1 px-6 py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all transform active:scale-[0.98]"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSavingWorkshop}
                                className="flex-1 px-6 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold hover:from-red-500 hover:to-orange-500 transition-all shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isSavingWorkshop ? 'Saving...' : (mechanic ? 'Save Changes' : 'Create Workshop')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
                {/* Hero Section */}
                <div className="relative overflow-hidden bg-gradient-to-br from-white via-white to-red-50/30 rounded-3xl shadow-2xl border border-slate-200/50 p-8 md:p-10 mb-8">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-red-100/40 to-orange-100/40 rounded-full blur-3xl opacity-60 -translate-y-1/2 translate-x-1/3" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-100/30 to-pink-100/30 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/3" />

                    <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="flex items-start gap-6 flex-1">
                            <div className="relative flex-shrink-0">
                                {mechanic?.photo ? (
                                    <img
                                        src={mechanic.photo}
                                        alt={mechanic.workshop_name}
                                        className="w-28 h-28 rounded-3xl object-cover shadow-xl border-4 border-white ring-2 ring-slate-200/50"
                                    />
                                ) : (
                                    <div className="w-28 h-28 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center border-4 border-white shadow-xl ring-2 ring-slate-200/50">
                                        <Wrench className="w-12 h-12 text-slate-400" />
                                    </div>
                                )}
                                <div className={`absolute -bottom-2 -right-2 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg border-2 border-white ${mechanic?.is_open ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 'bg-gradient-to-r from-slate-700 to-slate-800 text-white'}`}>
                                    {mechanic?.is_open ? '● OPEN' : '● CLOSED'}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-3">{mechanic?.workshop_name}</h1>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-600 mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                            <User className="w-4 h-4 text-slate-600" />
                                        </div>
                                        <span className="font-semibold text-slate-900">{mechanic?.name}</span>
                                    </div>
                                    <span className="text-slate-300">•</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                                            <MapPin className="w-4 h-4 text-red-500" />
                                        </div>
                                        <span className="font-medium">{mechanic?.city || 'No Location'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-50 to-orange-50 px-3 py-2 rounded-xl border border-yellow-200/50">
                                        <div className="flex">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-4 h-4 ${i < Math.floor(mechanic?.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200 fill-slate-200'}`} />
                                            ))}
                                        </div>
                                        <span className="text-sm font-bold text-slate-900 ml-1">
                                            {mechanic?.rating.toFixed(1)}
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium text-slate-500">
                                        {mechanic?.reviews_count} {mechanic?.reviews_count === 1 ? 'review' : 'reviews'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 lg:flex-shrink-0">
                            <button
                                onClick={() => openWorkshopModal(true)}
                                className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-500 hover:to-orange-500 transition-all font-bold shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5 active:scale-[0.98]"
                            >
                                <Edit className="w-4 h-4" />
                                <span>Edit Workshop</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 group-hover:text-red-500 transition-colors">Pending Requests</p>
                                <h3 className="text-3xl font-bold text-slate-900 mt-2">{pendingRequests.length}</h3>
                            </div>
                            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                <Clock className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 group-hover:text-blue-500 transition-colors">Active Jobs</p>
                                <h3 className="text-3xl font-bold text-slate-900 mt-2">{activeRequests.length}</h3>
                            </div>
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-500 group-hover:text-green-500 transition-colors">Completed</p>
                                <h3 className="text-3xl font-bold text-slate-900 mt-2">{completedRequests.length}</h3>
                            </div>
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                                <CheckCircle className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-lg shadow-slate-900/10 text-white group">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-400 group-hover:text-white transition-colors">Total Revenue</p>
                                <h3 className="text-3xl font-bold text-white mt-2">$0.00</h3>
                            </div>
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                <span className="text-xl font-bold">$</span>
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-slate-400 bg-white/5 inline-block px-2 py-1 rounded-lg border border-white/5">
                            Coming Soon
                        </div>
                    </div>
                </div>

                {/* Main Content Areas */}
                <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden min-h-[500px]">
                    <div className="border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-sm z-10 px-8 pt-6">
                        <div className="flex items-center gap-8">
                            <button
                                onClick={() => setActiveTab('pending')}
                                className={`pb-4 px-2 font-bold text-sm transition-all relative ${activeTab === 'pending'
                                    ? 'text-red-600'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Pending Requests
                                <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs ${activeTab === 'pending' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {pendingRequests.length}
                                </span>
                                {activeTab === 'pending' && (
                                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-t-full" />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('active')}
                                className={`pb-4 px-2 font-bold text-sm transition-all relative ${activeTab === 'active'
                                    ? 'text-red-600'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Active Jobs
                                <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs ${activeTab === 'active' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {activeRequests.length}
                                </span>
                                {activeTab === 'active' && (
                                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-t-full" />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('completed')}
                                className={`pb-4 px-2 font-bold text-sm transition-all relative ${activeTab === 'completed'
                                    ? 'text-red-600'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                Completed History
                                <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs ${activeTab === 'completed' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {completedRequests.length}
                                </span>
                                {activeTab === 'completed' && (
                                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 rounded-t-full" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="p-8 bg-slate-50/30 min-h-full">
                        {displayRequests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                                    <Search className="w-10 h-10 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">No {activeTab} requests</h3>
                                <p className="text-slate-500 max-w-md">
                                    {activeTab === 'pending' && "You're all caught up! New service requests will appear here instantly."}
                                    {activeTab === 'active' && "You don't have any active jobs right now."}
                                    {activeTab === 'completed' && "Your completed jobs history will show up here."}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {displayRequests.map((request) => (
                                    <div
                                        key={request.id}
                                        className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-red-200 transition-all duration-300"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-4 mb-3">
                                                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-lg border border-slate-200">
                                                        {request.userName?.charAt(0) || <User className="w-6 h-6" />}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-lg text-slate-900">{request.userName}</h4>
                                                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                                            <span>ID: <span className="font-mono">{request.id?.slice(0, 8)}</span></span>
                                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" />
                                                                {request.createdAt ? new Date(request.createdAt.toDate()).toLocaleDateString() : 'Date'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="ml-auto md:ml-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${request.urgency === 'emergency' ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' :
                                                            request.urgency === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                                request.urgency === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                                    'bg-green-50 text-green-700 border-green-200'
                                                            }`}>
                                                            {request.urgency === 'emergency' && <AlertCircle className="w-3 h-3" />}
                                                            {request.urgency || 'Standard'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="pl-16 mb-4">
                                                    <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
                                                        {request.description || <span className="italic text-slate-400">No description provided</span>}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-3">
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold border border-blue-100">
                                                            <Wrench className="w-3.5 h-3.5" />
                                                            {request.serviceType?.toUpperCase()}
                                                        </span>
                                                        {request.status === 'in_progress' && (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-bold border border-purple-100 animate-pulse">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                IN PROGRESS
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row items-center gap-3 md:self-center w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 pl-0 md:pl-6 md:border-l md:border-slate-100">
                                                {activeTab === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => request.id && handleRejectRequest(request.id)}
                                                            className="w-full sm:w-auto px-5 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all font-bold flex items-center justify-center gap-2 active:scale-[0.98]"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                            Decline
                                                        </button>
                                                        <button
                                                            onClick={() => request.id && handleAcceptRequest(request.id)}
                                                            className="w-full sm:w-auto px-8 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-bold flex items-center justify-center gap-2 shadow-xl shadow-slate-900/10 hover:-translate-y-0.5 active:scale-[0.98]"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                            Accept Job
                                                        </button>
                                                    </>
                                                )}
                                                {activeTab === 'active' && (
                                                    <button
                                                        onClick={() => request.id && handleCompleteRequest(request.id)}
                                                        className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all font-bold flex items-center justify-center gap-2 shadow-xl shadow-green-500/20 hover:-translate-y-0.5 active:scale-[0.98]"
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                        Mark as Complete
                                                    </button>
                                                )}
                                                {activeTab === 'completed' && (
                                                    <div className="flex items-center gap-2 px-6 py-3 bg-green-50 text-green-700 rounded-xl border border-green-100">
                                                        <CheckCircle className="w-5 h-5" />
                                                        <span className="font-bold">Completed</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {renderWorkshopModal()}
        </div>
    );
}
