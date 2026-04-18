// src/api/chat.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://hoodhire.onrender.com';
// const WS_BASE_URL = import.meta.env.VITE_CHAT_BASE_URL || 'https://hoodhire-chat-service.onrender.com';
const CHAT_BASE_URL =
    import.meta.env.VITE_CHAT_BASE_URL || 'https://hoodhire-chat-service.onrender.com';

const WS_BASE_URL = CHAT_BASE_URL.replace('https', 'wss');

let socket = null;
let listeners = new Set();
let reconnectTimer = null;
let activeChatId = null;

const handleResponse = async (response) => {
    let data;
    try {
        data = await response.json();
    } catch (e) {
        data = {};
    }

    if (!response.ok) {
        const error = new Error(data.message || data.error || 'An error occurred during the request.');
        error.status = response.status;
        error.data = data;
        throw error;
    }
    return data;
};

const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const chatAPI = {
    // WebSocket Management
    connectWebSocket: (token) => {
        if (!token) {
            token = localStorage.getItem('accessToken');
        }
        if (!token) return;

        if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
            return;
        }

        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }

        socket = new WebSocket(`${WS_BASE_URL}/ws?token=${token}`);

        socket.onopen = () => {
            console.log('Chat WebSocket connected');
        };

        socket.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);
                if (msg.error) {
                    console.error('Chat WebSocket error:', msg.error);
                    return;
                }
                // Notify all listeners
                listeners.forEach(listener => listener(msg));
            } catch (err) {
                console.error('Failed to parse WebSocket message:', err);
            }
        };

        socket.onclose = () => {
            console.log('Chat WebSocket disconnected, reconnecting in 3s...');
            reconnectTimer = setTimeout(() => {
                const currentToken = localStorage.getItem('accessToken');
                if (currentToken) {
                    chatAPI.connectWebSocket(currentToken);
                }
            }, 3000);
        };

        socket.onerror = (err) => {
            console.error('Chat WebSocket error observed:', err);
        };
    },

    disconnectWebSocket: () => {
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
        if (socket) {
            socket.close();
            socket = null;
        }
    },

    sendMessage: (receiverID, content) => {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            console.error('Chat WebSocket not connected');
            return false;
        }
        socket.send(JSON.stringify({
            receiver_id: Number(receiverID),
            content: content
        }));
        return true;
    },

    // Subscription System
    subscribe: (callback) => {
        listeners.add(callback);
        return () => listeners.delete(callback);
    },

    setActiveChat: (id) => {
        activeChatId = id ? Number(id) : null;
    },

    getActiveChat: () => activeChatId,

    broadcastTotalUnread: (count) => {
        listeners.forEach(listener => listener({ type: 'TOTAL_UNREAD_UPDATE', count }));
    },

    notifyRead: (userID) => {
        listeners.forEach(listener => listener({ type: 'MESSAGE_READ', userID }));
    },


    getConversations: async () => {
        const user = JSON.parse(localStorage.getItem('user'))
        const role = user?.role
        const endpoint = role === 'seeker' ? '/seeker/bonds' : '/hirer/bonds'
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: getAuthHeaders(),
            credentials: 'include'
        })
        return handleResponse(response)
    },

    getUnreadCount: async () => {
        const response = await fetch(`${API_BASE_URL}/messages/unread`, {
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    },

    getConversation: async (userID, page = 1, limit = 20) => {
        const response = await fetch(`${API_BASE_URL}/messages/${userID}?page=${page}&limit=${limit}`, {
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    },

    getChatMetadata: async () => {
        const response = await fetch(`${API_BASE_URL}/messages/conversations`, {
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    },

    getUnreadBreakdown: async () => {
        const response = await fetch(`${API_BASE_URL}/messages/unread/breakdown`, {
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    },

    markAsRead: async (userID) => {
        const response = await fetch(`${API_BASE_URL}/messages/${userID}/read`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
        });
        return handleResponse(response);
    }
};
