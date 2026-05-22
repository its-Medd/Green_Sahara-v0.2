function ImpactCard({ data }) {
  return (
    <div className="rounded-2xl bg-brand-navy text-white p-4">
      <p className="text-xs uppercase tracking-[0.12em] text-slate-300">Impact</p>
      <p className="text-3xl font-black text-brand-green mt-2">{data?.co2Saved || 0}</p>
      <p className="text-xs text-slate-300">CO2 évité</p>
      <p className="text-sm mt-3">Arbres: {data?.treesEquivalent || 0}</p>
      <p className="text-sm">Performance: {data?.performanceRate || 0}%</p>
    </div>
  );
}

export default ImpactCard;

