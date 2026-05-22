function StatCard({ label, value, suffix, accent = false }) {
  return (
    <div className="card p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-brand-muted">{label}</p>
      <p className={`mt-2 text-3xl font-black ${accent ? "text-brand-green" : "text-brand-text"}`}>
        {value}
        {suffix ? <span className="text-base font-semibold ms-1">{suffix}</span> : null}
      </p>
    </div>
  );
}

export default StatCard;

