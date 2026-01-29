import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Make sure this matches your backend port
  headers: {
    'Content-Type': 'application/json'
  }
});

// ⭐ REQUEST INTERCEPTOR (Attaches the ID Badge)
api.interceptors.request.use(
  (config) => {
    // 1. Get the data we saved in Login.jsx
    const storedData = localStorage.getItem('user');

    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        
        // 2. Extract the token
        // Our Login response structure is: { token: "...", user: {...} }
        const token = parsedData.token;

        // 3. Attach it to the request header
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (err) {
        console.error("Error parsing auth token:", err);
        // If data is corrupted, clear it so the user can log in again cleanly
        localStorage.removeItem('user');
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR (Handles 401 Errors globally)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server says "Unauthorized" (Token expired or invalid)
    if (error.response && error.response.status === 401) {
      console.warn("Session expired or invalid token. Logging out...");
      
      // Clear storage and redirect to login
      localStorage.clear();
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;