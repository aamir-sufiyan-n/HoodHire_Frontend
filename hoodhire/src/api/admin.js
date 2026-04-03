// src/api/admin.js

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

export const adminAPI = {
    // Users Management
    // getAllUsers: async () => {
    //     const response = await fetch(`${API_BASE_URL}/admin/users`, {
    //         headers: getHeaders(),
    //         credentials: 'include'
    //     });
    //     return handleResponse(response);
    // },

    getUsers: async ({ role, blocked, search, page = 1, limit = 20 } = {}) => {
        let url = `${API_BASE_URL}/admin/users?page=${page}&limit=${limit}`;

        if (role && role !== 'all') url += `&role=${role}`;
        if (blocked !== undefined && blocked !== null) url += `&blocked=${blocked}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;

        const response = await fetch(url, {
            headers: getHeaders(),
            credentials: 'include'
        });

        return handleResponse(response);
    },
    getUserByID: async (id) => {
        const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
            headers: getHeaders(),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    deleteUser: async (id) => {
        const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    blockUser: async (id) => {
        const response = await fetch(`${API_BASE_URL}/admin/users/${id}/block`, {
            method: 'PATCH',
            headers: getHeaders(),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    unblockUser: async (id) => {
        const response = await fetch(`${API_BASE_URL}/admin/users/${id}/unblock`, {
            method: 'PATCH',
            headers: getHeaders(),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    // Business Management
    getBusinesses: async ({ status, verified, search, page = 1, limit = 20 } = {}) => {
        let url = `${API_BASE_URL}/admin/businesses?page=${page}&limit=${limit}`;

        if (status && status !== 'all') url += `&status=${status}`;
        if (verified !== undefined && verified !== null && verified !== 'all') url += `&verified=${verified}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;

        const response = await fetch(url, {
            headers: getHeaders(),
            credentials: 'include'
        });

        return handleResponse(response);
    },

    // getAllBusinesses: async () => {
    //     const response = await fetch(`${API_BASE_URL}/admin/businesses`, {
    //         headers: getHeaders(),
    //         credentials: 'include'
    //     });
    //     return handleResponse(response);
    // },

    blockBusiness: async (id) => {
        const response = await fetch(`${API_BASE_URL}/admin/businesses/${id}/block`, {
            method: 'PATCH',
            headers: getHeaders(),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    unblockBusiness: async (id) => {
        const response = await fetch(`${API_BASE_URL}/admin/businesses/${id}/unblock`, {
            method: 'PATCH',
            headers: getHeaders(),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    deleteBusiness: async (id) => {
        const response = await fetch(`${API_BASE_URL}/admin/businesses/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    getBusinessByID: async (id) => {
        const response = await fetch(`${API_BASE_URL}/businesses/${id}`, {
            headers: getHeaders(),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    approveBusiness: async (userID) => {
        const response = await fetch(`${API_BASE_URL}/admin/businesses/${userID}/approve`, {
            method: 'PATCH',
            headers: getHeaders(),
            credentials: 'include',
        });
        return handleResponse(response);
    },

    rejectBusiness: async (userID) => {
        const response = await fetch(`${API_BASE_URL}/admin/businesses/${userID}/reject`, {
            method: 'PATCH',
            headers: getHeaders(),
            credentials: 'include',
        });
        return handleResponse(response);
    },

    // Tickets Management
    getTickets: async ({ status, type, search, page = 1, limit = 20 } = {}) => {
        let url = `${API_BASE_URL}/admin/tickets?page=${page}&limit=${limit}`;

        if (status && status !== 'all') url += `&status=${status}`;
        if (type && type !== 'all') url += `&type=${type}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;

        const response = await fetch(url, {
            headers: getHeaders(),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    getTicketsByBusiness: async (businessID) => {
        const response = await fetch(`${API_BASE_URL}/admin/tickets/business/${businessID}`, {
            headers: getHeaders(),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    resolveTicket: async (id, reply) => {
        const response = await fetch(`${API_BASE_URL}/admin/tickets/${id}/resolve`, {
            method: 'PATCH',
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify({ reply })
        });
        return handleResponse(response);
    },

    reviewTicket: async (id, reply) => {
        const response = await fetch(`${API_BASE_URL}/admin/tickets/${id}/review`, {
            method: 'PATCH',
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify({ reply })
        });
        return handleResponse(response);
    },

    dismissTicket: async (id, reply) => {
        const response = await fetch(`${API_BASE_URL}/admin/tickets/${id}/dismiss`, {
            method: 'PATCH',
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify({ reply })
        });
        return handleResponse(response);
    }
};
