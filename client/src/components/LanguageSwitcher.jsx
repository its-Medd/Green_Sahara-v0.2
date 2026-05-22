import { useTranslation } from "react-i18next";
import { useAuthStore } from "../store/useAuthStore";
import { updateLanguageRequest } from "../services/userService";
import { Globe } from "lucide-react";

function LanguageSwitcher({ compact = false }) {
  const { i18n } = useTranslation();
  const language = useAuthStore((state) => state.language);
  const setLanguage = useAuthStore((state) => state.setLanguage);
  const token = useAuthStore((state) => state.token);

  const switchLanguage = async (lng) => {
    setLanguage(lng);
    i18n.changeLanguage(lng);
    if (token) {
      try {
        await updateLanguageRequest(lng);
      } catch {
        // Silent fallback to local preference only.
      }
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`inline-flex rounded-full bg-gray-100 p-0.5 ${compact ? "text-[10px]" : "text-xs font-semibold"}`}>
        <button
          type="button"
          onClick={() => switchLanguage("fr")}
          className={`px-3 py-1.5 rounded-full transition-all ${
            language === "fr" ? "bg-white text-brand-text shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          FR
        </button>
        <button
          type="button"
          onClick={() => switchLanguage("ar")}
          className={`px-3 py-1.5 rounded-full transition-all ${
            language === "ar" ? "bg-white text-brand-text shadow-sm" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          AR
        </button>
      </div>
      <Globe className="text-slate-600" size={compact ? 16 : 20} strokeWidth={1.5} />
    </div>
  );
}

export default LanguageSwitcher;

