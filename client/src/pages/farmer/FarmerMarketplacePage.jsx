import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FarmerLayout from "../../layouts/FarmerLayout";
import EmptyState from "../../components/EmptyState";
import { createFarmerOrder, getFarmerProducts, validateCartItem } from "../../services/farmerService";
import { useCartStore } from "../../store/useCartStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useToast } from "../../hooks/useToast";
import { ShoppingCart, Filter, Sliders, Zap, TrendingUp, TrendingDown, Minus } from "lucide-react";

function FarmerMarketplacePage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [filters, setFilters] = useState({ search: "", quality: "" });
  const [quantities, setQuantities] = useState({});
  const [searchParams] = useSearchParams();
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const language = useAuthStore((state) => state.language);
  const { toast } = useToast();
  const navigate = useNavigate();
  const cartRef = useRef(null);

  const loadData = async (page = 1) => {
    const response = await getFarmerProducts({ page, limit: 6, ...filters });
    setProducts(response.data.items);
    setPagination(response.data.pagination);
  };

  useEffect(() => {
    loadData().catch(() => null);
  }, []);

  useEffect(() => {
    if (searchParams.get("panel") === "cart" && cartRef.current) {
      cartRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [searchParams]);

  const getQty = (id) => quantities[id] || 50;
  const setQty = (id, val) => setQuantities((prev) => ({ ...prev, [id]: Math.max(1, Number(val)) }));

  const addToCart = async (product) => {
    await validateCartItem(product.id);
    addItem(product, getQty(product.id));
    toast({ title: "Panier", message: "Produit ajouté au panier", type: "success" });
  };

  const createOrder = async () => {
    if (!cartItems.length) return;
    await createFarmerOrder(cartItems.map((item) => ({ productId: item.id, quantity: item.quantity })));
    clearCart();
    toast({ title: "Commandes", message: "Commande confirmée avec succès", type: "success" });
  };

  const total = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  const getBadgeStyle = (q) => {
    if (q === "PREMIUM") return "bg-[#1a5d43] text-white";
    if (q === "STANDARD") return "bg-slate-800 text-white";
    return "bg-emerald-100 text-[#1a5d43]";
  };

  const getStockColor = (stock) => {
    if (stock > 500) return "text-[#1a5d43]";
    if (stock > 100) return "text-orange-500";
    return "text-red-500";
  };

  const getStockDot = (stock) => {
    if (stock > 500) return "bg-[#1a5d43]";
    if (stock > 100) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <FarmerLayout>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-[#1a5d43]">Marketplace Durable</h1>
        <p className="text-slate-500 text-sm mt-1 font-medium">Trouvez les meilleurs amendements organiques pour vos sols.</p>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 mb-6">
        <select
          className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#1a5d43]/20 cursor-pointer"
          value={filters.quality}
          onChange={(e) => setFilters((s) => ({ ...s, quality: e.target.value }))}
        >
          <option value="">Qualité : Toutes</option>
          <option value="STANDARD">Standard</option>
          <option value="PREMIUM">Premium</option>
        </select>
        <button
          onClick={() => loadData(1)}
          className="bg-[#1a5d43] hover:bg-[#154934] text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition"
        >
          <Filter size={15} /> Filtrer
        </button>
      </div>

      <div className="grid xl:grid-cols-[1fr_360px] gap-6">
        {/* Products Grid */}
        <div>
          {products.length === 0 ? (
            <EmptyState label={t("farmer.marketplace.noProduct")} />
          ) : (
            <div className="grid sm:grid-cols-2 gap-5">
              {products.map((product) => {
                const name = language === "ar" ? product.titleAr : product.titleFr;
                const desc = language === "ar" ? product.descriptionAr : product.descriptionFr;
                return (
                  <div key={product.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    {/* Product image */}
                    <div className="relative h-[160px] bg-slate-100 overflow-hidden">
                      <img
                        src={product.imageUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${product.id}`}
                        alt={name}
                        className="w-full h-full object-cover"
                      />
                      <span className={`absolute top-3 left-3 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${getBadgeStyle(product.qualityLevel)}`}>
                        {product.qualityLevel === "PREMIUM" ? "Bio Premium" : product.qualityLevel?.toLowerCase() || "Standard"}
                      </span>
                    </div>

                    <div className="p-5">
                      {/* Name + Price */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-black text-slate-900 leading-snug">{name}</h3>
                        <div className="text-right shrink-0">
                          <p className="text-xl font-black text-slate-900">{Number(product.price).toFixed(0)}</p>
                          <p className="text-[10px] text-slate-500 font-bold">MAD</p>
                        </div>
                      </div>

                      {/* Stock */}
                      <p className="text-xs mt-2 font-semibold flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${getStockDot(product.stock)}`}></span>
                        <span className={`${getStockColor(product.stock)}`}>
                          Stock: {Number(product.stock).toLocaleString("fr-FR")} {product.qualityLevel === "PREMIUM" ? "l" : "kg"} disponible
                        </span>
                      </p>

                      {/* Quantity stepper */}
                      <div className="flex items-center gap-3 mt-4 bg-slate-50 rounded-2xl px-4 py-2.5">
                        <button
                          onClick={() => setQty(product.id, getQty(product.id) - 10)}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition font-bold text-lg"
                        >–</button>
                        <span className="text-sm font-bold text-slate-800 flex-1 text-center">
                          {getQty(product.id)} {product.qualityLevel === "PREMIUM" ? "l" : "kg"}
                        </span>
                        <button
                          onClick={() => setQty(product.id, getQty(product.id) + 10)}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition font-bold text-lg"
                        >+</button>
                      </div>

                      {/* Add to cart */}
                      <button
                        onClick={() => addToCart(product)}
                        className="mt-3 w-full bg-[#f0fdf4] hover:bg-[#dcfce7] text-[#1a5d43] py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition border border-[#dcfce7]"
                      >
                        <ShoppingCart size={15} /> Ajouter au panier
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex gap-2 mt-5">
              <button
                className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 disabled:opacity-40 transition"
                onClick={() => loadData(Math.max(1, pagination.page - 1))}
                disabled={pagination.page <= 1}
              >Précédent</button>
              <button
                className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 disabled:opacity-40 transition"
                onClick={() => loadData(Math.min(pagination.pages, pagination.page + 1))}
                disabled={pagination.page >= pagination.pages}
              >Suivant</button>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-5" ref={cartRef}>
          {/* Cart */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Panier</h3>
              <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">
                {cartItems.length} ITEMS
              </span>
            </div>

            {cartItems.length === 0 ? (
              <div className="py-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                  <ShoppingCart size={24} className="text-slate-400" />
                </div>
                <p className="text-sm font-bold text-slate-600">Votre panier est vide</p>
                <p className="text-xs text-slate-400 mt-1 max-w-[180px]">Ajoutez des produits pour commencer votre commande durable.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-2 py-2 border-b border-slate-100">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{language === "ar" ? item.titleAr : item.titleFr}</p>
                      <p className="text-xs text-slate-400">{item.quantity} kg × {Number(item.price).toFixed(2)} MAD</p>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 text-xs font-bold shrink-0 transition">✕</button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-600 font-semibold">Total Estimé</p>
                <p className="text-lg font-black text-slate-900">{total.toFixed(2)} MAD</p>
              </div>
              <button
                onClick={createOrder}
                disabled={!cartItems.length}
                className="w-full bg-[#1a5d43] hover:bg-[#154934] disabled:bg-slate-200 disabled:text-slate-400 text-white py-3.5 rounded-2xl text-sm font-bold transition"
              >
                Passer la commande
              </button>
            </div>
          </div>

        </div>
      </div>
    </FarmerLayout>
  );
}

export default FarmerMarketplacePage;
