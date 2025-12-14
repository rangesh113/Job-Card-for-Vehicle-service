import axios from "axios";

// Use environment variable for API URL, fallback to localhost for development
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api"
});

// 🔐 ATTACH TOKEN TO EVERY REQUEST
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Debug logging
    console.log("API Request:", config.method, config.url, config.data);
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
