// src/api/jobs.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

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

const getToken = () => localStorage.getItem('accessToken');

export const jobsAPI = {
    /**
     * Get all currently open jobs
     * @returns {Promise<Object>}
     */
    getAllJobs: async () => {
        const token = getToken();
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/jobs`, {
            method: 'GET',
            headers,
            credentials: 'include'
        });
        return handleResponse(response);
    },

    /**
     * Get a specific job by ID
     * @param {number|string} id - The job ID
     * @returns {Promise<Object>}
     */
    getJobById: async (id) => {
        const token = getToken();
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
            method: 'GET',
            headers,
            credentials: 'include'
        });
        return handleResponse(response);
    },

    /**
     * Get all businesses
     * @returns {Promise<Object>}
     */
    getAllBusinesses: async () => {
        const token = getToken();
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/businesses`, {
            method: 'GET',
            headers,
            credentials: 'include'
        });
        return handleResponse(response);
    },

    /**
     * Get a specific business by ID
     * @param {number|string} id - The business ID
     * @returns {Promise<Object>}
     */
    getBusinessById: async (id) => {
        const token = getToken();
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE_URL}/businesses/${id}`, {
            method: 'GET',
            headers,
            credentials: 'include'
        });
        return handleResponse(response);
    },

    // ==========================================
    // HIRER ENDPOINTS
    // ==========================================

    createJob: async (jobData) => {
        const token = getToken();
        if (!token) throw new Error('No access token found');
        const response = await fetch(`${API_BASE_URL}/hirer/jobs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(jobData),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    getMyJobs: async () => {
        const token = getToken();
        if (!token) throw new Error('No access token found');
        const response = await fetch(`${API_BASE_URL}/hirer/jobs`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    },

    updateJob: async (id, ObjectData) => {
        const token = getToken();
        if (!token) throw new Error('No access token found');
        const response = await fetch(`${API_BASE_URL}/hirer/jobs/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(ObjectData),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    updateJobStatus: async (id, statusData) => {
        const token = getToken();
        if (!token) throw new Error('No access token found');
        const response = await fetch(`${API_BASE_URL}/hirer/jobs/${id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(statusData),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    deleteJob: async (id) => {
        const token = getToken();
        if (!token) throw new Error('No access token found');
        const response = await fetch(`${API_BASE_URL}/hirer/jobs/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    },

    getApplicationsForJob: async (id) => {
        const token = getToken();
        if (!token) throw new Error('No access token found');
        const response = await fetch(`${API_BASE_URL}/hirer/jobs/${id}/applications`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    },

    updateApplicationStatus: async (applicationID, statusData) => {
        const token = getToken();
        if (!token) throw new Error('No access token found');
        const response = await fetch(`${API_BASE_URL}/hirer/jobs/applications/${applicationID}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(statusData),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    // ==========================================
    // SEEKER ENDPOINTS
    // ==========================================

    applyToJob: async (id, applyData) => {
        const token = getToken();
        if (!token) throw new Error('No access token found');
        const response = await fetch(`${API_BASE_URL}/seeker/jobs/${id}/apply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(applyData),
            credentials: 'include'
        });
        return handleResponse(response);
    },

    getMyApplications: async () => {
        const token = getToken();
        if (!token) throw new Error('No access token found');
        const response = await fetch(`${API_BASE_URL}/seeker/applications`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    },

    withdrawApplication: async (applicationID) => {
        const token = getToken();
        if (!token) throw new Error('No access token found');
        const response = await fetch(`${API_BASE_URL}/seeker/applications/${applicationID}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    },

    // For Category Lists (Might be Seeker only role on backend, fallback handled in UI)
    getCategories: async () => {
        const token = getToken();
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch(`${API_BASE_URL}/categories`, {
            method: 'GET',
            headers,
            credentials: 'include'
        });
        return handleResponse(response);
    }
};
