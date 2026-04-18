// src/api/hirer.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://hoodhire.onrender.com';

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

export const hirerAPI = {
    /**
     * Set up a new Hirer profile
     * @param {Object} profileData - Data matching CreateHirerDto
     * @returns {Promise<Object>}
     */
    setupHirerProfile: async (profileData) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/hirer/profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
            body: JSON.stringify(profileData),
        });
        return handleResponse(response);
    },

    /**
     * Get the Hirer's current profile
     * @returns {Promise<Object>}
     */
    getHirerProfile: async () => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/hirer/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    },

    /**
     * Update an existing Hirer profile
     * @param {Object} profileData - Data matching UpdateHirerDto or UpdateBusinessDto
     * @returns {Promise<Object>}
     */
    updateHirerProfile: async (profileData) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/hirer/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
            body: JSON.stringify(profileData),
        });
        return handleResponse(response);
    },

    uploadProfilePicture: async (formData) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/hirer/profile/picture`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
            body: formData,
        });
        return handleResponse(response);
    },

    deleteProfilePicture: async () => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/hirer/profile/picture`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    },

    /**
     * Delete the Hirer profile
     * @returns {Promise<Object>}
     */
    deleteHirerProfile: async () => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/hirer/profile`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    },

    /**
     * Get a specific seeker's profile details as a Hirer
     * @param {string|number} id - The ID of the seeker
     * @returns {Promise<Object>}
     */
    getSeekerProfile: async (id) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/hirer/seeker/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    },

    /**
     * Create a new support ticket (complaint or report) as a hirer
     * @param {Object} ticketData - { reported_seeker_id?, reported_business_id?, type, subject, description }
     */
    createTicket: async (ticketData) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/hirer/tickets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
            body: JSON.stringify(ticketData),
        });
        return handleResponse(response);
    },

    /**
     * Get all tickets filed by the hirer
     */
    getMyTickets: async () => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/hirer/tickets`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    },

    /**
     * Delete a support ticket
     */
    deleteTicket: async (ticketID) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/hirer/tickets/${ticketID}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    },

    /**
     * Get accepted bonds (connections) for the hirer
     * @returns {Promise<Object>}
     */
    getBonds: async () => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/hirer/bonds`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    },

    /**
     * Get list of staff members (accepted bonds)
     * @returns {Promise<Object>}
     */
    getStaff: async () => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/hirer/staff`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    },

    /**
     * Remove a staff member
     * @param {string|number} bondID
     * @returns {Promise<Object>}
     */
    removeStaff: async (bondID) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/hirer/staff/${bondID}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    },

    /**
     * Get available subscription plans for hirers
     */
    getSubscriptionPlans: async () => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/hirer/subscription/plans`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    },

    createOrder: async (planName) => {
    const token = getToken();

    const response = await fetch(`${API_BASE_URL}/hirer/subscription/create-order`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({
            plan: planName
        })
    });

    return handleResponse(response);
},

    verifyPayment: async (paymentData) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/hirer/subscription/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
            body: JSON.stringify(paymentData)
        });
        return handleResponse(response);
    },

    /**
     * Get the Hirer's current subscription status
     * @returns {Promise<Object>}
     */
    getSubscriptionStatus: async () => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/hirer/subscription/status`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    }
};
