import { Search, ShoppingCart, Bell } from "lucide-react";
import LanguageSwitcher from "../LanguageSwitcher";
import { useAuthStore } from "../../store/useAuthStore";
import { Link } from "react-router-dom";

function FarmerTopbar({ cartCount = 0 }) {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="flex items-center justify-between gap-4 py-3 px-1 print:hidden">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
        <input
          type="text"
          placeholder="Rechercher des ressources..."
          className="w-full bg-slate-100 border-none rounded-full py-2 pl-9 pr-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-[#1a5d43]/20 transition"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <LanguageSwitcher compact />

        {/* Cart */}
        <Link to="/farmer/marketplace?panel=cart" className="relative text-slate-500 hover:text-slate-800 transition">
          <ShoppingCart size={20} strokeWidth={2} />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full border border-white text-white text-[9px] font-bold flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>

        {/* User */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-slate-800 text-white text-sm font-bold flex items-center justify-center">
            {user?.fullName?.slice(0, 1) || "F"}
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-xs font-bold text-slate-900">{user?.fullName || "Agriculteur"}</p>
            <p className="text-[10px] text-slate-500">Agriculteur Vérifié</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default FarmerTopbar;
