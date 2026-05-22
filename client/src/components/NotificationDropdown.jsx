import { useState, useEffect, useRef } from "react";
import { Bell, ShoppingBag, Check, Loader2 } from "lucide-react";
import { getAdminPendingOrders, confirmAdminOrder } from "../services/adminService";
import { useToast } from "../hooks/useToast";

function NotificationDropdown() {
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
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setShowNotifications(!showNotifications)}
        className={`p-2.5 rounded-full transition-all duration-300 relative group ${
          showNotifications ? 'bg-[#1a5d43] text-white shadow-lg' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
        }`}
      >
        <Bell size={20} strokeWidth={2} />
        {pendingOrders.length > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-bounce"></span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-[24px] shadow-2xl border border-slate-50 overflow-hidden z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
          <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-[#f8fafc]">
            <h3 className="font-bold text-slate-800 text-sm">Alertes Système</h3>
            {pendingOrders.length > 0 && (
              <span className="bg-brand-green/10 text-brand-green text-[10px] font-bold px-2 py-0.5 rounded-full">
                {pendingOrders.length} nouvelles
              </span>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {pendingOrders.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm italic">
                Aucune alerte en attente
              </div>
            ) : (
              pendingOrders.map((order) => (
                <div key={order.id} className="p-4 border-b border-slate-50 hover:bg-slate-50/50 transition flex gap-3 group">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 text-amber-600 shadow-sm">
                    <ShoppingBag size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      Nouvelle Commande #{order.id}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {order.user?.fullName || "Agriculteur"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleConfirm(order.id)}
                    disabled={confirmingId === order.id}
                    className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-brand-green hover:text-white flex items-center justify-center transition text-slate-400 shrink-0 self-center disabled:opacity-50"
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
  );
}

export default NotificationDropdown;
