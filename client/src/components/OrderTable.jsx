function OrderTable({ orders = [] }) {
  return (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th className="text-start px-3 py-2">ID</th>
            <th className="text-start px-3 py-2">Date</th>
            <th className="text-start px-3 py-2">Détails</th>
            <th className="text-start px-3 py-2">Montant</th>
            <th className="text-start px-3 py-2">Statut</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-t border-slate-100">
              <td className="px-3 py-2">{order.id}</td>
              <td className="px-3 py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
              <td className="px-3 py-2">
                <div className="text-xs text-brand-muted">
                  {(order.items || []).map((item) => item.product?.titleFr).filter(Boolean).join(", ") || "-"}
                </div>
              </td>
              <td className="px-3 py-2">{Number(order.totalAmount).toFixed(2)} MAD</td>
              <td className="px-3 py-2">
                <span className="px-2 py-1 rounded-full text-xs bg-brand-greenSoft">{order.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OrderTable;
