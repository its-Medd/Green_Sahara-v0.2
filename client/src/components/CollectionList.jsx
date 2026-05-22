import EmptyState from "./EmptyState";

function CollectionList({ items = [] }) {
  return (
    <div className="card p-3.5">
      <h3 className="font-bold text-sm mb-2">Collectes</h3>
      {items.length === 0 ? (
        <EmptyState label="Aucune collecte pour le moment" />
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-100 p-2.5 text-xs">
              <div className="flex justify-between">
                <p className="font-semibold">{item.city}</p>
                <span className="font-semibold">{item.fillPercentage}%</span>
              </div>
              <p className="text-brand-muted mt-1">{item.priority} · {item.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CollectionList;
