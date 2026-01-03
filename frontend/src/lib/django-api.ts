/**
 * Django API Integration for GarageMap
 * 
 * This module provides functions to interact with the Django backend
 * while using Firebase for authentication.
 */

import { auth } from './firebase';

const DJANGO_API_URL = process.env.NEXT_PUBLIC_DJANGO_API_URL || 'http://localhost:8000/api';

/**
 * Get Firebase ID token for authenticated requests
 */
async function getAuthToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (user) {
        try {
            return await user.getIdToken();
        } catch (error) {
            console.error('Error getting auth token:', error);
            return null;
        }
    }
    return null;
}

/**
 * Make an authenticated API request to Django
 */
async function apiRequest(
    endpoint: string,
    options: RequestInit = {}
): Promise<any> {
    const token = await getAuthToken();

    const headers = new Headers(options.headers);

    if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${DJANGO_API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || error.detail || 'API request failed');
    }

    return response.json();
}

// Types
export interface Workshop {
    id: number;
    mechanic_name: string;
    workshop_name: string;
    description?: string;
    phone: string;
    latitude: number;
    longitude: number;
    services: string[];
    photo?: string;
    is_open: boolean;
    rating?: number;
    reviews_count?: number;
    city?: string;
}

// ============================================
// Workshop API Functions
// ============================================

export async function getWorkshops(): Promise<Workshop[]> {
    return apiRequest('/workshops/');
}

export async function getMyWorkshop(): Promise<Workshop> {
    return apiRequest('/workshops/my_workshop/');
}

export async function createWorkshop(data: {
    mechanic_name: string;
    workshop_name: string;
    description?: string;
    phone: string;
    latitude: number;
    longitude: number;
    services: string[];
    photo?: string;
    is_open?: boolean;
    city?: string;
}): Promise<Workshop> {
    return apiRequest('/workshops/', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function updateWorkshop(id: number, data: Partial<any>) {
    return apiRequest(`/workshops/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

export async function getNearbyWorkshops(params?: {
    service_type?: string;
    city?: string;
}) {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/workshops/nearby/?${query}`);
}

// ============================================
// Service Request API Functions
// ============================================

export async function getServiceRequests() {
    return apiRequest('/requests/');
}

export async function createServiceRequest(data: {
    workshop: number;
    service_type: string;
    description: string;
    urgency: 'low' | 'medium' | 'high' | 'emergency';
    user_latitude: number;
    user_longitude: number;
    user_address?: string;
}) {
    return apiRequest('/requests/', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function acceptServiceRequest(requestId: number) {
    return apiRequest(`/requests/${requestId}/accept/`, {
        method: 'POST',
    });
}

export async function completeServiceRequest(requestId: number) {
    return apiRequest(`/requests/${requestId}/complete/`, {
        method: 'POST',
    });
}

// ============================================
// Review API Functions
// ============================================

export async function getReviews(workshopId?: number) {
    const query = workshopId ? `?workshop=${workshopId}` : '';
    return apiRequest(`/reviews/${query}`);
}

export async function createReview(data: {
    workshop: number;
    rating: number;
    comment?: string;
    service_request?: number;
}) {
    return apiRequest('/reviews/', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

// ============================================
// Mechanic API Functions
// ============================================

export async function getMechanics(params?: {
    user_lat?: number;
    user_lon?: number;
}) {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/mechanics/?${query}`);
}

// ============================================
// User Profile API Functions
// ============================================

export async function getMyProfile() {
    return apiRequest('/me/profile/');
}

export async function updateMyProfile(data: Partial<any>) {
    return apiRequest('/me/profile/', {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

export default {
    getWorkshops,
    getMyWorkshop,
    createWorkshop,
    updateWorkshop,
    getNearbyWorkshops,
    getServiceRequests,
    createServiceRequest,
    acceptServiceRequest,
    completeServiceRequest,
    getReviews,
    createReview,
    getMechanics,
    getMyProfile,
    updateMyProfile,
};
