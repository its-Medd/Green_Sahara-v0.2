import { useEffect, useState } from "react";
import FarmerLayout from "../../layouts/FarmerLayout";
import OrderTable from "../../components/OrderTable";
import EmptyState from "../../components/EmptyState";
import { getFarmerOrders } from "../../services/farmerService";

function FarmerOrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    getFarmerOrders().then((response) => setOrders(response.data)).catch(() => null);
  }, []);

  return (
    <FarmerLayout title="Commandes" subtitle="Historique, statuts et détails de livraison">
      {orders.length ? <OrderTable orders={orders} /> : <EmptyState label="Aucune commande pour le moment." />}
    </FarmerLayout>
  );
}

export default FarmerOrdersPage;
