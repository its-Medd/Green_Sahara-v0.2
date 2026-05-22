import apiClient from "./apiClient";

export const registerRequest = async (payload) => {
  const { data } = await apiClient.post("/auth/register", payload);
  return data;
};

export const loginRequest = async (payload) => {
  const { data } = await apiClient.post("/auth/login", payload);
  return data;
};

export const adminLoginRequest = async (payload) => {
  const { data } = await apiClient.post("/auth/admin-login", payload);
  return data;
};

export const googleTokenLoginRequest = async (payload) => {
  const { data } = await apiClient.post("/auth/google", payload);
  return data;
};

export const meRequest = async () => {
  const { data } = await apiClient.get("/auth/me");
  return data;
};

export const logoutRequest = async () => {
  const { data } = await apiClient.post("/auth/logout");
  return data;
};
