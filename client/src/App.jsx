import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import AppRoutes from "./routes/AppRoutes";
import ToastContainer from "./components/ToastContainer";
import { useAuthStore } from "./store/useAuthStore";

function App() {
  const { i18n } = useTranslation();
  const language = useAuthStore((state) => state.language);

  useEffect(() => {
    i18n.changeLanguage(language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [i18n, language]);

  return (
    <>
      <AppRoutes />
      <ToastContainer />
    </>
  );
}

export default App;

