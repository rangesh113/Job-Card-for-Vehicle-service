import axios from "axios";

// Use localhost for development
const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

// 🔐 ATTACH TOKEN TO EVERY REQUEST
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
