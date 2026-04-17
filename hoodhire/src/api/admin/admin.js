// src/api/admin/admin.js

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

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

    createUser: async (userData) => {
        const response = await fetch(`${API_BASE_URL}/admin/users`, {
            method: 'POST',
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify(userData)
        });
        return handleResponse(response);
    },

    updateUser: async (id, userData) => {
        const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify(userData)
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

    rejectBusiness: async (userID, reason) => {
        const response = await fetch(`${API_BASE_URL}/admin/businesses/${userID}/reject`, {
            method: 'PATCH',
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify({ reason })
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
    },

    // Jobs Management
    getJobs: async ({ status, search, page = 1, limit = 20 } = {}) => {
        let url = `${API_BASE_URL}/admin/jobs?page=${page}&limit=${limit}`;

        if (status && status !== 'all') url += `&status=${status}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;

        const response = await fetch(url, {
            headers: getHeaders(),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    deleteJob: async (id) => {
        const response = await fetch(`${API_BASE_URL}/admin/jobs/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    updateJobStatus: async (id, status) => {
        const response = await fetch(`${API_BASE_URL}/admin/jobs/${id}/status`, {
            method: 'PATCH',
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify({ status })
        });
        return handleResponse(response);
    },
    
    getJobByID: async (id) => {
        const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
            headers: getHeaders(),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    updateJob: async (id, jobData) => {
        const response = await fetch(`${API_BASE_URL}/admin/jobs/${id}`, {
            method: 'PATCH',
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify(jobData)
        });
        return handleResponse(response);
    },

    // Profile Management
    getAdminMe: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/me`, {
            headers: getHeaders(),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    changePassword: async (passwords) => {
        const response = await fetch(`${API_BASE_URL}/admin/me/password`, {
            method: 'PATCH',
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify(passwords)
        });
        return handleResponse(response);
    },

    // Category Management
    getCategories: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/categories`, {
            headers: getHeaders(),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    getCategoryStats: async ({ sort, page = 1, limit = 20 } = {}) => {
        let url = `${API_BASE_URL}/admin/categories/stats?page=${page}&limit=${limit}`;
        if (sort) url += `&sort=${sort}`;

        const response = await fetch(url, {
            headers: getHeaders(),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    createCategory: async (categoryData) => {
        const response = await fetch(`${API_BASE_URL}/admin/categories`, {
            method: 'POST',
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify(categoryData)
        });
        return handleResponse(response);
    },

    updateCategory: async (id, categoryData) => {
        const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify(categoryData)
        });
        return handleResponse(response);
    },

    deleteCategory: async (id) => {
        const response = await fetch(`${API_BASE_URL}/admin/categories/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    // Subscription Management
    getPlans: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/plan`, {
            headers: getHeaders(),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    createPlan: async (planData) => {
        // As per request: use api post {{baseurl}}/admin/subscriptions/:id to add a plan
        // However, usually for "creating" we don't have an ID. 
        // I will assume POST /admin/subscriptions for adding unless specified otherwise.
        const response = await fetch(`${API_BASE_URL}/admin/plan`, {
            method: 'POST',
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify(planData)
        });
        return handleResponse(response);
    },

    updatePlan: async (id, planData) => {
        const response = await fetch(`${API_BASE_URL}/admin/plan/${id}`, {
            method: 'PATCH',
            headers: getHeaders(),
            credentials: 'include',
            body: JSON.stringify(planData)
        });
        return handleResponse(response);
    },

    togglePlan: async (id) => {
        const response = await fetch(`${API_BASE_URL}/admin/plan/${id}/toggle`, {
            method: 'PATCH',
            headers: getHeaders(),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    deletePlan: async (id) => {
        const response = await fetch(`${API_BASE_URL}/admin/plan/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    // Subscription & Revenue Management
    getSubscriptions: async ({ status, planId, search, page = 1, limit = 20 } = {}) => {
        let url = `${API_BASE_URL}/admin/subscription?page=${page}&limit=${limit}`;
        if (status && status !== 'all') url += `&status=${status}`;
        if (planId && planId !== 'all') url += `&plan_id=${planId}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;

        const response = await fetch(url, {
            headers: getHeaders(),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    getSubscriptionsExpiring: async (days) => {
        const response = await fetch(`${API_BASE_URL}/admin/subscription/expiring/${days}`, {
            headers: getHeaders(),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    getTotalRevenue: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/subscription/revenue/total`, {
            headers: getHeaders(),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    getMonthlyRevenue: async () => {
        const response = await fetch(`${API_BASE_URL}/admin/subscription/revenue/monthly`, {
            headers: getHeaders(),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    getRevenueByPlan: async (planName) => {
        const response = await fetch(`${API_BASE_URL}/admin/subscription/revenue/${encodeURIComponent(planName)}`, {
            headers: getHeaders(),
            credentials: 'include'
        });
        return handleResponse(response);
    }
};
