// src/api/admin/config.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const getHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

const handleResponse = async (response) => {
    let data;
    try {
        data = await response.json();
    } catch (e) {
        data = {};
    }

    if (!response.ok) {
        if (response.status === 401) {
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

export const configAPI = {
    getConfigs: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/config`, {
            headers: getHeaders(),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    toggleConfig: async (key, isActive) => {
        const response = await fetch(`${API_BASE_URL}/admin/config/toggle`, {
            method: 'PATCH', // Assuming PATCH for toggling
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify({ key, is_active: isActive })
        });
        return handleResponse(response);
    }
};
