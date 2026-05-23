import axios from "axios";
import { useAuthStore } from "../store/useAuthStore";

const defaultApiUrl = `http://${window.location.hostname}:5000/api`;
const configuredApiUrl = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
export const resolvedApiUrl = configuredApiUrl
  ? (configuredApiUrl.endsWith("/api") ? configuredApiUrl : `${configuredApiUrl}/api`)
  : defaultApiUrl;

const apiClient = axios.create({
  baseURL: resolvedApiUrl,
  withCredentials: true
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default apiClient;
