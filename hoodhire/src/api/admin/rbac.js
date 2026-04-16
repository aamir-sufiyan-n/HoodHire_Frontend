// src/api/admin/rbac.js

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

export const rbacAPI = {
    // Permissions Management
    getPermissions: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/permissions`, {
            headers: getHeaders(),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    // Role Management
    getRoles: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/roles`, {
            headers: getHeaders(),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    createRole: async (data) => {
        const response = await fetch(`${API_BASE_URL}/admin/roles`, {
            method: 'POST',
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    updateRolePermissions: async (roleID, permissions) => {
        const response = await fetch(`${API_BASE_URL}/admin/roles/${roleID}/permissions`, {
            method: 'PUT',
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify({ permissions })
        });
        return handleResponse(response);
    },

    deleteRole: async (roleID) => {
        const response = await fetch(`${API_BASE_URL}/admin/roles/${roleID}`, {
            method: 'DELETE',
            headers: getHeaders(),
            credentials: 'include'
        });
        return handleResponse(response);
    }
};
