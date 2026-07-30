// src/endpoints.js

// Hardcoded base URL using port 8000
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const ENDPOINTS = {
    auth: {
        register: `${BASE_URL}/api/accounts/register/`,
        login: `${BASE_URL}/api/accounts/login/`,
        logout: `${BASE_URL}/api/accounts/logout/`,
        me: `${BASE_URL}/api/accounts/me/`,
        profile: `${BASE_URL}/api/accounts/profile/`,
    },
    repositories: {
        list: `${BASE_URL}/api/repositories/`,
        create: `${BASE_URL}/api/repositories/`,
        detail: (id) => `${BASE_URL}/api/repositories/${id}/`,
        status: (id) => `${BASE_URL}/api/repositories/${id}/status/`,
        branches: (id) => `${BASE_URL}/api/repositories/${id}/branches/`,
        commits: (id) => `${BASE_URL}/api/repositories/${id}/commits/`,
        currentBranch: (id) => `${BASE_URL}/api/repositories/${id}/current_branch/`,
    },
};
