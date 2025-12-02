'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
    Menu,
    X,
    ChevronDown,
    Car,
    Wrench
} from 'lucide-react';

export default function Navbar() {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.user-dropdown')) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isDropdownOpen]);

    const handleLogout = async () => {
        const confirmed = window.confirm('Are you sure you want to logout?');
        if (confirmed) {
            await signOut();
            setIsDropdownOpen(false);
            router.push('/');
        }
    };

    return (
        <nav className="fixed w-full z-50 top-0 start-0 border-b border-white/10 bg-slate-900/80 backdrop-blur-md supports-[backdrop-filter]:bg-slate-900/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link href={user?.userType === 'mechanic' ? "/mechanic-home" : "/"} className="flex items-center space-x-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-red-500/25 transition-all duration-300">
                            <span className="text-white font-bold text-xl">G</span>
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight group-hover:text-red-400 transition-colors">
                            GarageMap
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {!loading && (
                            user?.userType === 'mechanic' ? (
                                <>
                                    <Link href="/mechanic-home" className="text-slate-300 hover:text-white font-medium transition-colors text-sm uppercase tracking-wider">Home</Link>
                                    <Link href="/mechanic-dashboard" className="text-slate-300 hover:text-white font-medium transition-colors text-sm uppercase tracking-wider">Dashboard</Link>
                                </>
                            ) : (
                                <>
                                    <Link href="/" className="text-slate-300 hover:text-white font-medium transition-colors text-sm uppercase tracking-wider">Home</Link>
                                    <Link href="/dashboard" className="text-slate-300 hover:text-white font-medium transition-colors text-sm uppercase tracking-wider">Garages</Link>
                                    <Link href="/services" className="text-slate-300 hover:text-white font-medium transition-colors text-sm uppercase tracking-wider">Services</Link>
                                </>
                            )
                        )}

                        {!loading && !user && (
                            <Link href="/login" className="text-slate-300 hover:text-white font-medium transition-colors text-sm uppercase tracking-wider">Login</Link>
                        )}

                        <Link href="/emergency" className="group flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 border border-red-500/20">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                            <span className="font-semibold text-sm">Emergency</span>
                        </Link>

                        {!loading && !user ? (
                            <Link href="/signup" className="bg-white text-slate-900 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-slate-200 transition-all duration-300 shadow-lg shadow-white/10">
                                Get Started
                            </Link>
                        ) : user && (
                            <div className="relative user-dropdown">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">
                                            {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                                        </span>
                                    </div>
                                    <span className="text-white text-sm font-medium">
                                        {user.displayName || user.email}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 z-50 overflow-hidden">
                                        <div className="px-4 py-3 border-b border-slate-100">
                                            <p className="text-sm font-semibold text-slate-900">{user.displayName || 'User'}</p>
                                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                        </div>

                                        {user.userType === 'customer' && (
                                            <Link
                                                href="/dashboard"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                <Car className="w-4 h-4" />
                                                <span>Dashboard</span>
                                            </Link>
                                        )}

                                        {user.userType === 'mechanic' && (
                                            <Link
                                                href="/mechanic-dashboard"
                                                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                                onClick={() => setIsDropdownOpen(false)}
                                            >
                                                <Wrench className="w-4 h-4" />
                                                <span>Mechanic Dashboard</span>
                                            </Link>
                                        )}

                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                                        >
                                            <X className="w-4 h-4" />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-slate-300 hover:text-white"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-slate-900 border-t border-slate-800">
                    <div className="px-4 pt-2 pb-3 space-y-1">
                        {!loading && (
                            user?.userType === 'mechanic' ? (
                                <>
                                    <Link href="/mechanic-home" className="block px-3 py-2 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-md">Home</Link>
                                    <Link href="/mechanic-dashboard" className="block px-3 py-2 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-md">Dashboard</Link>
                                </>
                            ) : (
                                <>
                                    <Link href="/" className="block px-3 py-2 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-md">Home</Link>
                                    <Link href="/dashboard" className="block px-3 py-2 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-md">Garages</Link>
                                    <Link href="/services" className="block px-3 py-2 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-md">Services</Link>
                                </>
                            )
                        )}
                        <Link href="/emergency" className="block px-3 py-2 text-base font-medium text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-md">Emergency</Link>

                        {!loading && !user && (
                            <>
                                <Link href="/login" className="block px-3 py-2 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-md">Login</Link>
                                <Link href="/signup" className="block px-3 py-2 text-base font-medium text-white bg-red-600 hover:bg-red-700 rounded-md mt-4">Get Started</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
