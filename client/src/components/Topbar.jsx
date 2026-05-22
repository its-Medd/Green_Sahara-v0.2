import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import RoleBadge from "./RoleBadge";

function Topbar({ 
  user, 
  title, 
  subtitle, 
  showSearch = true, 
  searchPlaceholder,
  children // This slot will take role-specific buttons (Notifications, Cart, etc.)
}) {
  const { t } = useTranslation();
  const effectivePlaceholder = searchPlaceholder || t("topbar.searchPlaceholder");

  return (
    <header className="flex flex-wrap items-center justify-between gap-6 py-4 px-2 print:hidden z-30 relative">
      {/* Search or Title Area */}
      <div className="flex-1">
        {showSearch ? (
          <div className="relative max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1a5d43] transition-colors" size={18} />
            <input 
              type="text" 
              placeholder={effectivePlaceholder} 
              className="w-full bg-white border border-slate-100 rounded-[20px] py-3 pl-12 pr-4 text-sm text-slate-700 outline-none focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green/30 transition-all shadow-sm"
            />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <h1 className="text-3xl font-black text-[#0d1b3e] tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-slate-400 font-medium mt-1">{subtitle}</p>}
          </div>
        )}
      </div>

      {/* Right Actions Area */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <LanguageSwitcher compact />
          <div className="h-6 w-px bg-slate-200 mx-1 hidden md:block"></div>
          
          {/* Action Slot (Notifications, Cart, etc.) */}
          <div className="flex items-center gap-2">
            {children}
          </div>
        </div>

        {/* User Profile Summary */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
          <div className="h-10 w-10 rounded-full bg-slate-900 border-2 border-white shadow-md text-white text-sm font-bold flex items-center justify-center overflow-hidden shrink-0">
             {user?.fullName?.slice(0, 1) || "U"}
          </div>
          <div className="leading-tight hidden sm:block">
            <p className="text-sm font-bold text-slate-900">{user?.fullName}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <RoleBadge role={user?.role} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;

