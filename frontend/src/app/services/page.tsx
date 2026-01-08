'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import {
    Wrench,
    Car,
    Cog,
    Gauge,
    Zap,
    Settings,
    Droplet,
    Wind,
    Shield,
    Battery,
    Layers,
    CheckCircle,
    ArrowRight,
    Clock,
    Star,
    MapPin
} from 'lucide-react';

interface Service {
    icon: any;
    title: string;
    description: string;
    features: string[];
    gradient: string;
    borderGradient: string;
}

export default function ServicesPage() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const services: Service[] = [
        {
            icon: Wrench,
            title: "General Repairs",
            description: "Comprehensive vehicle maintenance and repair services for all makes and models",
            features: [
                "Brake System Repair",
                "Suspension & Steering",
                "Exhaust System Work",
                "Transmission Services"
            ],
            gradient: "from-red-500 to-orange-600",
            borderGradient: "from-red-500/50 to-orange-600/50"
        },
        {
            icon: Cog,
            title: "Engine Diagnostics",
            description: "Advanced computer diagnostics to identify and resolve engine issues quickly",
            features: [
                "OBD-II Scanning",
                "Engine Performance Testing",
                "Error Code Analysis",
                "Fuel System Diagnostics"
            ],
            gradient: "from-blue-500 to-cyan-600",
            borderGradient: "from-blue-500/50 to-cyan-600/50"
        },
        {
            icon: Droplet,
            title: "Oil Change & Fluids",
            description: "Regular maintenance services to keep your vehicle running smoothly",
            features: [
                "Full Synthetic Oil Change",
                "Coolant Flush",
                "Transmission Fluid",
                "Brake Fluid Service"
            ],
            gradient: "from-purple-500 to-pink-600",
            borderGradient: "from-purple-500/50 to-pink-600/50"
        },
        {
            icon: Battery,
            title: "Electrical Services",
            description: "Expert electrical system repairs and battery replacement services",
            features: [
                "Battery Testing & Replacement",
                "Alternator Repair",
                "Starter Motor Service",
                "Wiring & Fuse Work"
            ],
            gradient: "from-yellow-500 to-orange-600",
            borderGradient: "from-yellow-500/50 to-orange-600/50"
        },
        {
            icon: Wind,
            title: "AC & Heating",
            description: "Complete climate control system repair and maintenance",
            features: [
                "AC Recharge",
                "Heater Core Repair",
                "Compressor Service",
                "Climate Control Diagnostics"
            ],
            gradient: "from-teal-500 to-green-600",
            borderGradient: "from-teal-500/50 to-green-600/50"
        },
        {
            icon: Settings,
            title: "Tire Services",
            description: "Professional tire installation, rotation, and balancing services",
            features: [
                "Tire Installation",
                "Wheel Alignment",
                "Tire Rotation",
                "Puncture Repair"
            ],
            gradient: "from-indigo-500 to-purple-600",
            borderGradient: "from-indigo-500/50 to-purple-600/50"
        },
        {
            icon: Shield,
            title: "Safety Inspections",
            description: "Thorough vehicle safety checks and state inspection services",
            features: [
                "Annual Safety Inspection",
                "Pre-Purchase Inspection",
                "Emissions Testing",
                "Brake Safety Check"
            ],
            gradient: "from-green-500 to-emerald-600",
            borderGradient: "from-green-500/50 to-emerald-600/50"
        },
        {
            icon: Layers,
            title: "Body & Paint",
            description: "Collision repair, dent removal, and professional painting services",
            features: [
                "Dent & Scratch Repair",
                "Auto Body Work",
                "Paint Matching",
                "Collision Restoration"
            ],
            gradient: "from-rose-500 to-red-600",
            borderGradient: "from-rose-500/50 to-red-600/50"
        },
        {
            icon: Gauge,
            title: "Performance Tuning",
            description: "Enhance your vehicle's performance with expert tuning services",
            features: [
                "ECU Remapping",
                "Performance Exhaust",
                "Turbo Installation",
                "Custom Chip Tuning"
            ],
            gradient: "from-orange-500 to-red-600",
            borderGradient: "from-orange-500/50 to-red-600/50"
        }
    ];

    const benefits = [
        {
            icon: Clock,
            title: "Fast Service",
            description: "Quick turnaround times without compromising quality"
        },
        {
            icon: Star,
            title: "Expert Mechanics",
            description: "Certified professionals with years of experience"
        },
        {
            icon: MapPin,
            title: "Convenient Locations",
            description: "Find mechanics near you with our location-based search"
        },
        {
            icon: Shield,
            title: "Quality Guarantee",
            description: "All work backed by our satisfaction guarantee"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
                </div>

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-6">
                        <Wrench className="w-4 h-4 text-red-400" />
                        <span className="text-red-400 text-sm font-semibold">Professional Auto Services</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                        Comprehensive
                        <span className="bg-gradient-to-r from-red-500 to-orange-600 bg-clip-text text-transparent"> Auto Services</span>
                    </h1>

                    <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
                        From routine maintenance to complex repairs, our network of certified mechanics
                        provides top-quality service for all your automotive needs.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            href="/dashboard"
                            className="group px-8 py-4 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-red-500/30 transition-all duration-300 flex items-center gap-2"
                        >
                            Find a Mechanic
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/emergency"
                            className="px-8 py-4 border-2 border-red-500/30 text-white rounded-full font-bold text-lg hover:bg-red-500/10 transition-all duration-300"
                        >
                            Emergency Service
                        </Link>
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Our Services
                        </h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            Expert automotive solutions tailored to your vehicle's needs
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((service, index) => {
                            const Icon = service.icon;
                            return (
                                <div
                                    key={index}
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                    className="group relative bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-8 hover:border-slate-700 transition-all duration-500 overflow-hidden"
                                >
                                    {/* Gradient Border Effect */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${service.borderGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`}></div>

                                    {/* Content */}
                                    <div className="relative z-10">
                                        {/* Icon */}
                                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                            <Icon className="w-8 h-8 text-white" />
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-slate-400 transition-all duration-300">
                                            {service.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-slate-400 mb-6 leading-relaxed">
                                            {service.description}
                                        </p>

                                        {/* Features */}
                                        <ul className="space-y-2">
                                            {service.features.map((feature, featureIndex) => (
                                                <li
                                                    key={featureIndex}
                                                    className="flex items-start gap-2 text-slate-300 text-sm"
                                                    style={{
                                                        opacity: hoveredIndex === index ? 1 : 0.7,
                                                        transform: hoveredIndex === index ? 'translateX(4px)' : 'translateX(0)',
                                                        transition: `all 0.3s ease ${featureIndex * 50}ms`
                                                    }}
                                                >
                                                    <CheckCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 text-gradient-to-br ${service.gradient}`} />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Why Choose GarageMap
                        </h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            Your trusted partner for automotive excellence
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {benefits.map((benefit, index) => {
                            const Icon = benefit.icon;
                            return (
                                <div
                                    key={index}
                                    className="text-center group"
                                >
                                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-red-500/10 to-orange-600/10 border border-red-500/20 flex items-center justify-center group-hover:scale-110 group-hover:border-red-500/40 transition-all duration-300">
                                        <Icon className="w-10 h-10 text-red-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-slate-400">
                                        {benefit.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="relative bg-gradient-to-br from-red-500 to-orange-600 rounded-3xl p-12 overflow-hidden shadow-2xl">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute inset-0" style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                            }}></div>
                        </div>

                        <div className="relative z-10 text-center">
                            <Car className="w-16 h-16 text-white mx-auto mb-6" />
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                Ready to Get Your Car Serviced?
                            </h2>
                            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                                Find trusted mechanics near you and book your service appointment today.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href="/dashboard"
                                    className="px-8 py-4 bg-white text-red-600 rounded-full font-bold text-lg hover:bg-slate-100 transition-all duration-300 shadow-xl"
                                >
                                    Browse Mechanics
                                </Link>
                                <Link
                                    href="/signup"
                                    className="px-8 py-4 border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all duration-300"
                                >
                                    Sign Up Free
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-800 py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center text-slate-400">
                    <p>&copy; 2026 GarageMap. Connecting you with quality automotive services.</p>
                </div>
            </footer>
        </div>
    );
}
