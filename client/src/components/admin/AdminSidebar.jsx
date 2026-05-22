import { NavLink } from "react-router-dom";
import Logo from "../Logo";
import { useTranslation } from "react-i18next";
import { LogOut } from "lucide-react";

function AdminSidebar({ items, onLogout }) {
  const { t } = useTranslation();
  return (
    <aside className="w-[240px] shrink-0 border-e border-slate-100 bg-white p-5 flex flex-col min-h-screen relative z-10 print:hidden">
      <Logo />
      <nav className="mt-8 space-y-1.5 flex-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 font-medium ${
                isActive
                  ? "bg-[#1f5c40] text-white shadow-md shadow-brand-green/20"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-white" : "text-slate-400"} />
                <span className="text-sm">{item.key ? t(item.key) : item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <button 
        onClick={onLogout} 
        className="mt-auto flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all"
      >
        <LogOut size={18} className="text-slate-400" />
        {t("actions.logout")}
      </button>
    </aside>
  );
}

export default AdminSidebar;
