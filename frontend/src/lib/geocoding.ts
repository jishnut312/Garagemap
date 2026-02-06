/**
 * Geocoding utilities using OpenStreetMap Nominatim API (FREE, no API key needed)
 */

export interface GeocodeResult {
    formattedAddress: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
}

/**
 * Convert latitude and longitude to a human-readable address
 * Uses OpenStreetMap Nominatim API (FREE)
 */
export async function reverseGeocode(
    latitude: number,
    longitude: number
): Promise<GeocodeResult | null> {
    try {
        console.log('🔍 Starting reverse geocoding with OpenStreetMap...');
        console.log('📍 Coordinates:', latitude, longitude);

        // OpenStreetMap Nominatim API (FREE, no API key needed)
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

        console.log('🌐 Fetching from OpenStreetMap...');

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'GarageMap/1.0' // Required by Nominatim
            }
        });

        console.log('📡 Response status:', response.status, response.statusText);

        if (!response.ok) {
            console.error('❌ Geocoding API request failed:', response.statusText);
            return null;
        }

        const data = await response.json();
        console.log('📦 API Response:', data);

        if (!data || data.error) {
            console.error('❌ Geocoding failed:', data.error || 'Unknown error');
            return null;
        }

        const address = data.address || {};

        // Extract location components
        const city = address.city || address.town || address.village || address.municipality || '';
        const state = address.state || address.region || '';
        const country = address.country || '';
        const postalCode = address.postcode || '';

        // Build formatted address
        const formattedAddress = data.display_name || formatCoordinates(latitude, longitude);

        console.log('✅ Formatted address:', formattedAddress);
        console.log('🏙️ Extracted - City:', city, 'State:', state, 'Country:', country);

        return {
            formattedAddress,
            city,
            state,
            country,
            postalCode,
        };
    } catch (error) {
        console.error('❌ Error in reverse geocoding:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
        }
        return null;
    }
}

/**
 * Get a short, user-friendly location string
 * Example: "Bangalore, Karnataka" or "New York, NY"
 */
export function getShortLocation(geocodeResult: GeocodeResult): string {
    const parts: string[] = [];

    if (geocodeResult.city) {
        parts.push(geocodeResult.city);
    }

    if (geocodeResult.state) {
        parts.push(geocodeResult.state);
    }

    if (parts.length === 0 && geocodeResult.country) {
        parts.push(geocodeResult.country);
    }

    return parts.join(', ') || geocodeResult.formattedAddress;
}

/**
 * Format coordinates as fallback when geocoding fails
 */
export function formatCoordinates(latitude: number, longitude: number): string {
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}
