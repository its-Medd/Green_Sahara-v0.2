import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

const defaultApiUrl = `http://${window.location.hostname}:5000/api`;

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiUrl,
  withCredentials: true
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default apiClient;

