import { useEffect } from "react";
import { useToastStore } from "../store/useToastStore";

function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  useEffect(() => {
    const timers = toasts.map((toast) => setTimeout(() => removeToast(toast.id), 3500));
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [toasts, removeToast]);

  return (
    <div className="fixed bottom-4 end-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div key={toast.id} className="card px-3 py-2.5 min-w-[260px]">
          <p className="font-semibold text-sm">{toast.title}</p>
          <p className="text-xs text-brand-muted mt-0.5">{toast.message}</p>
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;

