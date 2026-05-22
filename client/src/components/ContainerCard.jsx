function ContainerCard({ container, onRequest }) {
  return (
    <div className="card p-3.5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm">{container.name}</h3>
        <span className="text-xs px-2 py-1 rounded-full bg-slate-100">{container.status}</span>
      </div>
      <p className="text-xs text-brand-muted mt-1">{container.location}</p>
      <p className="mt-2 text-2xl font-black">{container.fillLevel}%</p>
      <div className="mt-1 h-2 rounded-full bg-slate-200">
        <div className="h-2 rounded-full bg-brand-green" style={{ width: `${container.fillLevel}%` }} />
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-brand-muted">
        <span>{container.capacityLiters} L</span>
        <span>{container.alertsCount} alertes</span>
      </div>
      <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-brand-muted space-y-1">
        <p>ETA: {container.transport?.etaMinutes || 0} min</p>
        <p>Statut transport: {container.transport?.transportStatus || "WAITING"}</p>
        <p>Camion: {container.transport?.assignedTruck || "-"}</p>
      </div>
      <button
        className="btn-primary w-full text-xs mt-3 disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={() => onRequest?.(container)}
        disabled={!onRequest}
      >
        {onRequest ? "Demander collecte" : "Suivi transport"}
      </button>
    </div>
  );
}

export default ContainerCard;
