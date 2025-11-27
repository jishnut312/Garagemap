'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
    getMechanicRequests,
    getMechanicByUserId,
    updateRequestStatus,
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
    LogOut
} from 'lucide-react';

export default function MechanicDashboard() {
    const { user, loading: authLoading, signOut } = useAuth();
    const [mechanic, setMechanic] = useState<Mechanic | null>(null);
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'completed'>('pending');
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
                // Fetch mechanic profile
                const mechanicData = await getMechanicByUserId(user.uid);
                setMechanic(mechanicData);

                // Fetch service requests
                if (mechanicData) {
                    const requestsData = await getMechanicRequests(mechanicData.id);
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

    const handleAcceptRequest = async (requestId: string) => {
        try {
            await updateRequestStatus(requestId, 'accepted');
            // Refresh requests
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
            // Refresh requests
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
            // Refresh requests
            if (mechanic) {
                const updatedRequests = await getMechanicRequests(mechanic.id);
                setRequests(updatedRequests);
            }
        } catch (error) {
            console.error('Error completing request:', error);
            alert('Failed to complete request. Please try again.');
        }
    };

    const handleLogout = async () => {
        try {
            await signOut();
            router.push('/');
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
                    <p className="mt-4 text-slate-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (!mechanic) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Mechanic Profile Not Found</h2>
                    <p className="text-slate-600 mb-6">
                        Your mechanic profile hasn't been set up yet. Please contact support.
                    </p>
                    <button
                        onClick={handleLogout}
                        className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                        Return to Home
                    </button>
                </div>
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

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Wrench className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-slate-900">{mechanic.workshop_name}</h1>
                                <p className="text-sm text-slate-600">{mechanic.name}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Stats Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                                <Clock className="w-6 h-6 text-orange-500" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-slate-900">{pendingRequests.length}</div>
                        <div className="text-sm text-slate-600 mt-1">Pending Requests</div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-blue-500" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-slate-900">{activeRequests.length}</div>
                        <div className="text-sm text-slate-600 mt-1">Active Jobs</div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-500" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-slate-900">{completedRequests.length}</div>
                        <div className="text-sm text-slate-600 mt-1">Completed</div>
                    </div>

                    <div className="bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl p-6 shadow-lg text-white">
                        <div className="flex items-center justify-between mb-2">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <Star className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold">{mechanic.rating.toFixed(1)}</div>
                        <div className="text-sm text-white/80 mt-1">Average Rating</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="border-b border-slate-200">
                        <div className="flex">
                            <button
                                onClick={() => setActiveTab('pending')}
                                className={`flex-1 px-6 py-4 font-semibold text-sm transition-colors ${activeTab === 'pending'
                                        ? 'text-red-500 border-b-2 border-red-500 bg-red-50/50'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                            >
                                Pending ({pendingRequests.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('active')}
                                className={`flex-1 px-6 py-4 font-semibold text-sm transition-colors ${activeTab === 'active'
                                        ? 'text-red-500 border-b-2 border-red-500 bg-red-50/50'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                            >
                                Active ({activeRequests.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('completed')}
                                className={`flex-1 px-6 py-4 font-semibold text-sm transition-colors ${activeTab === 'completed'
                                        ? 'text-red-500 border-b-2 border-red-500 bg-red-50/50'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                    }`}
                            >
                                Completed ({completedRequests.length})
                            </button>
                        </div>
                    </div>

                    {/* Request List */}
                    <div className="p-6">
                        {displayRequests.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Wrench className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">No {activeTab} requests</h3>
                                <p className="text-slate-600">
                                    {activeTab === 'pending' && "You're all caught up! New requests will appear here."}
                                    {activeTab === 'active' && "No active jobs at the moment."}
                                    {activeTab === 'completed' && "No completed jobs yet."}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {displayRequests.map((request) => (
                                    <div
                                        key={request.id}
                                        className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:border-red-200 hover:shadow-md transition-all"
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <User className="w-4 h-4 text-slate-500" />
                                                            <span className="font-semibold text-slate-900">{request.userName}</span>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${request.urgency === 'emergency' ? 'bg-red-100 text-red-700' :
                                                                    request.urgency === 'high' ? 'bg-orange-100 text-orange-700' :
                                                                        request.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                                            'bg-green-100 text-green-700'
                                                                }`}>
                                                                {request.urgency}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-slate-600 mb-2">{request.description || 'No description provided'}</p>
                                                        <div className="flex items-center gap-4 text-sm text-slate-500">
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-4 h-4" />
                                                                {new Date(request.createdAt.toDate()).toLocaleDateString()}
                                                            </span>
                                                            <span className="capitalize px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                                                                {request.serviceType}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {activeTab === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => request.id && handleAcceptRequest(request.id)}
                                                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => request.id && handleRejectRequest(request.id)}
                                                            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {activeTab === 'active' && (
                                                    <button
                                                        onClick={() => request.id && handleCompleteRequest(request.id)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        Mark Complete
                                                    </button>
                                                )}
                                                {activeTab === 'completed' && (
                                                    <div className="flex items-center gap-2 text-green-600">
                                                        <CheckCircle className="w-5 h-5" />
                                                        <span className="font-medium">Completed</span>
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
            </div>
        </div>
    );
}
