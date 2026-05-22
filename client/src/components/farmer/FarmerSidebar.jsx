import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LogOut, HelpCircle, Plus, Leaf } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { logoutRequest } from "../../services/authService";
import { useToast } from "../../hooks/useToast";

function FarmerSidebar({ items }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clearSession = useAuthStore((state) => state.clearSession);
  const { toast } = useToast();

  const onLogout = async () => {
    try { await logoutRequest(); } catch { /* resilient logout */ }
    clearSession();
    toast({ title: "Session", message: "Déconnecté avec succès", type: "success" });
    navigate("/login");
  };

  return (
    <aside className="w-[210px] shrink-0 bg-white border-e border-slate-100 flex flex-col min-h-screen p-5 print:hidden">
      {/* Logo */}
      <div className="mb-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1a5d43] rounded-xl flex items-center justify-center shadow-sm">
            <Leaf size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <p className="text-[#1a5d43] font-black text-lg leading-tight">Green Sahara</p>
        </div>
        <p className="text-slate-400 text-[10px] font-semibold tracking-widest uppercase mt-1.5 pl-10">Économie Circulaire</p>
      </div>

      {/* Nav */}
      <nav className="space-y-1 flex-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 font-medium text-sm ${
                isActive
                  ? "bg-[#f0fdf4] text-[#1a5d43] font-bold"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={17} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-[#1a5d43]" : "text-slate-400"} />
                <span>{item.key ? t(item.key) : item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="mt-auto space-y-2">

        <button
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all"
        >
          <HelpCircle size={17} className="text-slate-400" /> Aide
        </button>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all"
        >
          <LogOut size={17} className="text-slate-400" /> Déconnexion
        </button>
      </div>
    </aside>
  );
}

export default FarmerSidebar;
