import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import AdminLayout from "../../layouts/AdminLayout";
import { Download, MoreVertical, Plus } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar
} from "recharts";
import { getAdminStats } from "../../services/adminService";

export default function AdminStatsPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await getAdminStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const CustomHeader = (
    <div className="flex flex-wrap justify-between items-end gap-4 mb-4">
      <div>
        <h1 className="text-4xl font-black text-[#1a5d43] tracking-tight">{t("adminStats.title")}</h1>
        <p className="text-slate-600 text-sm mt-3 max-w-2xl font-medium">
          {t("adminStats.subtitle")}
        </p>
      </div>
      <button className="bg-[#1a5d43] hover:bg-[#154934] text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition shadow-md shadow-emerald-900/10" onClick={() => window.print()}>
        <Download size={18} />
        {t("adminStats.exportPdf")}
      </button>
    </div>
  );

  const totalRevenue = stats?.sales?.reduce((sum, item) => sum + item.revenue, 0) || 0;
  const totalCompost = stats?.compost?.reduce((sum, item) => sum + item.volume, 0) || 0;

  return (
    <AdminLayout showSearch={true} headerContent={CustomHeader}>
      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* LETS COLUMN KPIs */}
        <div className="w-full xl:w-[280px] flex flex-col gap-4">
           {/* Total Revenus */}
           <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
              <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">{t("adminStats.totalRevenue")}</p>
              <div className="mt-4 flex items-end gap-3">
                 <span className="text-3xl font-black text-[#1a5d43]">{totalRevenue > 0 ? totalRevenue.toLocaleString('fr-FR') + ' ' + t("common.mad") : '42.8 M€'}</span>
                 <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full mb-1 flex items-center gap-1">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                    +12%
                 </span>
              </div>
           </div>

           {/* Production Compost */}
           <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
              <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">{t("adminStats.compostProd")}</p>
              <div className="mt-4 flex items-end gap-3">
                 <span className="text-3xl font-black text-[#1a5d43]">{totalCompost > 0 ? totalCompost.toLocaleString('fr-FR') + ' ' + t("common.kg") : '0 ' + t("common.kg")}</span>
              </div>
           </div>

           {/* Déchets Traités (Static) */}
           <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
              <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">{t("adminStats.treatedWaste")}</p>
              <div className="mt-4 flex items-end gap-3">
                 <span className="text-3xl font-black text-[#1a5d43]">850T</span>
                 <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full mb-1 flex items-center gap-1">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                    +8.4%
                 </span>
              </div>
           </div>

           {/* Economie Circulaire (Dark Card) */}
           <div className="bg-[#24674a] rounded-3xl p-6 relative overflow-hidden shadow-lg shadow-emerald-900/10 flex-1 flex flex-col justify-center min-h-[160px]">
              <div className="absolute -bottom-8 -right-8 opacity-10">
                 <svg width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12c0 6-4.39 10-9.806 10C7.792 22 4.24 19.665 3 16"></path><path d="M2 12c0-6 4.39-10 9.806-10C16.208 2 19.76 4.335 21 8"></path><path d="M7 16H3v4"></path><path d="M17 8h4V4"></path></svg>
              </div>
              <p className="text-[#a7f3d0] text-[10px] font-bold tracking-wider uppercase relative z-10">{t("adminStats.circularEconomy")}</p>
              <div className="mt-4 relative z-10">
                 <h3 className="text-5xl font-black text-white">94%</h3>
                 <p className="text-emerald-50 text-xs font-medium mt-3 leading-relaxed pr-4">
                    {t("adminStats.valRate")}
                 </p>
              </div>
           </div>
        </div>

        {/* RIGHT COLUMN MAIN CONTENT */}
        <div className="flex-1 flex flex-col gap-6">
           
           {/* Chart Section */}
           <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="flex justify-between items-start mb-8 relative z-10">
                 <div>
                    <h3 className="text-xl font-bold text-slate-900">{t("adminStats.salesTitle")}</h3>
                    <p className="text-xs text-slate-500 mt-1">{t("adminStats.salesSub")}</p>
                 </div>
                 <div className="flex gap-2">
                    <span className="bg-[#f0fdf4] text-[#1a5d43] px-3 py-1 rounded-xl text-xs font-bold">2023</span>
                    <span className="bg-slate-100 text-slate-400 px-3 py-1 rounded-xl text-xs font-bold">2022</span>
                 </div>
              </div>
              
              <div className="h-[280px] w-full mt-4 -ml-4">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={
                       stats?.sales?.length ? stats.sales : [
                          {month: 'JAN', revenue: 2}, {month: 'FÉV', revenue: 3}, {month: 'MAR', revenue: 4.5}, 
                          {month: 'AVR', revenue: 3.5}, {month: 'MAI', revenue: 9}, {month: 'JUIN', revenue: 12.4},
                          {month: 'JUIL', revenue: 4}, {month: 'AOÛT', revenue: 11}
                       ]
                    }>
                       <XAxis 
                          dataKey="month" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}} 
                          dy={10}
                       />
                       <Tooltip 
                          cursor={{stroke: '#e2e8f0', strokeWidth: 2, strokeDasharray: '4 4'}}
                          content={({ active, payload }) => {
                             if (active && payload && payload.length) {
                                return (
                                   <div className="bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xl">
                                      {payload[0].payload.month}: {payload[0].value}M€
                                   </div>
                                );
                             }
                             return null;
                          }}
                       />
                       <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#1a5d43" 
                          strokeWidth={6} 
                          dot={false}
                          activeDot={{ r: 8, fill: '#1a5d43', stroke: '#fff', strokeWidth: 3 }} 
                       />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Bottom row sections */}
           <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-6">
              
              {/* Valorisation Déchets */}
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
                 <div className="flex justify-between items-start mb-8">
                    <div>
                       <h3 className="text-lg font-bold text-slate-900">{t("adminStats.wasteVal")}</h3>
                       <p className="text-xs text-slate-500 mt-1">{t("adminStats.wasteSub")}</p>
                    </div>
                    <MoreVertical size={20} className="text-slate-400 cursor-pointer" />
                 </div>

                 <div className="space-y-6">
                    {[
                       { label: t("adminStats.plastics"), value: 342, bg: "bg-[#1f5c40]", track: "bg-[#eef2f6]", width: "w-[75%]" },
                       { label: t("adminStats.glass"), value: 218, bg: "bg-[#337a5b]", track: "bg-[#eef2f6]", width: "w-[50%]" },
                       { label: t("adminStats.metals"), value: 156, bg: "bg-[#438b6d]", track: "bg-[#eef2f6]", width: "w-[40%]" },
                       { label: t("adminStats.paper"), value: 134, bg: "bg-[#8fbca8]", track: "bg-[#eef2f6]", width: "w-[30%]" }
                    ].map((item, idx) => (
                       <div key={idx}>
                          <div className="flex justify-between items-center mb-2">
                             <span className="text-xs font-bold text-slate-800">{item.label}</span>
                             <span className="text-xs font-bold text-[#1a5d43]">{item.value} {t("common.tons")}</span>
                          </div>
                          <div className={`w-full ${item.track} rounded-full h-2`}>
                             <div className={`${item.bg} h-full rounded-full ${item.width}`}></div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Impact Écologique / Production Compost Chart */}
              <div className="bg-[#eef2f6] rounded-[32px] p-8 relative flex flex-col justify-between">
                 <div>
                    <h3 className="text-lg font-bold text-slate-900">{t("adminStats.compostTitle")}</h3>
                    <p className="text-xs text-slate-500 mt-1">{t("adminStats.compostSub")}</p>
                 </div>
                 
                 <div className="h-[180px] w-full mt-6 -ml-4 flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={stats?.compost || []}>
                          <XAxis 
                             dataKey="month" 
                             axisLine={false} 
                             tickLine={false} 
                             tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}} 
                             dy={10}
                          />
                          <Tooltip 
                             cursor={{fill: '#e2e8f0'}}
                             content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                   return (
                                      <div className="bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xl">
                                         {payload[0].payload.month}: {payload[0].value} {t("common.kg")}
                                      </div>
                                   );
                                }
                                return null;
                             }}
                          />
                          <Bar dataKey="volume" fill="#1a5d43" radius={[4, 4, 0, 0]} />
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>

           </div>
        </div>

      </div>
    </AdminLayout>
  );
}
