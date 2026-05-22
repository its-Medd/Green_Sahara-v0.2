import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FarmerLayout from "../../layouts/FarmerLayout";
import Skeleton from "../../components/Skeleton";
import { getFarmerDashboard } from "../../services/farmerService";
import { ShoppingBag, Leaf, Droplets, Thermometer, Zap, AlertTriangle, Bug, Package, Pencil, CalendarClock, MapPin, Sun } from "lucide-react";

function FarmerDashboardPage() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getFarmerDashboard().then((res) => setData(res.data)).catch(() => null);
  }, []);

  const alertIcons = {
    warning: <AlertTriangle size={20} className="text-red-500" />,
    bug: <Bug size={20} className="text-orange-500" />,
    package: <Package size={20} className="text-blue-500" />,
  };

  const getAlertIcon = (i) => {
    const icons = [
      <AlertTriangle size={20} className="text-red-500" />,
      <Bug size={20} className="text-orange-500" />,
      <Package size={20} className="text-blue-500" />
    ];
    return icons[i % icons.length];
  };

  const getAlertBg = (i) => ["bg-red-50", "bg-orange-50", "bg-blue-50"][i % 3];

  return (
    <FarmerLayout>
      {!data ? (
        <div className="grid md:grid-cols-3 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : (
        <>
          {/* Header row */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Espace Cultivateur</p>
              <h1 className="text-3xl font-black text-slate-900 mt-1">Bonjour, {data.profile?.farmName?.split(" ")[0] || "Agriculteur"}</h1>
            </div>
            {/* Orders KPI pill */}
            <div className="flex items-center gap-3 bg-[#eef2f6] rounded-2xl px-5 py-3 shadow-sm">
              <div className="w-9 h-9 bg-[#1a5d43] rounded-xl flex items-center justify-center shadow">
                <ShoppingBag size={18} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Commandes Actives</p>
                <p className="text-2xl font-black text-slate-900 leading-tight">{data.stats?.ordersCount ?? 0}</p>
              </div>
            </div>
          </div>

          {/* Main grid */}
          <div className="grid xl:grid-cols-[1.3fr_0.7fr] gap-5">
            {/* LEFT COLUMN */}
            <div className="space-y-5">
              {/* Farm Profile Card */}
              <div className="bg-white rounded-3xl p-7 shadow-sm border border-slate-100 relative">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 bg-[#f0fdf4] text-[#1a5d43] text-[10px] font-bold px-3 py-1 rounded-full border border-[#dcfce7] mb-3">
                      <Leaf size={10} />
                      PROFIL FERME
                    </span>
                    <h2 className="text-2xl font-black text-slate-900">{data.profile?.farmName || "Ma Ferme"}</h2>
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-1.5">
                      <MapPin size={13} className="text-slate-400 shrink-0" />
                      {data.profile?.city}{data.profile?.region && data.profile.region !== data.profile.city ? `, ${data.profile.region}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/farmer/profile")}
                    className="w-9 h-9 bg-slate-100 hover:bg-[#1a5d43] hover:text-white rounded-full flex items-center justify-center transition text-slate-500"
                  >
                    <Pencil size={15} strokeWidth={2.5} />
                  </button>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
                  {[
                    { label: "SURFACE", value: `${data.profile?.surfaceHectares || 0} ha` },
                    { label: "SAISON", value: data.insights?.currentSeason || "–" },
                    { label: "IRRIGATION", value: data.insights?.nextIrrigationDate || "–" },
                    { label: "RÉCOLTE", value: data.insights?.nextHarvestPeriod || "–" },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                      <p className="text-sm font-black text-slate-900">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom row: Cultures + Compost */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Cultures */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-bold text-slate-900">Cultures</h3>
                    <Leaf size={18} className="text-[#1a5d43]" />
                  </div>
                  <div className="space-y-3">
                    {(data.profile?.mainCrops || "Céréales, Légumineuses").split(",").slice(0, 3).map((crop, i) => {
                      const colors = ["bg-orange-100 text-orange-700", "bg-emerald-100 text-[#1a5d43]", "bg-blue-100 text-blue-700"];
                      const letter = crop.trim().charAt(0).toUpperCase();
                      return (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${colors[i % colors.length]}`}>{letter}</span>
                            <span className="text-sm font-semibold text-slate-800">{crop.trim()}</span>
                          </div>
                          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                            {Math.round((data.profile?.surfaceHectares || 12) / 2)} ha
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Moment Compost */}
                <div className="bg-[#1a5d43] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                  <div className="absolute -right-8 -bottom-8 opacity-10">
                    <Leaf size={120} />
                  </div>
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <h3 className="text-base font-bold">Moment Compost</h3>
                    <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                      <CalendarClock size={17} className="text-white" />
                    </div>
                  </div>
                  <p className="text-emerald-200 text-xs relative z-10">Prochain cycle dans</p>
                  <p className="text-4xl font-black mt-1 relative z-10">{data.insights?.compostTiming?.replace(/\D/g, "") || "10"} Jours</p>
                  <div className="border-t border-white/20 mt-4 pt-4 relative z-10">
                    <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest">Dose Conseillée</p>
                    <p className="text-xl font-black mt-1">{data.insights?.recommendedCompostQuantityKg || 0} kg</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-5">
              {/* Weather Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Météo Ferme</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      {data.profile?.city || "–"}{data.profile?.region ? `, ${data.profile.region}` : ""}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">EN DIRECT</span>
                </div>
                <div className="text-center my-4">
                  <div className="flex justify-center mb-3">
                    {data.weather?.icon
                      ? <span className="text-5xl">{data.weather.icon}</span>
                      : <Sun size={52} className="text-amber-400 drop-shadow-md" strokeWidth={1.5} />}
                  </div>
                  <p className="text-5xl font-black text-slate-900">{data.weather?.temperature ?? "32"}°C</p>
                  <p className="text-slate-500 text-sm mt-1 font-medium">{data.weather?.condition || "Ensoleillé – Désertique"}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-blue-50 rounded-2xl p-3 text-center">
                    <Droplets size={18} className="text-blue-500 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Humidité</p>
                    <p className="text-sm font-black text-slate-800 mt-1">{data.weather?.humidity ?? "28"}%</p>
                  </div>
                  <div className="bg-orange-50 rounded-2xl p-3 text-center">
                    <Thermometer size={18} className="text-orange-500 mx-auto mb-1" />
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Temp. Sol</p>
                    <p className="text-sm font-black text-slate-800 mt-1">{data.weather?.soilTemp ?? "29.5"}°C</p>
                  </div>
                </div>
              </div>

              {/* IA Advisor */}
              <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 opacity-10">
                  <Zap size={100} />
                </div>
                <div className="flex items-center gap-3 mb-3 relative z-10">
                  <div className="w-9 h-9 bg-[#1a5d43] rounded-xl flex items-center justify-center">
                    <Zap size={18} className="text-white" />
                  </div>
                  <h3 className="text-sm font-bold">IA Advisor</h3>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed relative z-10">
                  {data.insights?.advisorNote || "Les conditions de sol sont optimales pour l'épandage du compost."}
                </p>
                <button
                  onClick={() => navigate("/farmer/ai")}
                  className="mt-4 w-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2.5 rounded-xl transition relative z-10"
                >
                  Parler à l'expert agricole
                </button>
              </div>
            </div>
          </div>

          {/* Alerts section */}
          {(data.alerts || []).length > 0 && (
            <div className="mt-5 bg-white rounded-3xl p-7 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  🔔 Alertes Critiques
                </h3>
                <span className="text-xs text-slate-400 font-medium">Dernières 24h</span>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {data.alerts.slice(0, 3).map((alert, i) => (
                  <div key={i} className={`rounded-2xl p-4 flex items-start gap-3 ${getAlertBg(i)}`}>
                    <div className="mt-0.5 shrink-0">{getAlertIcon(i)}</div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{alert.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{alert.details || alert.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </FarmerLayout>
  );
}

export default FarmerDashboardPage;
