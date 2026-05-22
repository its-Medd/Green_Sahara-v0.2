import { NavLink } from "react-router-dom";
import Logo from "./Logo";
import { useTranslation } from "react-i18next";
import { LogOut, HelpCircle } from "lucide-react";

function Sidebar({ items, onLogout, userRole = "USER" }) {
  const { t } = useTranslation();

  return (
    <aside className="w-[260px] shrink-0 border-e border-slate-100 bg-white p-6 flex flex-col min-h-screen relative z-10 print:hidden">
      <div className="mb-12">
        <Logo />
      </div>
      

      <nav className="space-y-1.5 flex-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all duration-300 font-semibold group ${
                isActive
                  ? "bg-[#1a5d43] text-white shadow-xl shadow-brand-green/20 scale-[1.02]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-[#1a5d43]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon 
                  size={19} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={`transition-colors ${isActive ? "text-white" : "text-slate-400 group-hover:text-[#1a5d43]"}`} 
                />
                <span className="text-[14px]">{item.key ? t(item.key) : item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-6 space-y-2 border-t border-slate-50">
        <button 
          onClick={onLogout} 
          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-rose-500 hover:bg-rose-50 rounded-2xl transition-all group"
        >
          <LogOut size={19} className="text-rose-400 group-hover:text-rose-600" />
          {t("actions.logout")}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

