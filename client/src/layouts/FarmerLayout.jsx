import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { farmerMenu } from "../features/navigation";
import { useCartStore } from "../store/useCartStore";
import { useAuthStore } from "../store/useAuthStore";
import { logoutRequest } from "../services/authService";
import { useToast } from "../hooks/useToast";
import { ShoppingCart, Bell } from "lucide-react";

function FarmerLayout({ children }) {
  const { t } = useTranslation();
  const cartCount = useCartStore((state) => state.items.length);
  const clearSession = useAuthStore((state) => state.clearSession);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const { toast } = useToast();

  const onLogout = async () => {
    try { await logoutRequest(); } catch { /* resilient logout */ }
    clearSession();
    toast({ title: "Session", message: t("auth.logoutSuccess"), type: "success" });
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-[#f8fafc] text-slate-900 font-sans overflow-hidden">
      <Sidebar items={farmerMenu} onLogout={onLogout} userRole="FARMER" />
      <div className="flex-1 flex flex-col h-screen overflow-y-auto px-6 py-6 lg:px-12">
        <Topbar user={user} showSearch={true} searchPlaceholder="Rechercher des lots...">
          <button className="p-2.5 hover:bg-slate-100 rounded-full transition text-slate-400 hover:text-slate-700">
            <Bell size={20} strokeWidth={2} />
          </button>
          <Link to="/farmer/marketplace?panel=cart" className="relative p-2.5 hover:bg-slate-100 rounded-full transition text-slate-400 hover:text-slate-700 group">
            <ShoppingCart size={20} strokeWidth={2} />
            {cartCount > 0 && (
              <span className="absolute top-2 right-2 w-4 h-4 bg-rose-500 rounded-full border-2 border-white text-white text-[9px] font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </Topbar>
        <main className="mt-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}


export default FarmerLayout;

