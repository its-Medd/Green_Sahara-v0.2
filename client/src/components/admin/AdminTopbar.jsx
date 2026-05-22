import { useState, useEffect, useRef } from "react";
import { Bell, Settings, Search, Check, ShoppingBag, Loader2 } from "lucide-react";
import LanguageSwitcher from "../LanguageSwitcher";
import { getAdminPendingOrders, confirmAdminOrder } from "../../services/adminService";
import { useToast } from "../../hooks/useToast";

function AdminTopbar({ user, title, showSearch }) {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [confirmingId, setConfirmingId] = useState(null);
  const dropdownRef = useRef(null);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      const res = await getAdminPendingOrders();
      setPendingOrders(res?.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleConfirm = async (id) => {
    try {
      setConfirmingId(id);
      await confirmAdminOrder(id);
      toast({ title: "Commande Confirmée", message: `La commande #${id} a été confirmée avec succès.`, type: "success" });
      setPendingOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (e) {
      toast({ title: "Erreur", message: "Impossible de confirmer la commande.", type: "error" });
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 py-2 print:hidden z-40 relative">
      <div className="flex-1">
        {showSearch ? (
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher des données..." 
              className="w-full bg-[#f1f5f9] border-none rounded-2xl py-2 pl-10 pr-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-brand-green/20"
            />
          </div>
        ) : title ? (
          <h1 className="text-2xl font-bold text-[#1a5d43]">{title}</h1>
        ) : null}
      </div>

      <div className="flex items-center gap-5">
        <LanguageSwitcher compact />
        
        <div className="flex items-center gap-2 text-slate-500">
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2 rounded-full transition ${showNotifications ? 'bg-slate-200 text-slate-800' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'}`}
            >
              <Bell size={18} strokeWidth={2.5} />
              {pendingOrders.length > 0 && (
                <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-[#f8fafc]">
                  <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
                  {pendingOrders.length > 0 && (
                    <span className="bg-brand-green/10 text-brand-green text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {pendingOrders.length} nouvelles
                    </span>
                  )}
                </div>
                
                <div className="max-h-80 overflow-y-auto">
                  {pendingOrders.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 text-sm">
                      Aucune nouvelle notification
                    </div>
                  ) : (
                    pendingOrders.map((order) => (
                      <div key={order.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition flex gap-3 group">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-600">
                          <ShoppingBag size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            Nouvelle Commande #{order.id}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Par {order.user?.fullName || "Agriculteur inconnu"}
                          </p>
                          <p className="text-[11px] font-semibold text-brand-green mt-1">
                            {Number(order.totalAmount).toFixed(2)} MAD
                          </p>
                        </div>
                        <button
                          onClick={() => handleConfirm(order.id)}
                          disabled={confirmingId === order.id}
                          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-brand-green hover:text-white flex items-center justify-center transition text-slate-400 shrink-0 self-center disabled:opacity-50"
                          title="Confirmer la commande"
                        >
                          {confirmingId === order.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Check size={16} strokeWidth={3} />
                          )}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button className="p-2 hover:bg-slate-100 rounded-full transition text-slate-400 hover:text-slate-700">
            <Settings size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1"></div>

        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-slate-900 border border-slate-200 shadow-sm text-white text-sm font-bold flex items-center justify-center overflow-hidden">
             {user?.fullName?.slice(0, 1) || "A"}
          </div>
          <div className="leading-tight hidden sm:block">
            <p className="text-xs font-bold text-slate-900">{user?.fullName || "Administrateur"}</p>
            <p className="text-[10px] text-slate-500 font-medium mt-0.5">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default AdminTopbar;
