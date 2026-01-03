'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import {
    getMyWorkshop,
    updateWorkshop,
    createWorkshop,
    type Workshop
} from '@/lib/django-api';
import {
    User,
    MapPin,
    Phone,
    Building,
    Wrench,
    Clock,
    Camera,
    Save,
    LogOut,
    ChevronRight,
    Loader2,
    CheckCircle,
    ArrowLeft,
    Upload,
    X
} from 'lucide-react';

export default function MechanicProfilePage() {
    const { user, loading: authLoading, signOut } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [mechanic, setMechanic] = useState<Workshop | null>(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [activeSection, setActiveSection] = useState<'details' | 'services' | 'account'>('details');

    const [formData, setFormData] = useState({
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

    const [imagePreview, setImagePreview] = useState('');

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user && user.userType !== 'mechanic') {
            router.push('/dashboard');
            return;
        }

        if (user) {
            loadMechanicData(user.uid);
        }
    }, [user, authLoading, router]);

    const loadMechanicData = async (uid: string) => {
        try {
            // Note: getMyWorkshop relies on the auth token, not the passed uid
            const data = await getMyWorkshop();
            setMechanic(data);
            if (data) {
                setFormData({
                    name: data.mechanic_name || '',
                    phone: data.phone || '',
                    workshop_name: data.workshop_name || '',
                    city: data.city || '',
                    latitude: data.latitude || 0,
                    longitude: data.longitude || 0,
                    services: data.services || [],
                    rating: data.rating || 0,
                    is_open: data.is_open,
                    photo: data.photo || '',
                    reviews_count: data.reviews_count || 0
                });
                if (data.photo) {
                    setImagePreview(data.photo);
                }
            }
        } catch (error) {
            console.log('No existing profile found or error loading:', error);
            // Initialize with user data if available
            setFormData(prev => ({
                ...prev,
                name: user?.displayName || '',
                // Default open
                is_open: true
            }));
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                    setImagePreview(base64String);
                    setFormData(prev => ({ ...prev, photo: base64String }));
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleServiceToggle = (service: string) => {
        setFormData(prev => ({
            ...prev,
            services: prev.services.includes(service)
                ? prev.services.filter(s => s !== service)
                : [...prev.services, service]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccessMessage('');

        try {
            // Geocoding if city changed (basic)
            let lat = formData.latitude;
            let lon = formData.longitude;

            // Simple check: only geocode if 0,0 or specifically requested (omitted for speed unless needed)
            // But we should try to keep it updated if city changes. 
            // For now, we reuse the dashboard logic: always try to geocode based on city
            if (formData.city && (lat === 0 || mechanic?.city !== formData.city)) {
                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.city)}`);
                    const data = await response.json();
                    if (data && data.length > 0) {
                        lat = parseFloat(data[0].lat);
                        lon = parseFloat(data[0].lon);
                    }
                } catch (error) {
                    console.error('Geocoding error:', error);
                    // Keep old coords if fail
                }
            }

            const dataToSave = {
                mechanic_name: formData.name,
                workshop_name: formData.workshop_name,
                phone: formData.phone,
                city: formData.city,
                latitude: lat,
                longitude: lon,
                services: formData.services,
                is_open: formData.is_open,
                photo: formData.photo
            };

            if (mechanic) {
                await updateWorkshop(mechanic.id, dataToSave);
            } else {
                await createWorkshop(dataToSave);
            }

            // Refresh local data
            if (user) await loadMechanicData(user.uid);

            setSuccessMessage('Profile updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Failed to save profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Navbar />

            <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/mechanic-dashboard" className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-slate-500 hover:text-slate-700">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
                        <p className="text-slate-500">Manage your workshop profile and preferences</p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <div className="w-full lg:w-64 flex-shrink-0 space-y-4">
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                            <nav className="space-y-1">
                                <button
                                    onClick={() => setActiveSection('details')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeSection === 'details'
                                        ? 'bg-red-50 text-red-600'
                                        : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <Building className="w-4 h-4" />
                                    Workshop Details
                                </button>
                                <button
                                    onClick={() => setActiveSection('services')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeSection === 'services'
                                        ? 'bg-red-50 text-red-600'
                                        : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <Wrench className="w-4 h-4" />
                                    Services
                                </button>
                                <button
                                    onClick={() => setActiveSection('account')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeSection === 'account'
                                        ? 'bg-red-50 text-red-600'
                                        : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <User className="w-4 h-4" />
                                    Account
                                </button>
                            </nav>
                        </div>

                        {/* Status Card */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-slate-400" />
                                Availability Status
                            </h3>
                            <div className="flex items-center justify-between mb-4">
                                <span className={`text-sm font-medium ${formData.is_open ? 'text-green-600' : 'text-slate-500'}`}>
                                    {formData.is_open ? 'Current: Open' : 'Current: Closed'}
                                </span>
                                <div
                                    onClick={() => setFormData(prev => ({ ...prev, is_open: !prev.is_open }))}
                                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${formData.is_open ? 'bg-green-500' : 'bg-slate-200'}`}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform duration-300 ${formData.is_open ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                            </div>
                            <p className="text-xs text-slate-500">
                                {formData.is_open
                                    ? "You are visible on the map and can receive requests."
                                    : "You are hidden from the map. Switch to Open to start working."}
                            </p>
                        </div>
                    </div>

                    {/* Main Content Form */}
                    <div className="flex-1">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Workshop Details Section */}
                            <div className={`${activeSection === 'details' ? 'block' : 'hidden'} space-y-6`}>
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                        <h2 className="text-lg font-bold text-slate-900">Workshop Information</h2>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        {/* Image Upload */}
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">Workshop Image</label>
                                            <div className="flex items-center gap-6">
                                                <div className="relative">
                                                    {imagePreview ? (
                                                        <div className="w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-slate-100">
                                                            <img src={imagePreview} alt="Workshop" className="w-full h-full object-cover" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-24 h-24 bg-slate-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200">
                                                            <Camera className="w-8 h-8 text-slate-300" />
                                                        </div>
                                                    )}
                                                    <label className="absolute -bottom-2 -right-2 p-2 bg-white rounded-full shadow-md border border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors">
                                                        <Upload className="w-4 h-4 text-slate-600" />
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                                    </label>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-sm font-medium text-slate-900">Cover Photo</h3>
                                                    <p className="text-sm text-slate-500 mt-1">
                                                        Upload a photo of your workshop to build trust with customers.
                                                    </p>
                                                    {imagePreview && (
                                                        <button
                                                            type="button"
                                                            onClick={() => { setImagePreview(''); setFormData(prev => ({ ...prev, photo: '' })) }}
                                                            className="text-xs text-red-500 hover:text-red-600 font-medium mt-2"
                                                        >
                                                            Remove photo
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="col-span-2">
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Workshop Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.workshop_name}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, workshop_name: e.target.value }))}
                                                    className="w-full px-4 py-3 text-slate-500 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                                    placeholder="e.g. Mike's Auto Repair"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Your Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={formData.name}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                    className="w-full px-4 py-3 text-slate-500  bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                                    placeholder="e.g. Michael Smith"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    required
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                                    className="w-full px-4 py-3 text-slate-500 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                                    placeholder="e.g. +1 234 567 890"
                                                />
                                            </div>

                                            <div className="col-span-2">
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                    City / Location
                                                </label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        required
                                                        value={formData.city}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                                        className="w-full pl-12 pr-4 py-3  text-slate-500 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                                                        placeholder="e.g. New York, NY"
                                                    />
                                                </div>
                                                <p className="text-xs text-slate-500 mt-2">
                                                    We'll try to locate you on the map based on this city name.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Services Section */}
                            <div className={`${activeSection === 'services' ? 'block' : 'hidden'} space-y-6`}>
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                        <h2 className="text-lg font-bold text-slate-900">Services Offered</h2>
                                    </div>
                                    <div className="p-6">
                                        <p className="text-sm text-slate-500 mb-6">Select all the services you are equipped to handle.</p>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {['car', 'bike', 'truck', 'emergency', 'towing', 'inspection'].map((service) => (
                                                <button
                                                    key={service}
                                                    type="button"
                                                    onClick={() => handleServiceToggle(service)}
                                                    className={`p-4 rounded-xl border-2 text-left transition-all ${formData.services.includes(service)
                                                        ? 'border-red-500 bg-red-50/50'
                                                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-bold text-slate-900 capitalize">{service}</span>
                                                        {formData.services.includes(service) && (
                                                            <CheckCircle className="w-5 h-5 text-red-500" />
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-slate-500">
                                                        {formData.services.includes(service) ? 'Active' : 'Not Selected'}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Account Section */}
                            <div className={`${activeSection === 'account' ? 'block' : 'hidden'} space-y-6`}>
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                        <h2 className="text-lg font-bold text-slate-900">Account Management</h2>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 mb-6">
                                            <div>
                                                <h3 className="font-semibold text-slate-900">Email Address</h3>
                                                <p className="text-sm text-slate-500">{user?.email}</p>
                                            </div>
                                            <span className="px-3 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded-full uppercase">
                                                Verified
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={async () => {
                                                const confirmed = window.confirm('Are you sure you want to logout?');
                                                if (confirmed) {
                                                    await signOut();
                                                    router.push('/');
                                                }
                                            }}
                                            className="w-full flex items-center justify-center gap-2 p-4 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl font-bold transition-all"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            Log Out
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button (Sticky Bottom) */}
                            <div className="sticky bottom-4 z-10">
                                <div className="bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 text-white">
                                    <div className="hidden sm:block pl-2">
                                        {successMessage ? (
                                            <span className="text-green-400 font-medium flex items-center gap-2">
                                                <CheckCircle className="w-5 h-5" /> {successMessage}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 text-sm">
                                                Don't forget to save your changes
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={saving || (mechanic ? JSON.stringify({
                                            name: formData.name,
                                            phone: formData.phone,
                                            workshop_name: formData.workshop_name,
                                            city: formData.city,
                                            services: [...formData.services].sort(),
                                            is_open: formData.is_open,
                                            photo: formData.photo
                                        }) === JSON.stringify({
                                            name: mechanic.mechanic_name || '',
                                            phone: mechanic.phone || '',
                                            workshop_name: mechanic.workshop_name || '',
                                            city: mechanic.city || '',
                                            services: [...(mechanic.services || [])].sort(),
                                            is_open: mechanic.is_open,
                                            photo: mechanic.photo || ''
                                        }) : false)}
                                        className="w-full sm:w-auto px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5" />
                                                {successMessage ? 'Saved' : 'Save'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
