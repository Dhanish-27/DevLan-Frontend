import axios from 'axios';
import { BASE_URL } from './endpoints';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor for handling 401s (token expiry)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Ideally, we would handle refresh tokens here, 
        // but for simplicity we'll just throw the error for now
        // and let the AuthContext handle logging out if needed.
        if (error.response && error.response.status === 401) {
            // Optional: trigger logout
        }
        return Promise.reject(error);
    }
);

export default api;
