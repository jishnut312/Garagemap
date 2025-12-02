'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import {
    Wrench,
    DollarSign,
    TrendingUp,
    Shield,
    Clock,
    Users,
    Star,
    CheckCircle,
    BarChart3,
    Smartphone,
    MessageSquare,
    Calendar,
    Award,
    MapPin,
    ChevronDown,
    ChevronUp,
    Calculator
} from 'lucide-react';

export default function MechanicsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [jobsPerWeek, setJobsPerWeek] = useState(10);
    const [pricePerJob, setPricePerJob] = useState(150);

    // Redirect logged-in mechanics to their dashboard
    useEffect(() => {
        if (!loading && user && user.userType === 'mechanic') {
            router.push('/mechanic-dashboard');
        }
    }, [user, loading, router]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-red-500 selection:text-white">
            {/* Navigation */}
            <nav className="fixed w-full z-50 top-0 start-0 border-b border-white/10 bg-slate-900/80 backdrop-blur-md supports-[backdrop-filter]:bg-slate-900/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <Link href="/" className="flex items-center space-x-3 group">
                            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-red-500/25 transition-all duration-300">
                                <span className="text-white font-bold text-xl">G</span>
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tight group-hover:text-red-400 transition-colors">
                                GarageMap
                            </span>
                        </Link>

                        <div className="flex items-center space-x-4">
                            <Link href="/login" className="text-slate-300 hover:text-white font-medium transition-colors text-sm">
                                Login
                            </Link>
                            <Link href="/signup" className="bg-red-500 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-red-600 transition-all duration-300 shadow-lg shadow-red-500/20">
                                Join as Mechanic
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                {/* Background Effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
                    <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-red-500/20 rounded-full blur-[120px] animate-pulse"></div>
                    <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px]"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-slate-300 text-sm mb-8 backdrop-blur-sm">
                                <Wrench className="w-4 h-4 text-red-400" />
                                For Professional Mechanics
                            </div>

                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight mb-8 leading-tight">
                                Grow Your <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">
                                    Mechanic Business
                                </span>
                            </h1>

                            <p className="text-xl md:text-2xl text-slate-400 mb-12 font-light leading-relaxed">
                                Connect with thousands of customers, manage service requests, and boost your revenue with GarageMap's all-in-one platform.
                            </p>

                            <div className="flex flex-col sm:flex-row items-start gap-4">
                                <Link href="/signup" className="w-full sm:w-auto px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl shadow-red-500/20 flex items-center justify-center gap-2">
                                    Get Started Free
                                    <CheckCircle className="w-5 h-5" />
                                </Link>
                                <Link href="#features" className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-lg transition-all duration-300 border border-slate-700 text-center">
                                    Learn More
                                </Link>
                            </div>

                            {/* Quick Stats */}
                            <div className="mt-12 grid grid-cols-3 gap-6">
                                <div>
                                    <div className="text-3xl font-bold text-white mb-1">2.5k+</div>
                                    <div className="text-sm text-slate-500 uppercase tracking-wider">Active Mechanics</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-white mb-1">50k+</div>
                                    <div className="text-sm text-slate-500 uppercase tracking-wider">Jobs Completed</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-white mb-1">4.8/5</div>
                                    <div className="text-sm text-slate-500 uppercase tracking-wider">Avg Rating</div>
                                </div>
                            </div>
                        </div>

                        {/* Image/Illustration Placeholder */}
                        <div className="relative hidden lg:block">
                            <div className="relative bg-gradient-to-br from-slate-800 to-slate-700 rounded-3xl p-8 border border-slate-600 shadow-2xl">
                                <div className="space-y-4">
                                    <div className="bg-slate-900 rounded-xl p-6 border border-slate-600">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center">
                                                <Wrench className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <div className="h-4 bg-slate-700 rounded w-32 mb-2"></div>
                                                <div className="h-3 bg-slate-800 rounded w-24"></div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-800 rounded-lg p-4">
                                                <div className="text-2xl font-bold text-white mb-1">24</div>
                                                <div className="text-xs text-slate-400">Pending</div>
                                            </div>
                                            <div className="bg-slate-800 rounded-lg p-4">
                                                <div className="text-2xl font-bold text-white mb-1">156</div>
                                                <div className="text-xs text-slate-400">Completed</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-green-400 text-sm">
                                        <TrendingUp className="w-4 h-4" />
                                        <span>Revenue up 35% this month</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div id="features" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Everything You Need to Succeed</h2>
                        <p className="text-xl text-slate-600">
                            Powerful tools designed specifically for mechanics to streamline operations and grow their business.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Users className="w-8 h-8 text-red-500" />,
                                title: "Direct Customer Access",
                                description: "Connect with thousands of customers actively searching for mechanics in your area."
                            },
                            {
                                icon: <Calendar className="w-8 h-8 text-red-500" />,
                                title: "Smart Scheduling",
                                description: "Manage appointments efficiently with our intuitive calendar and booking system."
                            },
                            {
                                icon: <MessageSquare className="w-8 h-8 text-red-500" />,
                                title: "Instant Communication",
                                description: "Chat directly with customers, share updates, and build lasting relationships."
                            },
                            {
                                icon: <DollarSign className="w-8 h-8 text-red-500" />,
                                title: "Transparent Pricing",
                                description: "Set your own rates and get paid fairly for quality work. No hidden fees."
                            },
                            {
                                icon: <BarChart3 className="w-8 h-8 text-red-500" />,
                                title: "Business Analytics",
                                description: "Track earnings, monitor performance, and make data-driven decisions."
                            },
                            {
                                icon: <Star className="w-8 h-8 text-red-500" />,
                                title: "Build Your Reputation",
                                description: "Collect reviews and showcase your expertise to attract more customers."
                            },
                            {
                                icon: <Smartphone className="w-8 h-8 text-red-500" />,
                                title: "Mobile Dashboard",
                                description: "Manage your business on-the-go with our mobile-friendly platform."
                            },
                            {
                                icon: <Shield className="w-8 h-8 text-red-500" />,
                                title: "Verified Platform",
                                description: "Work with confidence on a secure, trusted platform protecting both parties."
                            },
                            {
                                icon: <MapPin className="w-8 h-8 text-red-500" />,
                                title: "Local Visibility",
                                description: "Appear in local searches and get discovered by nearby customers instantly."
                            }
                        ].map((feature, i) => (
                            <div key={i} className="bg-slate-50 rounded-2xl p-8 hover:shadow-lg hover:bg-white transition-all duration-300 border border-slate-100">
                                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* How It Works */}
            <div className="py-24 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">How It Works</h2>
                        <p className="text-xl text-slate-600">
                            Get started in minutes and start receiving service requests today.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            {
                                step: "1",
                                title: "Sign Up",
                                description: "Create your free account and complete your mechanic profile in minutes."
                            },
                            {
                                step: "2",
                                title: "Set Your Services",
                                description: "List your specialties, availability, and service area."
                            },
                            {
                                step: "3",
                                title: "Receive Requests",
                                description: "Get notified when customers need your services nearby."
                            },
                            {
                                step: "4",
                                title: "Get Paid",
                                description: "Complete jobs, earn money, and build your reputation."
                            }
                        ].map((step, i) => (
                            <div key={i} className="relative">
                                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-300">
                                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 text-white text-2xl font-bold shadow-lg">
                                        {step.step}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                                    <p className="text-slate-600 leading-relaxed">{step.description}</p>
                                </div>
                                {i < 3 && (
                                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                                        <div className="w-8 h-0.5 bg-slate-300"></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Testimonials */}
            <div className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">What Mechanics Say</h2>
                        <p className="text-xl text-slate-600">
                            Join thousands of mechanics who have transformed their business with GarageMap.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                quote: "GarageMap has doubled my customer base in just 3 months. The platform is incredibly easy to use and the support team is fantastic!",
                                name: "Mike Johnson",
                                role: "Auto Mechanic",
                                rating: 5
                            },
                            {
                                quote: "I love how I can manage everything from my phone. The instant notifications mean I never miss a potential customer.",
                                name: "Sarah Chen",
                                role: "Mobile Mechanic",
                                rating: 5
                            },
                            {
                                quote: "The best decision for my business. More customers, better organization, and transparent payments. Highly recommend!",
                                name: "David Rodriguez",
                                role: "Workshop Owner",
                                rating: 5
                            }
                        ].map((testimonial, i) => (
                            <div key={i} className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, j) => (
                                        <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <p className="text-slate-700 mb-6 leading-relaxed italic">"{testimonial.quote}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                                        {testimonial.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900">{testimonial.name}</div>
                                        <div className="text-sm text-slate-600">{testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Earnings Calculator */}
            <div className="py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <Calculator className="w-12 h-12 text-red-400 mx-auto mb-4" />
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Calculate Your Potential Earnings</h2>
                        <p className="text-xl text-slate-400">See how much you could earn on GarageMap</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/10">
                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            <div>
                                <label className="block text-white font-semibold mb-3">Jobs per week</label>
                                <input
                                    type="range"
                                    min="5"
                                    max="50"
                                    value={jobsPerWeek}
                                    onChange={(e) => setJobsPerWeek(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg cursor-pointer accent-red-500"
                                />
                                <div className="flex justify-between text-slate-400 text-sm mt-2">
                                    <span>5</span>
                                    <span className="text-white font-bold text-lg">{jobsPerWeek}</span>
                                    <span>50</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-white font-semibold mb-3">Average price per job ($)</label>
                                <input
                                    type="range"
                                    min="50"
                                    max="500"
                                    step="10"
                                    value={pricePerJob}
                                    onChange={(e) => setPricePerJob(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg cursor-pointer accent-red-500"
                                />
                                <div className="flex justify-between text-slate-400 text-sm mt-2">
                                    <span>$50</span>
                                    <span className="text-white font-bold text-lg">${pricePerJob}</span>
                                    <span>$500</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6 pt-8 border-t border-white/10">
                            <div className="text-center">
                                <div className="text-slate-400 text-sm mb-2">Weekly Earnings</div>
                                <div className="text-3xl font-bold text-white">${(jobsPerWeek * pricePerJob).toLocaleString()}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-slate-400 text-sm mb-2">Monthly Earnings</div>
                                <div className="text-3xl font-bold text-red-400">${(jobsPerWeek * pricePerJob * 4).toLocaleString()}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-slate-400 text-sm mb-2">Yearly Earnings</div>
                                <div className="text-3xl font-bold text-green-400">${(jobsPerWeek * pricePerJob * 52).toLocaleString()}</div>
                            </div>
                        </div>

                        <p className="text-center text-slate-400 text-sm mt-8">
                            * Estimates based on average mechanic rates and GarageMap usage
                        </p>
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="py-24 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
                        <p className="text-xl text-slate-600">Everything you need to know about joining GarageMap</p>
                    </div>

                    <div className="space-y-4">
                        {[
                            {
                                q: "How much does it cost to join GarageMap?",
                                a: "Joining GarageMap is completely free! There are no signup fees or monthly subscriptions. We only take a small commission on completed jobs to keep the platform running."
                            },
                            {
                                q: "How do I get paid for my services?",
                                a: "You set your own rates and receive payment directly from customers. We offer secure payment processing and you can withdraw your earnings instantly to your bank account."
                            },
                            {
                                q: "What area does GarageMap cover?",
                                a: "GarageMap operates in over 120 cities nationwide and is rapidly expanding. You can set your service radius and receive requests from customers in your area."
                            },
                            {
                                q: "Do I need special certifications?",
                                a: "While certifications aren't required, having ASE certifications or other credentials helps build trust with customers and can lead to more business."
                            },
                            {
                                q: "Can I use GarageMap alongside my existing business?",
                                a: "Absolutely! Many mechanics use GarageMap to fill gaps in their schedule and reach new customers while maintaining their existing business."
                            },
                            {
                                q: "How quickly can I start receiving requests?",
                                a: "Once your profile is complete and verified (usually within 24 hours), you'll start receiving service requests from nearby customers immediately."
                            }
                        ].map((faq, i) => (
                            <div key={i} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-100 transition-colors"
                                >
                                    <span className="font-semibold text-slate-900 text-lg">{faq.q}</span>
                                    {openFaq === i ? (
                                        <ChevronUp className="w-5 h-5 text-red-500 flex-shrink-0" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                    )}
                                </button>
                                {openFaq === i && (
                                    <div className="px-6 pb-5 text-slate-600 leading-relaxed">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-24 bg-slate-50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 rounded-full blur-[80px]"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/20 rounded-full blur-[80px]"></div>

                        <div className="relative z-10">
                            <Award className="w-16 h-16 text-red-400 mx-auto mb-6" />
                            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                                Ready to Take Your Business to the Next Level?
                            </h2>
                            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                                Join GarageMap today and start connecting with customers who need your expertise.
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                <Link href="/signup" className="px-8 py-4 bg-red-500 text-white rounded-xl font-bold text-lg hover:bg-red-600 transition-colors shadow-lg">
                                    Sign Up for Free
                                </Link>
                                <Link href="/contact" className="px-8 py-4 bg-transparent border border-slate-700 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-colors">
                                    Contact Support
                                </Link>
                            </div>
                            <p className="text-slate-500 mt-6 text-sm">No credit card required • Free forever</p>
                        </div>
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
                            <Link href="/" className="text-slate-400 hover:text-slate-900 text-sm">For Customers</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
