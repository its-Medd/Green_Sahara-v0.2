import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  ScanLine,
  ShoppingBag,
  Store,
  Trash2,
  UserRound
} from "lucide-react";

export const farmerMenu = [
  { label: "Tableau de bord", key: "nav.dashboard", to: "/farmer/dashboard", icon: LayoutDashboard },
  { label: "Marketplace", key: "nav.marketplace", to: "/farmer/marketplace", icon: Store },
  { label: "Commandes", key: "nav.orders", to: "/farmer/orders", icon: ShoppingBag },
  { label: "Profil", key: "nav.profile", to: "/farmer/profile", icon: UserRound }
];

export const providerMenu = [
  { label: "Tableau de bord", key: "nav.dashboard", to: "/provider/dashboard", icon: LayoutDashboard },
  { label: "Conteneurs", key: "nav.containers", to: "/provider/containers", icon: Trash2 },
  { label: "Profil", key: "nav.profile", to: "/provider/profile", icon: UserRound }
];

export const adminMenu = [
  { label: "Tableau de bord", key: "nav.dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Analyse AI", key: "nav.analysis", to: "/admin/analysis", icon: ScanLine },
  { label: "Statistiques", key: "nav.stats", to: "/admin/stats", icon: BarChart3 },
  { label: "Lots", key: "nav.lots", to: "/admin/lots", icon: Boxes }
];
