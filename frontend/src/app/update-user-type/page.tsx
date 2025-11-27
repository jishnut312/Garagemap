'use client';

import { useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';

export default function UpdateUserTypePage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [selectedType, setSelectedType] = useState<'customer' | 'mechanic'>('customer');

    const handleUpdateUserType = async () => {
        if (!user) {
            setError('You must be logged in to update user type');
            return;
        }

        setLoading(true);
        setMessage('');
        setError('');

        try {
            // Update the current user's userType
            const userRef = doc(db, 'users', user.uid);

            // First check if document exists
            const userDoc = await getDoc(userRef);

            if (!userDoc.exists()) {
                setError('User document does not exist in Firestore');
                return;
            }

            // Update the userType field
            await updateDoc(userRef, {
                userType: selectedType,
            });

            setMessage(`✅ Successfully updated user type to "${selectedType}"! Please refresh the page.`);

            // Reload after 2 seconds
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } catch (err: any) {
            setError(`❌ Error: ${err.message}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateSpecificUser = async (userId: string, userType: 'customer' | 'mechanic') => {
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, {
                userType: userType,
            });

            setMessage(`✅ Successfully updated user ${userId} to type "${userType}"!`);
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
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-bold text-2xl">👤</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">
                        Update User Type
                    </h1>
                    <p className="text-slate-600">
                        Add the missing userType field to existing users
                    </p>
                </div>

                {user && (
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-slate-900 mb-2">Current User:</h3>
                        <div className="text-sm text-slate-600 space-y-1">
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Display Name:</strong> {user.displayName}</p>
                            <p><strong>UID:</strong> {user.uid}</p>
                            <p><strong>Current Type:</strong> {user.userType || '❌ Not Set'}</p>
                        </div>
                    </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Choose User Type:</h3>
                    <div className="space-y-3">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="radio"
                                name="userType"
                                value="customer"
                                checked={selectedType === 'customer'}
                                onChange={(e) => setSelectedType(e.target.value as 'customer')}
                                className="w-4 h-4 text-blue-500"
                            />
                            <div>
                                <div className="font-semibold text-slate-900">Customer</div>
                                <div className="text-sm text-slate-600">Can browse mechanics and send service requests</div>
                            </div>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="radio"
                                name="userType"
                                value="mechanic"
                                checked={selectedType === 'mechanic'}
                                onChange={(e) => setSelectedType(e.target.value as 'mechanic')}
                                className="w-4 h-4 text-blue-500"
                            />
                            <div>
                                <div className="font-semibold text-slate-900">Mechanic</div>
                                <div className="text-sm text-slate-600">Can receive and manage service requests</div>
                            </div>
                        </label>
                    </div>
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
                    onClick={handleUpdateUserType}
                    disabled={loading || !user}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Updating...' : `Update My Account to ${selectedType}`}
                </button>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Important Notes:</h3>
                    <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                        <li>If you choose "mechanic", you'll also need to create a mechanic profile</li>
                        <li>The page will auto-refresh after updating</li>
                        <li>You can change this later if needed</li>
                    </ul>
                </div>

                <div className="mt-6 text-center space-y-2">
                    <a
                        href="/dashboard"
                        className="block text-blue-500 hover:text-blue-700 underline text-sm"
                    >
                        Go to Customer Dashboard →
                    </a>
                    <a
                        href="/mechanic-dashboard"
                        className="block text-blue-500 hover:text-blue-700 underline text-sm"
                    >
                        Go to Mechanic Dashboard →
                    </a>
                </div>
            </div>
        </div>
    );
}
