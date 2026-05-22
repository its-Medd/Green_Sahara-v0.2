function TransportStatusCard({ item }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-brand-text">{item?.assignedTruck || "Transport"}</p>
          <p className="text-xs text-brand-muted">{item?.container?.name || item?.note || "-"}</p>
        </div>
        <span className="rounded-full bg-brand-greenSoft px-2 py-1 text-[11px] font-semibold text-brand-text">
          {item?.transportStatus || "WAITING"}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-brand-muted">
        <span>ETA {item?.etaMinutes || 0} min</span>
        <span>{item?.updatedAt ? new Date(item.updatedAt).toLocaleString() : "-"}</span>
      </div>
    </div>
  );
}

export default TransportStatusCard;
