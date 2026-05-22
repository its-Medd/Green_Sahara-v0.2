import apiClient from "./apiClient";
import { useAuthStore } from "../store/useAuthStore";

export const farmerChatRequest = async (payload) => (await apiClient.post("/farmer/ai/chat", payload)).data;
export const farmerAnalyzeImageRequest = async (payload) =>
  (await apiClient.post("/farmer/ai/analyze", payload)).data;
export const resetFarmerAiRequest = async () => (await apiClient.post("/farmer/ai/reset")).data;
export const farmerHistoryAiRequest = async () => (await apiClient.get("/farmer/ai/history")).data;

export async function streamFarmerChatRequest(payload, { onChunk, onDone } = {}) {
  const token = useAuthStore.getState().token;
  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  const response = await fetch(`${apiBase}/farmer/ai/chat/stream`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok || !response.body) {
    const text = await response.text();
    throw new Error(text || "AI stream failed");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let finalMessage = "";
  let streamProvider = "gemini";

  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() || "";

    for (const event of events) {
      const line = event
        .split("\n")
        .find((entry) => entry.startsWith("data:"));
      if (!line) continue;

      const payloadText = line.replace(/^data:\s*/, "");
      let parsed;
      try {
        parsed = JSON.parse(payloadText);
      } catch {
        continue;
      }

      if (parsed.provider) streamProvider = parsed.provider;
      if (parsed.type === "chunk") {
        finalMessage = parsed.full || finalMessage;
        if (onChunk) onChunk(parsed);
      }
      if (parsed.type === "done") {
        finalMessage = parsed.message || finalMessage;
        if (onDone) onDone(parsed);
      }
    }
  }

  return { reply: finalMessage, provider: streamProvider };
}
