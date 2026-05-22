import apiClient from "./apiClient";

export const getProviderDashboard = async () => (await apiClient.get("/provider/dashboard")).data;
export const getProviderContainers = async () => (await apiClient.get("/provider/containers")).data;
export const getProviderTransportStatus = async () =>
  (await apiClient.get("/provider/transport-status")).data;
export const getProviderProfile = async () => (await apiClient.get("/provider/profile")).data;
export const updateProviderProfile = async (payload) =>
  (await apiClient.put("/provider/profile", payload)).data;
