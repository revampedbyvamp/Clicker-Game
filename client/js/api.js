// API Configuration
const API_URL = 'http://localhost:3000/api';
let authToken = localStorage.getItem('authToken');

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (authToken) {
        defaultOptions.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'API request failed');
    }

    return data;
}

// Authentication API
const authAPI = {
    async register(username, password) {
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });

        authToken = data.token;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('username', data.user.username);
        localStorage.setItem('userId', data.user.id);

        return data;
    },

    async login(username, password) {
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
        });

        authToken = data.token;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('username', data.user.username);
        localStorage.setItem('userId', data.user.id);

        return data;
    },

    logout() {
        authToken = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
    },

    async verify() {
        return await apiRequest('/auth/verify');
    },
};

// Game API
const gameAPI = {
    async getState() {
        return await apiRequest('/game/state');
    },

    async saveState(gameState) {
        return await apiRequest('/game/save', {
            method: 'POST',
            body: JSON.stringify(gameState),
        });
    },

    async recordClick(clickValue) {
        return await apiRequest('/game/click', {
            method: 'POST',
            body: JSON.stringify({ clickValue }),
        });
    },

    async purchase(type, item, cost) {
        return await apiRequest('/game/purchase', {
            method: 'POST',
            body: JSON.stringify({ type, item, cost }),
        });
    },
};

// Leaderboard API
const leaderboardAPI = {
    async getCurrent() {
        return await apiRequest('/leaderboard/current');
    },

    async getHistory(limit = 10) {
        return await apiRequest(`/leaderboard/history?limit=${limit}`);
    },

    async getUserRankings(userId) {
        return await apiRequest(`/leaderboard/user/${userId}`);
    },
};

// Trophy API
const trophyAPI = {
    async getUserTrophies(userId) {
        return await apiRequest(`/trophies/${userId}`);
    },
};
