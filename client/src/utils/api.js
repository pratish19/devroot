import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', // Make sure this matches your backend port
});

// ⭐ REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    // 1. Get Token
    const storedData = localStorage.getItem('user');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        if (parsedData.token) {
          config.headers.Authorization = `Bearer ${parsedData.token}`;
        }
      } catch (err) {
        localStorage.removeItem('user');
      }
    }

    // 🚨 THE FIX: If sending a file, let the browser set the Content-Type automatically
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ⭐ RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Session expired. Logging out...");
      localStorage.clear();
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;