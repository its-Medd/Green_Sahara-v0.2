/**
 * SmartBinLiveData.jsx
 * --------------------
 * A live-updating dashboard card that displays Arduino sensor readings.
 *
 * - Polls GET /api/arduino/latest every 2 seconds
 * - Shows temperature, humidity, distance, fill %, water level, and status
 * - Color-coded status: NORMAL=green, WARNING=amber, DANGER=red
 * - Gracefully shows a "not connected" state when Arduino is offline
 */

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Thermometer, Droplets, Ruler, Gauge, Waves, Wifi, WifiOff } from "lucide-react";
import apiClient from "../services/apiClient";

// ─── Status configuration ─────────────────────────────────────────────────────
const getStatusConfig = (t) => ({
  NORMAL: {
    label: t("smartBin.statusNormal"),
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
    icon: "text-emerald-600",
  },
  WARNING: {
    label: t("smartBin.statusWarning"),
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
    icon: "text-amber-600",
  },
  DANGER: {
    label: t("smartBin.statusDanger"),
    bg: "bg-rose-50",
    border: "border-rose-200",
    badge: "bg-rose-100 text-rose-700",
    dot: "bg-rose-500",
    bar: "bg-rose-500",
    icon: "text-rose-600",
  },
});

// ─── Smart Bin 3D-like Model ──────────────────────────────────────────────────
function SmartBinModel({ fillPercent = 0, isOffline, t }) {
  const height = isOffline ? 0 : Math.min(Math.max(fillPercent, 0), 100);

  let fillGradient = "from-emerald-400 to-emerald-500";
  let dropColor = "bg-emerald-400";
  if (height > 75) {
    fillGradient = "from-amber-400 to-amber-500";
    dropColor = "bg-amber-400";
  }
  if (height > 90) {
    fillGradient = "from-rose-500 to-rose-600";
    dropColor = "bg-rose-500";
  }
  if (isOffline) {
    fillGradient = "from-slate-200 to-slate-300";
    dropColor = "bg-slate-300";
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col items-center justify-center h-full min-h-[320px] relative overflow-hidden group">
      {/* Background decorative glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-[60px] opacity-10 transition-colors duration-1000 ${dropColor}`} />

      <div className="relative w-32 h-48 mt-2 z-10 transition-transform duration-500 group-hover:scale-105">
        {/* Bin Lid */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[115%] h-3.5 bg-slate-800 rounded-t-lg shadow-lg z-20 flex justify-center">
          <div className="w-10 h-2 bg-slate-600 rounded-t-md -mt-2" />
        </div>

        {/* Bin Body (Glass Effect) */}
        <div className="w-full h-full bg-slate-50/40 backdrop-blur-md border-[3px] border-slate-800 rounded-b-2xl overflow-hidden relative shadow-[inset_0_0_15px_rgba(0,0,0,0.1)]">

          {/* Trash content / Liquid Fill */}
          <div
            className={`absolute bottom-0 left-0 w-full bg-gradient-to-t ${fillGradient} transition-all duration-1000 ease-out`}
            style={{ height: `${height}%` }}
          >
            {/* Surface texture/wave */}
            {height > 0 && !isOffline && (
              <div className="absolute top-0 left-0 w-full h-2 bg-white/30 backdrop-blur-sm shadow-[0_2px_10px_rgba(255,255,255,0.5)]" />
            )}
            {/* Small bubbles or trash blocks pattern */}
            <div className="w-full h-full opacity-10 bg-[radial-gradient(circle,black_2px,transparent_2px)] bg-[size:12px_12px]" />
          </div>

          {/* Glass reflection highlight */}
          <div className="absolute top-0 left-2 w-6 h-full bg-gradient-to-r from-white/60 to-transparent blur-[1px] transform -skew-x-12 pointer-events-none" />
        </div>
      </div>

      <div className="mt-8 text-center z-10">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {isOffline ? t("status.offline") : t("smartBin.fill")}
        </span>
        <div className="text-3xl font-black text-slate-800 mt-1 flex items-baseline justify-center gap-1">
          {isOffline ? (
            <span className="text-xl">{t("smartBin.offline")}</span>
          ) : (
            <>
              {height}
              <span className="text-xl text-slate-400">%</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Individual metric card ───────────────────────────────────────────────────
function MetricCard({ icon: Icon, label, value, unit, barPercent, barColor }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-slate-400" />
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="flex items-end gap-1">
        <span className="text-2xl font-black text-slate-900 leading-none">{value}</span>
        <span className="text-xs text-slate-400 mb-0.5 font-medium">{unit}</span>
      </div>
      {/* Progress bar */}
      <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden mt-1">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${Math.min(Math.max(barPercent, 0), 100)}%` }}
        />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function SmartBinLiveData() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);       // Latest Arduino reading
  const [loading, setLoading] = useState(true); // Initial loading state
  const [error, setError] = useState(false);    // Connection error state

  const STATUS_CONFIG = getStatusConfig(t);

  // Poll the backend every 2 seconds for the latest Arduino reading
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const response = await apiClient.get("/arduino/latest");
        setData(response.data.data); // null if Arduino not connected
        setError(false);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchLatest(); // First fetch immediately
    const interval = setInterval(fetchLatest, 2000); // Then every 2 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const status = data ? STATUS_CONFIG[data.status] || STATUS_CONFIG.NORMAL : null;

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-48 bg-slate-200 rounded-lg animate-pulse" />
        </div>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-[30%] shrink-0">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-pulse h-[320px]" />
          </div>
          <div className="w-full lg:w-[70%] flex flex-col gap-4">
            <div className="bg-slate-100 rounded-3xl p-8 border border-slate-200 animate-pulse h-24" />
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 animate-pulse h-24" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Not connected state ──────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-bold text-slate-800 mb-4">{t("smartBin.title")}</h3>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Model Offline */}
          <div className="w-full lg:w-[30%] shrink-0">
            <SmartBinModel fillPercent={0} isOffline={true} t={t} />
          </div>

          {/* Right: Offline Message */}
          <div className="w-full lg:w-[70%]">
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 flex items-center gap-4 h-full min-h-[320px]">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                <WifiOff size={28} className="text-slate-400" />
              </div>
              <div>
                <p className="text-slate-800 font-bold text-lg mb-1">{t("smartBin.disconnectedTitle")}</p>
                <p className="text-slate-500 text-sm leading-relaxed max-w-md">
                  {t("smartBin.disconnectedDesc")}
                </p>
              </div>
              <div className="ml-auto flex self-start">
                <span className="text-xs font-bold bg-slate-200 text-slate-500 px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                  {t("smartBin.offline")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Live data display ────────────────────────────────────────────────────
  return (
    <div className="mt-8">
      {/* Section header with live status badge */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-slate-800">{t("smartBin.title")}</h3>
        <div className="flex items-center gap-2">
          {/* Pulsing green dot = live */}
          <span className={`relative flex h-2.5 w-2.5`}>
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status.dot}`} />
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${status.dot}`} />
          </span>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {t("smartBin.live")}
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* LEFT: Container Model */}
        <div className="w-full lg:w-[30%] shrink-0">
          <SmartBinModel fillPercent={data.fill_percent} isOffline={false} t={t} />
        </div>

        {/* RIGHT: Stats and Metrics */}
        <div className="w-full lg:w-[70%] flex flex-col gap-4">

          {/* Status banner */}
          <div className={`rounded-3xl p-5 md:p-6 border flex items-center gap-4 md:gap-6 shadow-sm transition-colors duration-500 ${status.bg} ${status.border}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-white shadow-sm ${status.icon}`}>
              <Wifi size={24} />
            </div>
            <div className="flex-1">
              <p className="text-sm md:text-base font-bold text-slate-800 mb-1">
                {t("smartBin.statusLabel")}{" "}
                <span className={`ml-2 px-3 py-1 rounded-full text-xs font-black shadow-sm ${status.badge}`}>
                  {status.label}
                </span>
              </p>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {t("smartBin.lastUpdate")} {new Date(data.receivedAt).toLocaleTimeString("fr-FR")}
              </p>
            </div>
            {/* Fill level big number (Secondary location for quick view) */}
            <div className="text-right hidden sm:block bg-white/60 p-3 rounded-2xl backdrop-blur-sm">
              <span className="text-2xl font-black text-slate-900">{data.fill_percent}</span>
              <span className="text-slate-500 text-sm font-bold">%</span>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{t("smartBin.fill")}</p>
            </div>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
            <MetricCard
              icon={Thermometer}
              label={t("smartBin.temp")}
              value={data.temperature}
              unit="°C"
              barPercent={(data.temperature / 60) * 100}
              barColor={data.temperature > 40 ? "bg-rose-500" : status.bar}
            />
            <MetricCard
              icon={Droplets}
              label={t("smartBin.humidity")}
              value={data.humidity}
              unit="%"
              barPercent={data.humidity}
              barColor={status.bar}
            />
            <MetricCard
              icon={Ruler}
              label={t("smartBin.distance")}
              value={data.distance_cm}
              unit="cm"
              barPercent={100 - data.fill_percent}
              barColor="bg-slate-400"
            />
            <MetricCard
              icon={Gauge}
              label={t("smartBin.fill")}
              value={data.fill_percent}
              unit="%"
              barPercent={data.fill_percent}
              barColor={status.bar}
            />
            <MetricCard
              icon={Waves}
              label={t("smartBin.water")}
              value={data.water_percent}
              unit="%"
              barPercent={data.water_percent}
              barColor="bg-blue-400"
            />
          </div>

        </div>
      </div>
    </div>
  );
}

