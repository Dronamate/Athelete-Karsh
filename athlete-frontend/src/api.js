// src/api.js
import axios from 'axios';
import { auth } from './firebase';

// 1. Create a core instance pointing to our Django server
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/',
});

// 2. Add a Request Interceptor
// Intercepts every outgoing API request:
// - Fetches a fresh Firebase ID token if user is signed in with Firebase.
// - Falls back to sessionStorage access token if available.
api.interceptors.request.use(
  async (config) => {
    try {
      if (auth && auth.currentUser) {
        const idToken = await auth.currentUser.getIdToken();
        if (idToken) {
          config.headers.Authorization = `Bearer ${idToken}`;
          return config;
        }
      }
    } catch (err) {
      console.warn('Failed to retrieve Firebase ID token, using session token fallback:', err);
    }

    const token = sessionStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Add a Response Interceptor
// This catches any incoming responses from the Django backend.
// If the backend returns a 401 Unauthorized (invalid or expired token),
// it automatically logs the user out and redirects them to the login page.
api.interceptors.response.use(
  (response) => {
    return response; // If everything is okay, just pass it through
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear out the stale tokens and user data
      sessionStorage.clear();
      localStorage.clear();
      
      // Only redirect if they aren't already on the login or register page
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;