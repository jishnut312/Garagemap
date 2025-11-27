'use client';

import { useState } from 'react';
import { seedFirestoreData } from '@/lib/seedFirestore';

export default function SetupPage() {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSeed = async () => {
        setLoading(true);
        setMessage('');
        setError('');

        try {
            await seedFirestoreData();
            setMessage('✅ Database seeded successfully! Check the console for details.');
        } catch (err: any) {
            setError(`❌ Error: ${err.message}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-2xl">🔧</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        Firestore Database Setup
                    </h1>
                    <p className="text-slate-600">
                        Click the button below to populate your Firestore database with test data
                    </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-blue-900 mb-2">⚠️ Before Running:</h3>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                        <li>Make sure you have Firebase Authentication enabled</li>
                        <li>Create test users in Firebase Auth (customer@test.com, mechanic@test.com)</li>
                        <li>Update the UIDs in <code className="bg-blue-100 px-1 rounded">seedFirestore.ts</code></li>
                        <li>This will create collections: users, mechanics, requests</li>
                    </ol>
                </div>

                {message && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <p className="text-green-800">{message}</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                <button
                    onClick={handleSeed}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-red-500 to-orange-600 text-white py-4 rounded-lg font-bold text-lg hover:from-red-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Seeding Database...' : '🌱 Seed Firestore Database'}
                </button>

                <div className="mt-8 p-4 bg-slate-50 rounded-lg">
                    <h3 className="font-semibold text-slate-900 mb-2">What this will create:</h3>
                    <ul className="text-sm text-slate-600 space-y-1">
                        <li>✅ 2 test users (1 customer, 1 mechanic)</li>
                        <li>✅ 2 mechanic profiles with workshop details</li>
                        <li>✅ 3 service requests (pending, accepted, completed)</li>
                    </ul>
                </div>

                <div className="mt-6 text-center">
                    <a
                        href="https://console.firebase.google.com/project/garagemap-11a27/firestore"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 underline text-sm"
                    >
                        Open Firebase Console →
                    </a>
                </div>
            </div>
        </div>
    );
}
