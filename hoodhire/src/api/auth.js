// src/api/auth.js

// Using Vite's environment variables or defaulting to a local backend development port (backend runs on 8080)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * Helper function to handle fetch responses and throw structured errors
 */
const handleResponse = async (response, skipAuthRedirect = false) => {
    let data;
    try {
        data = await response.json();
    } catch (e) {
        data = {};
    }

    if (!response.ok) {
        if (response.status === 401 && !skipAuthRedirect) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            window.location.href = '/';
            throw new Error('Session expired');
        }
        const error = new Error(data.message || data.error || 'An error occurred during the request.');
        error.status = response.status;
        error.data = data;
        throw error;
    }
    return data;
};

export const authAPI = {
    /**
     * Sends an OTP to start the registration for a new user
     * @param {Object} userData - { username, email, password, role }
     * @returns {Promise<Object>}
     */
    register: async (userData) => {
        const { role, ...payload } = userData;
        const response = await fetch(`${API_BASE_URL}/auth/${role}/send-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(payload),
        });
        return handleResponse(response, true); // skip redirect for auth endpoints
    },

    /**
     * Log in an existing user
     * @param {Object} credentials - { email, password }
     * @returns {Promise<Object>}
     */
    login: async (credentials) => {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(credentials),
        });
        return handleResponse(response, true); // skip redirect — wrong creds !== session expired
    },

    /**
     * Verify an OTP and complete signup
     * @param {Object} verificationData - { role, token, Otp }
     * @returns {Promise<Object>}
     */
    verifyOTP: async (verificationData) => {
        const { role, token, Otp } = verificationData;
        const response = await fetch(`${API_BASE_URL}/auth/${role}/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ token, Otp }),
        });
        return handleResponse(response);
    },

    /**
     * Resend an OTP to the user's email
     * @param {Object} data - { email, role }
     * @returns {Promise<Object>}
     */
    resendOTP: async (data) => {
        const { role, ...payload } = data;
        const response = await fetch(`${API_BASE_URL}/auth/${role}/resend-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(payload),
        });
        return handleResponse(response);
    }
};
