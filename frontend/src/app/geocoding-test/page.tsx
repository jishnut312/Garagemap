'use client';

import { useState } from 'react';
import { reverseGeocode, getShortLocation } from '@/lib/geocoding';

export default function GeocodingTest() {
    const [result, setResult] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const testGeocode = async () => {
        setLoading(true);
        setResult('Testing... Check browser console for detailed logs');

        // Test with the user's coordinates
        const lat = 11.8663;
        const lng = 75.3660;

        console.log('=== GEOCODING TEST START ===');
        const geocodeResult = await reverseGeocode(lat, lng);
        console.log('=== GEOCODING TEST END ===');

        if (geocodeResult) {
            const shortLocation = getShortLocation(geocodeResult);
            setResult(`✅ SUCCESS!\n\nShort: ${shortLocation}\n\nFull: ${geocodeResult.formattedAddress}\n\nCity: ${geocodeResult.city}\nState: ${geocodeResult.state}\nCountry: ${geocodeResult.country}`);
        } else {
            setResult('❌ FAILED - Check browser console for error details');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Geocoding API Test</h1>

                <div className="bg-gray-800 p-6 rounded-lg mb-6">
                    <h2 className="text-xl font-semibold mb-4">Test Coordinates</h2>
                    <p className="text-gray-300 mb-2">Latitude: 11.8663</p>
                    <p className="text-gray-300 mb-4">Longitude: 75.3660</p>
                    <p className="text-sm text-gray-400">(Kozhikode, Kerala, India)</p>
                </div>

                <button
                    onClick={testGeocode}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed mb-6"
                >
                    {loading ? 'Testing...' : 'Test Reverse Geocoding'}
                </button>

                {result && (
                    <div className="bg-gray-800 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-3">Result:</h3>
                        <pre className="text-sm text-gray-300 whitespace-pre-wrap">{result}</pre>
                    </div>
                )}

                <div className="mt-8 bg-yellow-900/30 border border-yellow-700 p-4 rounded-lg">
                    <h3 className="text-yellow-400 font-semibold mb-2">📋 Instructions:</h3>
                    <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                        <li>Open browser DevTools (F12)</li>
                        <li>Go to Console tab</li>
                        <li>Click "Test Reverse Geocoding" button</li>
                        <li>Check console for detailed logs with emojis (🔍, 📍, 🔑, etc.)</li>
                        <li>Look for any error messages</li>
                    </ol>
                </div>

                <div className="mt-6 bg-blue-900/30 border border-blue-700 p-4 rounded-lg">
                    <h3 className="text-blue-400 font-semibold mb-2">🔧 Common Issues:</h3>
                    <ul className="text-sm text-gray-300 space-y-2 list-disc list-inside">
                        <li><strong>REQUEST_DENIED:</strong> Geocoding API not enabled in Google Cloud Console</li>
                        <li><strong>API Key missing:</strong> Check .env.local file</li>
                        <li><strong>CORS error:</strong> API key might have HTTP referrer restrictions</li>
                        <li><strong>OVER_QUERY_LIMIT:</strong> Exceeded free tier quota</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
