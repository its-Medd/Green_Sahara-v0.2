import { useState } from "react";
import { useTranslation } from "react-i18next";

function ProductCard({ product, language, onAdd }) {
  const { t } = useTranslation();
  const [qty, setQty] = useState(1);

  return (
    <article className="card overflow-hidden">
      <img src={product.imageUrl} alt={product.titleFr} className="h-36 w-full object-cover" />
      <div className="p-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold">{language === "ar" ? product.titleAr : product.titleFr}</h3>
          <span className="text-[10px] px-2 py-1 rounded-full bg-slate-100 font-semibold">{product.qualityLevel}</span>
        </div>
        <p className="text-xs text-brand-muted mt-1 line-clamp-2">
          {language === "ar" ? product.descriptionAr : product.descriptionFr}
        </p>
        <p className="text-[11px] text-brand-muted mt-2">Stock: {product.stock}</p>
        
        <div className="mt-3 flex items-center gap-2">
          <label className="text-[10px] font-bold text-brand-muted uppercase">Quantité:</label>
          <input 
            type="number" 
            min="1" 
            max={product.stock}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Math.min(product.stock, Number(e.target.value))))}
            className="input py-1 px-2 text-xs w-20"
          />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="font-bold text-brand-green text-sm">{Number(product.price).toFixed(2)} MAD</p>
          <button 
            className="btn-primary text-xs px-3 py-1.5" 
            onClick={() => onAdd(product, qty)}
            disabled={product.stock <= 0}
          >
            {t("actions.addToCart")}
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
