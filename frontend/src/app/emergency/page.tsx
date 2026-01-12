'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getMechanics, type Mechanic, createRequest } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { Phone, MapPin, AlertCircle, ArrowLeft } from 'lucide-react';

export default function EmergencyPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [mechanics, setMechanics] = useState<Mechanic[]>([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (err) => console.error(err)
            );
        }

        const loadData = async () => {
            const all = await getMechanics();
            // Filter for emergency services
            const emergency = all.filter(m => m.services.includes('emergency'));
            setMechanics(emergency);
            setLoading(false);
        };
        loadData();
    }, []);

    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const handleSOS = async (mechanic: Mechanic) => {
        if (!user) {
            router.push('/login');
            return;
        }
        if (!confirm(`Request IMMEDIATE emergency assistance from ${mechanic.workshop_name}?`)) return;

        try {
            await createRequest({
                userId: user.uid,
                mechanicId: mechanic.id,
                mechanicUserId: mechanic.userId,
                userName: user.displayName || 'User',
                mechanicName: mechanic.name,
                serviceType: 'emergency',
                status: 'pending',
                urgency: 'emergency',
                description: 'EMERGENCY SOS REQUEST',
            });
            alert('SOS REQUEST SENT! Help is on the way.');
            router.push('/dashboard');
        } catch (e) {
            alert('Failed to send SOS. Please call directly.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            <div className="max-w-md mx-auto min-h-screen flex flex-col p-4">

                <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 mb-6 hover:text-white">
                    <ArrowLeft className="w-5 h-5" /> Back
                </button>

                <div className="flex items-center gap-3 mb-8 animate-pulse">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                        <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-white">EMERGENCY</h1>
                </div>

                <div className="bg-red-600 rounded-2xl p-6 mb-8 shadow-xl text-center">
                    <h2 className="text-xl font-bold mb-2">Need Medical or Police?</h2>
                    <a href="tel:911" className="block bg-white text-red-600 font-black text-2xl py-4 rounded-xl hover:bg-slate-100 transition-colors">
                        CALL 911
                    </a>
                </div>

                <h3 className="text-slate-400 font-bold uppercase tracking-wider text-sm mb-4">Nearby Roadside Assistance</h3>

                {loading ? (
                    <div className="text-center py-10 text-slate-500">Locating help...</div>
                ) : mechanics.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">No emergency mechanics found nearby.</div>
                ) : (
                    <div className="space-y-4">
                        {mechanics.sort((a, b) => {
                            if (!userLocation) return 0;
                            const dA = calculateDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude);
                            const dB = calculateDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
                            return dA - dB;
                        }).map(mechanic => (
                            <div key={mechanic.id} className="bg-slate-800 rounded-xl p-5 border border-slate-700 hover:border-red-500/50 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-bold text-lg">{mechanic.workshop_name}</h4>
                                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                                            <MapPin className="w-3 h-3" />
                                            {userLocation ? `${calculateDistance(userLocation.lat, userLocation.lng, mechanic.latitude, mechanic.longitude).toFixed(1)} km away` : mechanic.city}
                                        </div>
                                    </div>
                                    <span className="bg-red-500/10 text-red-500 px-2 py-1 rounded text-xs font-bold border border-red-500/20">24/7</span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <a href={`tel:${mechanic.phone}`} className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 py-3 rounded-lg font-bold transition-colors">
                                        <Phone className="w-4 h-4" /> Call
                                    </a>
                                    <button onClick={() => handleSOS(mechanic)} className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 py-3 rounded-lg font-bold transition-colors shadow-lg shadow-red-600/20">
                                        <AlertCircle className="w-4 h-4" /> REQUEST
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
