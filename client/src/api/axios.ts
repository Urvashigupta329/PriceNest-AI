
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

console.log("[AXIOS] Initializing with base URL:", API_BASE_URL);

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  console.log(`[AXIOS] ${config.method?.toUpperCase()} ${config.url}`);
  console.log("[AXIOS] Request data:", config.data);
  
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
    console.log("[AXIOS] Authorization header added");
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(`[AXIOS] Response 2xx: ${response.status}`, response.data);
    return response;
  },
  (error) => {
    console.error(`[AXIOS] Request failed:`, {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code
    });
    return Promise.reject(error);
  }
);

