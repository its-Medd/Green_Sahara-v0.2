function ChatMessage({ role, content }) {
  const isAssistant = role === "assistant" || role === "ASSISTANT";
  return (
    <div className={`max-w-[80%] ${isAssistant ? "self-start" : "self-end"}`}>
      <div
        dir="auto"
        className={`rounded-2xl px-3 py-2 text-sm whitespace-pre-line ${
          isAssistant ? "bg-slate-100" : "bg-brand-navy text-white"
        }`}
      >
        {content}
      </div>
    </div>
  );
}

export default ChatMessage;
