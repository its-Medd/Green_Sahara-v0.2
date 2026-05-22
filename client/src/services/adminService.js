import apiClient from "./apiClient";

export const getAdminDashboard = async () => (await apiClient.get("/admin/dashboard")).data;
export const analyzeAdminImage = async (payload) =>
  (await apiClient.post("/admin/analysis", payload)).data;
export const getAdminLots = async () => (await apiClient.get("/admin/lots")).data;
export const createAdminLot = async (payload) => (await apiClient.post("/admin/lots", payload)).data;
export const updateAdminLot = async (id, payload) =>
  (await apiClient.put(`/admin/lots/${id}`, payload)).data;
export const deleteAdminLot = async (id) => (await apiClient.delete(`/admin/lots/${id}`)).data;
export const getAdminStats = async () => (await apiClient.get("/admin/statistics")).data;

export const getAdminPendingOrders = async () => (await apiClient.get("/admin/orders/pending")).data;
export const confirmAdminOrder = async (id) => (await apiClient.put(`/admin/orders/${id}/confirm`)).data;

// Arduino Container
export const getContainerStatus = async () => (await apiClient.get("/container/status")).data;
