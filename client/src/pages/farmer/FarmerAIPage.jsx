import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FarmerLayout from "../../layouts/FarmerLayout";
import ChatWindow from "../../components/ChatWindow";
import UploadBox from "../../components/UploadBox";
import {
  farmerAnalyzeImageRequest,
  farmerHistoryAiRequest,
  resetFarmerAiRequest,
  streamFarmerChatRequest
} from "../../services/aiService";
import { fileToBase64 } from "../../utils/fileToBase64";
import { useToast } from "../../hooks/useToast";

function FarmerAIPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [preview, setPreview] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [imageMimeType, setImageMimeType] = useState("image/jpeg");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const analysisRef = useRef(null);
  const localIdRef = useRef(0);

  const buildLocalMessage = (role, content, id) => ({
    id: id || `local-${Date.now()}-${localIdRef.current++}`,
    role,
    content
  });

  const welcomeMessage = useMemo(
    () => ({
      id: "welcome-message",
      role: "assistant",
      content: t("farmer.ai.welcome")
    }),
    [t]
  );

  useEffect(() => {
    farmerHistoryAiRequest()
      .then((response) => {
        if (response?.data?.length) {
          setMessages(
            response.data.map((entry) => ({
              id: entry.id || `history-${entry.createdAt || Date.now()}-${entry.role}`,
              role: entry.role,
              content: entry.content
            }))
          );
        } else {
          setMessages([welcomeMessage]);
        }
      })
      .catch(() => setMessages([welcomeMessage]));
  }, [welcomeMessage]);

  useEffect(() => {
    if (searchParams.get("mode") === "analysis") {
      analysisRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [searchParams]);

  const onSend = async () => {
    if (loading || !text.trim()) return;

    const userText = text.trim();
    const historyForRequest = messages.map((entry) => ({ role: entry.role, content: entry.content }));
    const placeholder = t("farmer.ai.streaming");

    setLoading(true);
    setText("");
    const userMessage = buildLocalMessage("user", userText);
    const assistantMessage = buildLocalMessage("assistant", placeholder);
    setMessages((state) => [...state, userMessage, assistantMessage]);

    try {
      const streamed = await streamFarmerChatRequest(
        {
          message: userText,
          history: historyForRequest
        },
        {
          onChunk: (chunk) => {
            setMessages((state) => {
              return state.map((entry) =>
                entry.id === assistantMessage.id
                  ? {
                      ...entry,
                      content: chunk.full || placeholder
                    }
                  : entry
              );
            });
          }
        }
      );

      if (streamed?.provider === "fallback") {
        toast({
          title: "Gemini",
          message: t("ai.fallbackGemini"),
          type: "info"
        });
      }
    } catch (error) {
      setMessages((state) =>
        state.map((entry) =>
          entry.id === assistantMessage.id
            ? {
                ...entry,
                content: t("ai.errorAi")
              }
            : entry
        )
      );

      toast({
        title: "IA",
        message: error?.message || "Erreur IA",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const onFile = async (file) => {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    const base64 = await fileToBase64(file);
    setImageBase64(base64);
    setImageMimeType(file.type || "image/jpeg");
  };

  const analyzeImage = async () => {
    if (!imageBase64 || loading) return;
    setLoading(true);
    try {
      const response = await farmerAnalyzeImageRequest({
        imageBase64,
        context: { mimeType: imageMimeType }
      });

      if (response?.data?.provider === "fallback") {
        toast({
          title: "Gemini",
          message: t("ai.fallbackGemini"),
          type: "info"
        });
      }

      setMessages((state) => [...state, buildLocalMessage("assistant", response.data.summary)]);
    } catch (error) {
      toast({
        title: "IA",
        message: error?.message || "Erreur analyse",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const reset = async () => {
    if (loading) return;
    await resetFarmerAiRequest();
    setMessages([welcomeMessage]);
    setPreview("");
    setImageBase64("");
    setImageMimeType("image/jpeg");
    toast({ title: "IA", message: t("farmer.ai.toastReset"), type: "success" });
  };

  return (
    <FarmerLayout title={t("farmer.ai.title")} subtitle={t("farmer.ai.subtitle")}>
      <div className="grid xl:grid-cols-[300px_1fr] gap-3">
        <div className="card p-3.5 space-y-2" ref={analysisRef}>
          <UploadBox label={t("farmer.ai.imageLabel")} onFile={onFile} preview={preview} />
          <button
            className="btn-secondary w-full text-xs disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={analyzeImage}
            disabled={loading || !imageBase64}
          >
            {t("farmer.ai.startAnalysis")}
          </button>
          <button
            className="btn-secondary w-full text-xs disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={reset}
            disabled={loading}
          >
            {t("farmer.ai.reset")}
          </button>
        </div>

        <ChatWindow
          messages={messages}
          value={text}
          onChange={setText}
          onSend={onSend}
          loading={loading}
        />
      </div>
    </FarmerLayout>
  );
}

export default FarmerAIPage;
