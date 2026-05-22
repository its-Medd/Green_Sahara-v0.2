import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useAuthStore } from "../store/useAuthStore";
import { logoutRequest } from "../services/authService";
import { useToast } from "../hooks/useToast";

function AppLayout({ menu, children, title, subtitle, cartCount = 0, showCart = false, cartTarget = "/farmer/marketplace" }) {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const navigate = useNavigate();
  const { toast } = useToast();

  const onLogout = async () => {
    try {
      await logoutRequest();
    } catch {
      // Keep local logout resilient.
    }
    clearSession();
    toast({ title: "Session", message: t("auth.logoutSuccess"), type: "success" });
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-brand-bg">
      <Sidebar items={menu} onLogout={onLogout} />
      <div className="flex-1 compact-shell py-4">
        <Topbar
          user={user}
          cartCount={cartCount}
          title={title}
          subtitle={subtitle}
          showCart={showCart}
          cartTarget={cartTarget}
        />
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export default AppLayout;
