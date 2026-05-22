import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import NotificationDropdown from "../components/NotificationDropdown";
import { adminMenu } from "../features/navigation";
import { useAuthStore } from "../store/useAuthStore";
import { logoutRequest } from "../services/authService";
import { useToast } from "../hooks/useToast";
import { Settings } from "lucide-react";

function AdminLayout({ children, title, showSearch }) {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const navigate = useNavigate();
  const { toast } = useToast();

  const onLogout = async () => {
    try { await logoutRequest(); } catch { /* resilient logout */ }
    clearSession();
    toast({ title: "Session", message: t("auth.logoutSuccess"), type: "success" });
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-[#f8fafc] text-slate-900 overflow-hidden font-sans">
      <Sidebar items={adminMenu} onLogout={onLogout} userRole="ADMIN" />
      <div className="flex-1 flex flex-col h-screen overflow-y-auto px-6 py-6 lg:px-12">
        <Topbar user={user} title={title} showSearch={showSearch}>
          <NotificationDropdown />
          <button className="p-2.5 hover:bg-slate-100 rounded-full transition text-slate-400 hover:text-slate-700">
            <Settings size={20} strokeWidth={2} />
          </button>
        </Topbar>
        
        <main className="mt-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}


export default AdminLayout;
