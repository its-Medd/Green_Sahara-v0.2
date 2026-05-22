import { useToastStore } from "../store/useToastStore";

export function useToast() {
  const pushToast = useToastStore((state) => state.pushToast);
  return {
    toast: ({ title, message, type = "info" }) => pushToast({ title, message, type })
  };
}

