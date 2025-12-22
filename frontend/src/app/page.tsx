'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import {
  MapPin,
  Wrench,
  Shield,
  Clock,
  Search,
  ArrowRight,
  Star,
  Users,
  Car,
  Phone,
  Mail
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  // Refs for animated elements
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const featuresRef = useRef(null);
  const valuePropsRef = useRef(null);
  const ctaRef = useRef(null);

  // Redirect mechanics to their home page, keep customers on home page
  useEffect(() => {
    if (!loading && user && user.userType === 'mechanic') {
      router.push('/mechanic-home');
    }
  }, [user, loading, router]);

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero Section Animation
      const heroTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

      heroTimeline
        .from('.hero-badge', {
          opacity: 0,
          y: 20,
          duration: 0.6,
        })
        .from('.hero-title', {
          opacity: 0,
          y: 30,
          duration: 0.8,
        }, '-=0.3')
        .from('.hero-description', {
          opacity: 0,
          y: 20,
          duration: 0.6,
        }, '-=0.4')
        .from('.hero-buttons', {
          opacity: 0,
          y: 20,
          duration: 0.6,
        }, '-=0.3')
        .from('.hero-stat', {
          opacity: 0,
          y: 20,
          stagger: 0.1,
          duration: 0.5,
        }, '-=0.2');

      // Feature Cards Animation
      gsap.from('.feature-card', {
        scrollTrigger: {
          trigger: featuresRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0,
        y: 60,
        stagger: 0.2,
        duration: 0.8,
        ease: 'power3.out',
      });

      // Value Props Animation
      gsap.from('.value-prop', {
        scrollTrigger: {
          trigger: valuePropsRef.current,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0,
        y: 40,
        stagger: 0.15,
        duration: 0.7,
        ease: 'power2.out',
      });

      // CTA Section Animation
      gsap.from('.cta-content', {
        scrollTrigger: {
          trigger: ctaRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0,
        scale: 0.95,
        duration: 0.8,
        ease: 'back.out(1.2)',
      });
    });

    return () => ctx.revert(); // Cleanup
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-red-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-slate-900">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-1000"></div>
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] mix-blend-screen"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-slate-300 text-sm mb-8 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            Over 500+ Garages Added This Month
          </div>

          <h1 className="hero-title text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight mb-8 leading-tight">
            Find the Right Garage. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500">
              Book in Minutes.
            </span>
          </h1>

          <p className="hero-description text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 font-light leading-relaxed">
            Connect with top-rated mechanics and secure garage spaces instantly.
            Experience automotive care reimagined for the modern era.
          </p>

          <div className="hero-buttons flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/map-workshop" className="w-full sm:w-auto px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl shadow-red-500/20 flex items-center justify-center gap-2 group">
              <Search className="w-5 h-5" />
              Find Workshops
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/find-mechanics" className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-lg transition-all duration-300 border border-slate-700 flex items-center justify-center gap-2">
              <Wrench className="w-5 h-5" />
              Find Mechanics
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-slate-800 pt-12">
            {[
              { label: 'Active Users', value: '10k+' },
              { label: 'Verified Garages', value: '2.5k+' },
              { label: 'Cities Covered', value: '120+' },
              { label: 'Avg. Rating', value: '4.9/5' },
            ].map((stat, index) => (
              <div key={index} className="hero-stat text-center">
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-slate-500 text-sm uppercase tracking-wider font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Features Grid */}
      <div className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={featuresRef} className="grid md:grid-cols-2 gap-8 -mt-32 relative z-20">
            {/* Feature 1 */}
            <div className="feature-card group bg-white rounded-[2rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-all duration-500">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <MapPin className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-4">Locate Nearby</h3>
              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                Instantly find the nearest available workshops with our real-time mapping system. Filter by services, ratings, and price.
              </p>
              <Link href="/map-workshop" className="inline-flex items-center text-red-500 font-bold hover:gap-2 transition-all">
                Start Searching <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="feature-card group bg-slate-900 rounded-[2rem] p-10 shadow-2xl shadow-slate-900/20 hover:-translate-y-2 transition-all duration-500">
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">Expert Mechanics</h3>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                Connect directly with certified professionals. View profiles, read reviews, and book appointments seamlessly.
              </p>
              <Link href="/find-mechanics" className="inline-flex items-center text-white font-bold hover:gap-2 transition-all">
                Find Experts <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Value Props */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">Why Choose GarageMap?</h2>
            <p className="text-xl text-slate-600">
              We're building the most trusted automotive network, ensuring quality and reliability for every service.
            </p>
          </div>

          <div ref={valuePropsRef} className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: <Shield className="w-8 h-8 text-red-500" />,
                title: "Verified Listings",
                description: "Every garage and mechanic is vetted to ensure safety and quality standards."
              },
              {
                icon: <Clock className="w-8 h-8 text-red-500" />,
                title: "Real-time Booking",
                description: "Book slots instantly without the back-and-forth phone calls."
              },
              {
                icon: <Star className="w-8 h-8 text-red-500" />,
                title: "Transparent Reviews",
                description: "Make informed decisions with genuine user ratings and feedback."
              }
            ].map((feature, i) => (
              <div key={i} className="value-prop text-center space-y-4 p-6 rounded-2xl hover:bg-slate-50 transition-colors duration-300">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={ctaRef} className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 rounded-full blur-[80px]"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/20 rounded-full blur-[80px]"></div>

            <div className="cta-content relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                Ready to transform your <br /> automotive experience?
              </h2>
              <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
                Join thousands of satisfied car owners and mechanics on the fastest growing garage network.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/signup" className="px-8 py-4 bg-white text-slate-900 rounded-xl font-bold text-lg hover:bg-slate-100 transition-colors shadow-lg">
                  Get Started Now
                </Link>
                <Link href="/contact" className="px-8 py-4 bg-transparent border border-slate-700 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-colors">
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">G</span>
                </div>
                <span className="text-2xl font-bold text-slate-900">GarageMap</span>
              </Link>
              <p className="text-slate-500 text-lg leading-relaxed max-w-sm">
                Connecting vehicle owners with trusted garages and certified mechanics worldwide. Simple, fast, and reliable.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-6">Platform</h4>
              <ul className="space-y-4">
                <li><Link href="/garages" className="text-slate-500 hover:text-red-500 transition-colors">Find Garages</Link></li>
                <li><Link href="/mechanics" className="text-slate-500 hover:text-red-500 transition-colors">For Mechanics</Link></li>
                <li><Link href="/pricing" className="text-slate-500 hover:text-red-500 transition-colors">Pricing</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-6">Company</h4>
              <ul className="space-y-4">
                <li><Link href="/about" className="text-slate-500 hover:text-red-500 transition-colors">About Us</Link></li>
                <li><Link href="/careers" className="text-slate-500 hover:text-red-500 transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="text-slate-500 hover:text-red-500 transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm">© 2024 GarageMap. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-slate-400 hover:text-slate-900 text-sm">Privacy</Link>
              <Link href="/terms" className="text-slate-400 hover:text-slate-900 text-sm">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
