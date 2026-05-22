import { useEffect, useRef } from "react";
import { Send } from "lucide-react";
import ChatMessage from "./ChatMessage";
import { useTranslation } from "react-i18next";

function ChatWindow({ messages, value, onChange, onSend, loading = false }) {
  const fileRef = useRef(null);
  const endRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  return (
    <div className="card p-3.5">
      <div dir="ltr" className="h-72 overflow-auto flex flex-col gap-2.5 p-2 bg-slate-50 rounded-xl">
        {messages.map((message, index) => (
          <ChatMessage
            key={message.id || `${message.role}-${index}`}
            role={message.role}
            content={message.content}
          />
        ))}
        <div ref={endRef} />
      </div>
      <div className="mt-3 flex items-center gap-2">
        <input
          className="input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={loading ? t("ai.waiting") : "..."}
          disabled={loading}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !loading) onSend();
          }}
        />
        <button className="btn-primary px-3 disabled:opacity-60 disabled:cursor-not-allowed" onClick={onSend} disabled={loading}>
          <Send size={14} />
          {loading ? t("ai.streaming") : t("actions.send")}
        </button>
        <input ref={fileRef} type="file" className="hidden" />
      </div>
    </div>
  );
}

export default ChatWindow;
