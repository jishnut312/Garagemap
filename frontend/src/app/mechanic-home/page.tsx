'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import {
    Wrench,
    Calendar,
    DollarSign,
    TrendingUp,
    Bell,
    Settings,
    LogOut,
    ChevronDown,
    CheckCircle,
    Clock,
    Star,
    Users,
    MapPin,
    BarChart3
} from 'lucide-react';

export default function MechanicHomePage() {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Redirect non-mechanics
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (!loading && user && user.userType !== 'mechanic') {
            router.push('/');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-red-500 selection:text-white">
            {/* Navigation */}
            <nav className="fixed w-full z-50 top-0 start-0 border-b border-white/10 bg-slate-900/80 backdrop-blur-md supports-[backdrop-filter]:bg-slate-900/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <Link href="/mechanic-home" className="flex items-center space-x-3 group">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-red-500/25 transition-all duration-300">
                                <span className="text-white font-bold text-xl">G</span>
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tight group-hover:text-red-400 transition-colors">
                                GarageMap
                            </span>
                        </Link>

                        <div className="flex items-center space-x-8">
                            <Link href="/mechanic-home" className="text-white font-medium transition-colors text-sm uppercase tracking-wider">Home</Link>
                            <Link href="/mechanic-dashboard" className="text-slate-300 hover:text-white font-medium transition-colors text-sm uppercase tracking-wider">Dashboard</Link>
                            <Link href="/mechanic-profile" className="text-slate-300 hover:text-white font-medium transition-colors text-sm uppercase tracking-wider">Profile</Link>

                            {/* User Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">
                                            {user.displayName?.charAt(0) || user.email?.charAt(0) || 'M'}
                                        </span>
                                    </div>
                                    <span className="text-white text-sm font-medium">
                                        {user.displayName || user.email}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 z-50">
                                        <div className="px-4 py-3 border-b border-slate-100">
                                            <p className="text-sm font-semibold text-slate-900">{user.displayName || 'Mechanic'}</p>
                                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                        </div>

                                        <Link
                                            href="/mechanic-dashboard"
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                        >
                                            <Wrench className="w-4 h-4" />
                                            <span>Dashboard</span>
                                        </Link>

                                        <Link
                                            href="/mechanic-profile"
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                        >
                                            <Settings className="w-4 h-4" />
                                            <span>Settings</span>
                                        </Link>

                                        <button
                                            onClick={async () => {
                                                const confirmed = window.confirm('Are you sure you want to logout?');
                                                if (confirmed) {
                                                    await signOut();
                                                    router.push('/');
                                                }
                                            }}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-900">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-1000"></div>
                    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] mix-blend-screen"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-slate-300 text-sm mb-8 backdrop-blur-sm">
                        <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                        Welcome back, {user.displayName?.split(' ')[0] || 'Mechanic'}!
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight mb-8 leading-tight">
                        Manage Your Business. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">
                            Grow Your Revenue.
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
                        Your central hub for managing service requests, tracking earnings, and connecting with customers.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/mechanic-dashboard" className="w-full sm:w-auto px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl shadow-red-500/20 flex items-center justify-center gap-2">
                            <Wrench className="w-5 h-5" />
                            View Dashboard
                        </Link>
                        <Link href="/mechanic-profile" className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-lg transition-all duration-300 border border-slate-700 flex items-center justify-center gap-2">
                            <Settings className="w-5 h-5" />
                            Settings
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-slate-800 pt-12">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white mb-1">12</div>
                            <div className="text-slate-500 text-sm uppercase tracking-wider font-medium">Pending Requests</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white mb-1">45</div>
                            <div className="text-slate-500 text-sm uppercase tracking-wider font-medium">Active Jobs</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white mb-1">234</div>
                            <div className="text-slate-500 text-sm uppercase tracking-wider font-medium">Completed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white mb-1">4.8/5</div>
                            <div className="text-slate-500 text-sm uppercase tracking-wider font-medium">Your Rating</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-8 -mt-32 relative z-20">
                        {/* Quick Action 1 */}
                        <Link href="/mechanic-dashboard" className="group bg-white rounded-[2rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-all duration-500">
                            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                                <Clock className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-3xl font-bold text-slate-900 mb-4">Manage Requests</h3>
                            <p className="text-slate-600 text-lg leading-relaxed mb-8">
                                View and respond to service requests from customers in your area. Accept, schedule, and complete jobs.
                            </p>
                            <span className="inline-flex items-center text-red-500 font-bold">
                                Go to Dashboard <span className="ml-2">→</span>
                            </span>
                        </Link>

                        {/* Quick Action 2 */}
                        <Link href="/mechanic-earnings" className="group bg-slate-900 rounded-[2rem] p-10 shadow-2xl shadow-slate-900/20 hover:-translate-y-2 transition-all duration-500">
                            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                                <BarChart3 className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-4">Track Earnings</h3>
                            <p className="text-slate-400 text-lg leading-relaxed mb-8">
                                Monitor your revenue, view payment history, and analyze your business performance.
                            </p>
                            <span className="inline-flex items-center text-white font-bold">
                                View Analytics <span className="ml-2">→</span>
                            </span>
                        </Link>
                    </div>

                    {/* Additional Action Cards */}
                    <div className="grid md:grid-cols-3 gap-8 mt-8">
                        <Link href="/mechanic-profile" className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 hover:shadow-xl hover:border-red-200 transition-all group">
                            <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center mb-6">
                                <Settings className="w-7 h-7 text-orange-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Update Profile</h3>
                            <p className="text-slate-600 mb-4">Manage your services, rates, and availability</p>
                            <span className="text-red-500 font-semibold group-hover:gap-2 inline-flex items-center transition-all">
                                Edit Profile <span className="ml-1">→</span>
                            </span>
                        </Link>

                        <Link href="/mechanic-calendar" className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 hover:shadow-xl hover:border-red-200 transition-all group">
                            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                                <Calendar className="w-7 h-7 text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Schedule</h3>
                            <p className="text-slate-600 mb-4">View and manage your appointments</p>
                            <span className="text-red-500 font-semibold group-hover:gap-2 inline-flex items-center transition-all">
                                Open Calendar <span className="ml-1">→</span>
                            </span>
                        </Link>

                        <Link href="/mechanic-reviews" className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100 hover:shadow-xl hover:border-red-200 transition-all group">
                            <div className="w-14 h-14 bg-yellow-50 rounded-xl flex items-center justify-center mb-6">
                                <Star className="w-7 h-7 text-yellow-500" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">Reviews</h3>
                            <p className="text-slate-600 mb-4">See what customers are saying about you</p>
                            <span className="text-red-500 font-semibold group-hover:gap-2 inline-flex items-center transition-all">
                                View Reviews <span className="ml-1">→</span>
                            </span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white border-t border-slate-100 py-12">
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
                            <Link href="/support" className="text-slate-400 hover:text-slate-900 text-sm">Support</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
