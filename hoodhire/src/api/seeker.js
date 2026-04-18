// src/api/seeker.js

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

export const seekerAPI = {
    /**
     * Set up a new Seeker profile
     * @param {Object} profileData - Data matching CreateSeekerDTO
     * @returns {Promise<Object>}
     */
    setupSeekerProfile: async (profileData) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/seeker/profile`, {
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
     * Get the Seeker's current profile
     * @returns {Promise<Object>}
     */
    getSeekerProfile: async () => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/seeker/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    },

    /**
     * Update an existing Seeker profile
     * @param {Object} profileData - Data matching CreateSeekerDTO
     * @returns {Promise<Object>}
     */
    updateSeekerProfile: async (profileData) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/seeker/profile`, {
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
        const response = await fetch(`${API_BASE_URL}/seeker/profile/picture`, {
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
        const response = await fetch(`${API_BASE_URL}/seeker/profile/picture`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    },

    /**
     * Get the Seeker's work preferences
     * @returns {Promise<Object>}
     */
    getWorkPreference: async () => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/seeker/preference`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    },

    /**
     * Update or create the Seeker's work preferences
     * @param {Object} preferenceData - Data matching WorkPreferenceDTO
     * @returns {Promise<Object>}
     */
    updateWorkPreference: async (preferenceData) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/seeker/preference`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
            body: JSON.stringify(preferenceData),
        });
        return handleResponse(response);
    },

    /**
     * Add a work experience
     * @param {Object} experienceData - Data matching WorkExperienceDTO
     * @returns {Promise<Object>}
     */
    addWorkExperience: async (experienceData) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/seeker/experience`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
            body: JSON.stringify(experienceData),
        });
        return handleResponse(response);
    },

    /**
     * Get all work experiences for the seeker
     * @returns {Promise<Object>}
     */
    getWorkExperiences: async () => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/seeker/experience`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    },


    deleteWorkExperience: async (id) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/seeker/experience/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    },

    /**
     * Get the Seeker's Job Interests (Categories)
     * @returns {Promise<Object>}
     */
    getJobCategories: async () => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/categories`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    },

    /**
     * Update the Seeker's Job Interests (Categories)
     * @param {Object} categoryData - Data matching payload e.g. { category_ids: [1, 2] }
     * @returns {Promise<Object>}
     */
    updateJobInterests: async (categoryData) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/seeker/categories`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
            body: JSON.stringify(categoryData),
        });
        return handleResponse(response);
    },

    /**
     * Fetch a seeker's public profile by ID
     * @param {string|number} id The ID of the seeker
     * @returns {Promise<Object>}
     */
    getSeekerById: async (id) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/seeker/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    },

    /**
     * Follow a business
     * @param {number} businessID 
     * @returns {Promise<Object>}
     */
    followBusiness: async (businessID) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/seeker/follow/${businessID}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    },

    /**
     * Unfollow a business
     * @param {number} businessID 
     * @returns {Promise<Object>}
     */
    unfollowBusiness: async (businessID) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/seeker/follow/${businessID}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    },

    /**
     * Get list of businesses the seeker is following
     * @returns {Promise<Object>}
     */
    /**
     * Check if the current seeker follows a specific business
     * @param {number} businessID 
     * @returns {Promise<Object>} Returns { is_following: boolean }
     */
    checkFollowStatus: async (businessID) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/seeker/follow/${businessID}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    },

    /**
     * Get all reviews for a business (Public)
     */
    getBusinessReviews: async (businessID) => {
        const response = await fetch(`${API_BASE_URL}/businesses/${businessID}/reviews`, {
            method: 'GET',
            credentials: 'include'
        });
        return handleResponse(response);
    },

    /**
     * Create a new review for a business
     */
    createBusinessReview: async (businessID, reviewData) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/seeker/businesses/${businessID}/review`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
            body: JSON.stringify(reviewData),
        });
        return handleResponse(response);
    },

    /**
     * Update an existing review for a business
     */
    updateBusinessReview: async (businessID, reviewData) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/seeker/businesses/${businessID}/review`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
            body: JSON.stringify(reviewData),
        });
        return handleResponse(response);
    },

    /**
     * Delete a seeker's review for a business
     */
    deleteBusinessReview: async (businessID) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/seeker/businesses/${businessID}/review`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    },

    /**
     * Get the current seeker's review for a business
     */
    getMyBusinessReview: async (businessID) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/seeker/businesses/${businessID}/my-review`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    },

    /**
     * Create a new support ticket (complaint or report)
     * @param {Object} ticketData - { reported_business_id?, type, subject, description }
     */
    createTicket: async (ticketData) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/seeker/tickets`, {
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
     * Get all tickets filed by the seeker
     */
    getMyTickets: async () => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/seeker/tickets`, {
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
        const response = await fetch(`${API_BASE_URL}/seeker/tickets/${ticketID}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    },

    /**
     * Favorite/Unfavorite Businesses
     */
    favoriteBusiness: async (businessID) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/seeker/favorite/${businessID}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    },

    unfavoriteBusiness: async (businessID) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/seeker/favorite/${businessID}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    },

    getFavoriteBusinesses: async () => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/seeker/favorite`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    },

    isBusinessFavorited: async (businessID) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/seeker/favorite/${businessID}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    },

    /**
     * Save/Unsave Jobs
     */
    saveJob: async (jobID) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/seeker/saved/jobs/${jobID}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    },

    unsaveJob: async (jobID) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/seeker/saved/jobs/${jobID}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    },

    getSavedJobs: async () => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/seeker/saved/jobs`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    },

    isJobSaved: async (jobID) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/seeker/saved/jobs/${jobID}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    },

    /**
     * Get statistics for all job categories
     * @returns {Promise<Object>}
     */
    getCategoryStats: async () => {
        const response = await fetch(`${API_BASE_URL}/categories/stats`, {
            method: 'GET',
            credentials: 'include'
        });
        return handleResponse(response);
    },
    /**
     * Get accepted bonds (connections) for the seeker
     * @returns {Promise<Object>}
     */
    getBonds: async () => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/seeker/bonds`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    },

    /**
     * Upload or update the seeker's resume
     * @param {FormData} formData - Contains the 'resume' file
     * @returns {Promise<Object>}
     */
    uploadResume: async (formData) => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/seeker/resume`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include',
            body: formData,
        });
        return handleResponse(response);
    },

    /**
     * Delete the seeker's resume
     * @returns {Promise<Object>}
     */
    deleteResume: async () => {
        const token = getToken();
        const response = await fetch(`${API_BASE_URL}/seeker/resume`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        return handleResponse(response);
    }
};
