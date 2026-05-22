import apiClient from "./apiClient";

export const getImpactSummary = async () => (await apiClient.get("/impact/summary")).data;

