function AlertCard({ alert }) {
  const tone =
    alert?.severity === "CRITICAL"
      ? "border-red-200 bg-red-50 text-red-900"
      : alert?.severity === "WARNING"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : "border-blue-200 bg-blue-50 text-blue-900";

  return (
    <div className={`rounded-2xl border p-3 ${tone}`}>
      <p className="text-xs font-bold uppercase tracking-[0.12em]">{alert?.severity || "INFO"}</p>
      <p className="mt-1 text-sm font-semibold">{alert?.title}</p>
      <p className="mt-1 text-xs opacity-90">{alert?.message}</p>
    </div>
  );
}

export default AlertCard;
