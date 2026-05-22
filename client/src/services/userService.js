import apiClient from "./apiClient";

export const updateLanguageRequest = async (language) =>
  (await apiClient.put("/users/language", { language })).data;

