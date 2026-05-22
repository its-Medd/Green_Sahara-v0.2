import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import AdminLayout from "../../layouts/AdminLayout";
import { getAdminDashboard, getContainerStatus } from "../../services/adminService";
import { Users, Tractor, ShoppingBag, ShieldAlert, Wifi, WifiOff } from "lucide-react";
import SmartBinLiveData from "../../components/SmartBinLiveData";

function AdminDashboardPage() {
   const { t } = useTranslation();
   const [data, setData] = useState(null);
   const [container, setContainer] = useState(null);

   useEffect(() => {
      getAdminDashboard().then((response) => setData(response.data)).catch(() => null);
      getContainerStatus().then((response) => setContainer(response.data)).catch(() => null);

      // Poll container status every 10 seconds
      const interval = setInterval(() => {
         getContainerStatus().then((response) => setContainer(response.data)).catch(() => null);
      }, 10000);
      return () => clearInterval(interval);
   }, []);

   // Helpers for mockup feeling
   const kpiData = [
      {
         label: t("adminDashboard.totalUsers"),
         value: data?.stats?.totalUsers || "12,842",
         badge: "+12%",
         badgeColor: "text-emerald-700 bg-emerald-100",
         icon: <Users size={20} className="text-[#1a5d43]" />,
         progress: "w-[75%]",
         color: "bg-[#1a5d43]",
      },
      {
         label: t("adminDashboard.iotContainer"),
         value: container ? `${container.fillLevel}%` : "--",
         badge: container?.status === "ONLINE" ? t("status.online") : t("status.offline"),
         badgeColor: container?.status === "ONLINE" ? "text-emerald-700 bg-emerald-100" : "text-slate-500 bg-slate-100",
         icon: container?.status === "ONLINE" ? <Wifi size={20} className="text-[#1a5d43]" /> : <WifiOff size={20} className="text-slate-400" />,
         progress: `w-[${Math.min(container?.fillLevel || 0, 100)}%]`,
         color: (container?.fillLevel || 0) >= 85 ? "bg-rose-500" : "bg-[#1a5d43]",
      },
      {
         label: t("adminDashboard.farmers"),
         value: data?.stats?.farmers || "2,150",
         badge: "-2%",
         badgeColor: "text-rose-700 bg-rose-100",
         icon: <Tractor size={20} className="text-[#1a5d43]" />,
         progress: "w-[50%]",
         color: "bg-[#1a5d43]",
      },
      {
         label: t("adminDashboard.marketplaceProducts"),
         value: data?.stats?.marketplaceProducts || "8,902",
         badge: "+24%",
         badgeColor: "text-emerald-700 bg-emerald-100",
         icon: <ShoppingBag size={20} className="text-[#1a5d43]" />,
         progress: "w-[85%]",
         color: "bg-[#1a5d43]",
      }
   ];

   return (
      <AdminLayout title={t("admin.dashboard.title")}>
         {/* KPI Section */}
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {kpiData.map((kpi, idx) => (
               <div key={idx} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between h-[150px]">
                  <div className="flex justify-between items-start">
                     <div className="w-10 h-10 rounded-xl bg-[#f0fdf4] flex items-center justify-center">
                        {kpi.icon}
                     </div>
                     <span className={`text-xs font-bold px-2 py-1 rounded-full ${kpi.badgeColor}`}>
                        {kpi.badge}
                     </span>
                  </div>
                  <div>
                     <p className="text-xs text-slate-500 font-semibold mb-1">{kpi.label}</p>
                     <h3 className="text-3xl font-black text-slate-900 tracking-tight">{kpi.value}</h3>
                     <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className={`${kpi.color} h-full ${kpi.progress} rounded-full`}></div>
                     </div>
                  </div>
               </div>
            ))}
         </div>

         {/* Arduino Container Alert */}
         {container && container.fillLevel >= 85 && (
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-3xl p-5 flex items-center gap-4 animate-pulse">
               <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <ShieldAlert size={20} className="text-amber-700" />
               </div>
               <div>
                  <h4 className="text-amber-800 font-bold text-sm">{t("adminDashboard.alertFullTitle")}{container.fillLevel}%</h4>
                  <p className="text-amber-600 text-xs mt-1">
                     {t("adminDashboard.alertFullDesc")}
                  </p>
               </div>
            </div>
         )}

         {/* Live Arduino Smart Bin data — updates every 2 seconds */}
         <SmartBinLiveData />

      </AdminLayout>
   );
}

export default AdminDashboardPage;
