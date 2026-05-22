function WeatherCard({ weather, insights }) {
  if (!weather) return null;

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-brand-muted">Météo Ferme</p>
          <h3 className="mt-2 text-xl font-black text-brand-text">{weather.conditionLabel}</h3>
          <p className="mt-1 text-xs text-brand-muted">{weather.seasonLabel}</p>
        </div>
        <div className="text-end">
          <p className="text-3xl font-black text-brand-green">{weather.temperature}°</p>
          <p className="text-xs text-brand-muted">Humidité {weather.humidity}%</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-brand-muted">Pluie</p>
          <p className="mt-1 text-sm font-bold">{weather.rainChance}%</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[11px] uppercase tracking-[0.12em] text-brand-muted">Temp. Sol</p>
          <p className="mt-1 text-sm font-bold">{insights?.soilTemperature}°</p>
        </div>
      </div>
    </div>
  );
}

export default WeatherCard;
