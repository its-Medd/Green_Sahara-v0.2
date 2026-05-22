import apiClient from "./apiClient";

export const getFarmerDashboard = async () => (await apiClient.get("/farmer/dashboard")).data;
export const getFarmerProfile = async () => (await apiClient.get("/farmer/profile")).data;
export const updateFarmerProfile = async (payload) => (await apiClient.put("/farmer/profile", payload)).data;
export const getFarmerProducts = async (params) => (await apiClient.get("/farmer/products", { params })).data;
export const getFarmerOrders = async () => (await apiClient.get("/farmer/orders")).data;
export const getFarmerInsights = async () => (await apiClient.get("/farmer/insights")).data;
export const getFarmerAlerts = async () => (await apiClient.get("/farmer/alerts")).data;
export const validateCartItem = async (productId) => (await apiClient.post("/farmer/cart/add", { productId })).data;
export const createFarmerOrder = async (items) => (await apiClient.post("/farmer/orders/create", { items })).data;
