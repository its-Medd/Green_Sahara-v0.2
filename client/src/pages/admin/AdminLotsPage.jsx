import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { useTranslation } from "react-i18next";
import {
  createAdminLot,
  deleteAdminLot,
  getAdminLots,
  updateAdminLot
} from "../../services/adminService";
import { useToast } from "../../hooks/useToast";
import { Plus, Filter, Grid, Link as LinkIcon, Edit2, Trash2, Download, X } from "lucide-react";

const initialForm = {
  titleFr: "",
  titleAr: "",
  descriptionFr: "",
  descriptionAr: "",
  price: "",
  stock: "",
  qualityLevel: "STANDARD",
  imageUrl: "",
  isActive: true
};

export default function AdminLotsPage() {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const { toast } = useToast();

  const loadItems = async () => {
    const response = await getAdminLots();
    setItems(response.data);
  };

  useEffect(() => {
    loadItems().catch(() => null);
  }, []);

  const submit = async () => {
    const payload = {
      ...form,
      price: Number(form.price || 0),
      stock: Number(form.stock || 0)
    };

    if (editingId) {
      await updateAdminLot(editingId, payload);
      toast({ title: t("lots.toastUpdated"), message: t("lots.toastUpdated"), type: "success" });
    } else {
      await createAdminLot(payload);
      toast({ title: t("lots.toastCreated"), message: t("lots.toastCreated"), type: "success" });
    }

    setEditingId(null);
    setForm(initialForm);
    loadItems();
  };

  const onEdit = (item) => {
    setIsFormVisible(true);
    setEditingId(item.id);
    setForm({
      titleFr: item.titleFr || "",
      titleAr: item.titleAr || "",
      descriptionFr: item.descriptionFr || "",
      descriptionAr: item.descriptionAr || "",
      price: item.price || "",
      stock: item.stock || "",
      qualityLevel: item.qualityLevel || "STANDARD",
      imageUrl: item.imageUrl || "",
      isActive: item.isActive
    });
  };

  const onDelete = async (id) => {
    await deleteAdminLot(id);
    toast({ title: t("lots.toastDeleted"), message: t("lots.toastDeleted"), type: "success" });
    if (editingId === id) {
      setEditingId(null);
      setForm(initialForm);
      setIsFormVisible(false);
    }
    loadItems();
  };

  const valeurStock = items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.stock || 0)), 0);
  const unitesTotales = items.reduce((sum, item) => sum + Number(item.stock || 0), 0);
  const produitsActifs = items.filter((i) => i.isActive).length;

  const CustomHeader = (
    <div className="mb-6">
      <h1 className="text-4xl font-black text-[#1a5d43] tracking-tight">{t("adminLots.title")}</h1>
      <p className="text-slate-600 text-sm mt-3 max-w-2xl font-medium">
        {t("adminLots.subtitle")}
      </p>
    </div>
  );

  return (
    <AdminLayout showSearch={false} headerContent={CustomHeader}>
      <div className="flex flex-col xl:flex-row gap-8 pb-32">
        
        {/* LEFT COLUMN: CREATE/EDIT FORM */}
        {isFormVisible && (
        <div className="w-full xl:w-[350px] shrink-0 animate-in slide-in-from-left duration-300 relative z-10">
           <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-10 h-10 bg-[#a7f3d0] text-[#1a5d43] rounded-xl flex items-center justify-center shadow-inner">
                    <Plus size={20} strokeWidth={3} />
                 </div>
                 <h2 className="text-lg font-bold text-slate-900">
                    {editingId ? t("adminLots.editLot") : t("adminLots.createProduct")}
                 </h2>
              </div>

              <div className="space-y-5">
                 <div className="grid grid-cols-2 gap-3">
                    <div>
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 mb-1.5 block">{t("adminLots.titleFr")}</label>
                       <input className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-4 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#1a5d43]/20 transition" placeholder="ex: Amendement..." value={form.titleFr} onChange={(e) => setForm({ ...form, titleFr: e.target.value })} />
                    </div>
                    <div dir="rtl">
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1 mb-1.5 block text-right">{t("adminLots.titleAr")}</label>
                       <input className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-4 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#1a5d43]/20 transition" placeholder="اسم المنتج..." value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} />
                    </div>
                 </div>

                 <div>
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 mb-1.5 block">{t("adminLots.descFr")}</label>
                     <textarea className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-4 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#1a5d43]/20 transition min-h-[100px] resize-none" placeholder="Détails du produit..." value={form.descriptionFr} onChange={(e) => setForm({ ...form, descriptionFr: e.target.value })} />
                 </div>

                 <div className="grid grid-cols-3 gap-2">
                    <div>
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 mb-1.5 block">{t("adminLots.price")}</label>
                       <input type="number" step="0.01" className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#1a5d43]/20 transition" placeholder="0.00" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                    </div>
                    <div>
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 mb-1.5 block">{t("adminLots.stock")}</label>
                       <input type="number" className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#1a5d43]/20 transition" placeholder="Quantité" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
                    </div>
                    <div>
                       <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 mb-1.5 block">{t("adminLots.units")}</label>
                       <select className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#1a5d43]/20 transition appearance-none" value={form.qualityLevel} onChange={(e) => setForm({ ...form, qualityLevel: e.target.value })}>
                          <option value="STANDARD">Kg</option>
                          <option value="PREMIUM">Litres</option>
                       </select>
                    </div>
                 </div>

                 <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 mb-1.5 block">{t("adminLots.imageUrl")}</label>
                    <div className="relative">
                       <input className="w-full bg-white border border-slate-200 rounded-2xl py-3 pr-4 pl-4 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#1a5d43]/20 transition" placeholder="https://..." value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
                       <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    </div>
                 </div>

                 <div className="bg-[#f0fdf4] rounded-2xl p-4 flex items-center justify-between border border-[#dcfce7]">
                    <span className="text-sm font-bold text-[#1a5d43]">{t("adminLots.published")}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1a5d43]"></div>
                    </label>
                 </div>

                 <button className="w-full bg-[#1a5d43] hover:bg-[#154934] text-white py-4 rounded-2xl text-sm font-bold shadow-md shadow-emerald-900/20 transition mt-2" onClick={submit}>
                    {editingId ? t("adminLots.updateLot") : t("adminLots.saveLot")}
                 </button>
                 
                 {editingId && (
                   <button className="w-full bg-rose-50 text-rose-600 hover:bg-rose-100 py-3 rounded-2xl text-sm font-bold transition mt-2" onClick={() => { setEditingId(null); setForm(initialForm); setIsFormVisible(false); }}>
                      {t("adminLots.cancelEdit")}
                   </button>
                 )}
              </div>
           </div>
        </div>
        )}

        {/* RIGHT COLUMN: CATALOGUE */}
        <div className="flex-1">
           <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">{t("adminLots.catalog")}</h2>
              <div className="flex gap-2">
                 <button className="p-2 bg-[#eef2f6] text-slate-600 rounded-xl hover:bg-slate-200 transition"><Filter size={18} /></button>
                 <button className="p-2 bg-[#eef2f6] text-slate-600 rounded-xl hover:bg-slate-200 transition"><Grid size={18} /></button>
              </div>
           </div>

           <div className="space-y-4">
              {items.map((item) => (
                 <div key={item.id} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex items-center gap-5 transition hover:shadow-md">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-slate-100">
                       <img src={item.imageUrl || "https://api.dicebear.com/7.x/shapes/svg?seed="+item.id} alt={item.titleFr} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                       <div className="flex items-start justify-between">
                          <div>
                             <h3 className="text-base font-bold text-slate-900 truncate">{i18n.language === "ar" ? item.titleAr : item.titleFr}</h3>
                             <p className="text-xs text-slate-500 mt-1 truncate max-w-sm">{i18n.language === "ar" ? item.descriptionAr : item.descriptionFr}</p>
                          </div>
                          {item.stock > 10 ? (
                             <span className="bg-[#a7f3d0]/40 text-[#1a5d43] text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap">{t("status.inStock")}</span>
                          ) : item.stock > 0 ? (
                             <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap">{t("status.lowStock")}</span>
                          ) : (
                             <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap">{t("status.outOfStock")}</span>
                          )}
                       </div>
                       
                       <div className="grid grid-cols-2 mt-4">
                          <div>
                             <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">{t("adminLots.price")}</p>
                             <p className="text-sm font-black text-[#1a5d43]">{Number(item.price).toFixed(2)} {t("common.mad")}</p>
                          </div>
                          <div className="flex justify-between items-end">
                             <div>
                                <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">QUANTITÉ</p>
                                <p className="text-sm font-black text-slate-800">{item.stock} {item.qualityLevel === "PREMIUM" ? "Litres" : "Kg"}</p>
                             </div>
                             <div className="flex gap-3">
                                <button className="text-[#1a5d43] hover:text-[#154934] transition" onClick={() => onEdit(item)}><Edit2 size={18} strokeWidth={2.5} /></button>
                                <button className="text-rose-500 hover:text-rose-700 transition" onClick={() => onDelete(item.id)}><Trash2 size={18} strokeWidth={2.5} /></button>
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              ))}

              <div className="mt-6 border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition" onClick={() => { setIsFormVisible(true); setEditingId(null); setForm(initialForm); }}>
                 <div className="w-12 h-12 bg-[#eef2f6] text-slate-500 rounded-full flex items-center justify-center mb-3">
                    <Plus size={24} />
                 </div>
                 <h4 className="text-sm font-bold text-slate-800">{t("adminLots.newArrivalsTitle")}</h4>
                 <p className="text-xs text-slate-500 mt-1 max-w-xs">{t("adminLots.newArrivalsDesc")}</p>
              </div>
           </div>
        </div>

      </div>

      {/* STICKY BOTTOM BAR */}
      <div className="fixed bottom-6 left-[300px] xl:left-[450px] right-6 xl:right-[150px] z-50 pointer-events-none">
         <div className="bg-[#1f5c40] rounded-[32px] p-6 shadow-2xl flex items-center justify-between text-white pointer-events-auto border border-white/10 relative">
            <div className="flex items-center gap-12">
               <div>
                  <p className="text-[10px] font-bold text-[#a7f3d0] tracking-widest uppercase">{t("adminLots.stockValue")}</p>
                  <p className="text-3xl font-black mt-1">{valeurStock.toLocaleString('en-US')} <span className="text-xl font-medium">{t("common.mad")}</span></p>
               </div>
               <div className="hidden md:block">
                  <p className="text-[10px] font-bold text-[#a7f3d0] tracking-widest uppercase">{t("adminLots.totalUnits")}</p>
                  <p className="text-3xl font-black mt-1">{unitesTotales.toLocaleString('en-US')} <span className="text-xl font-medium text-[#a7f3d0]">kg/l</span></p>
               </div>
               <div className="hidden lg:block">
                  <p className="text-[10px] font-bold text-[#a7f3d0] tracking-widest uppercase">{t("adminLots.activeProducts")}</p>
                  <p className="text-3xl font-black mt-1">{produitsActifs}</p>
               </div>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold">{t("adminLots.report")}</p>
                  <p className="text-[10px] text-[#a7f3d0] mt-0.5">{t("adminLots.generatedOn")} 2026</p>
               </div>
               <button className="bg-white text-[#1f5c40] w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-slate-100 transition shadow-sm" onClick={() => window.print()}>
                  <Download size={20} strokeWidth={2.5} />
               </button>
            </div>
            {/* FAB Button */}
            <button 
               className="absolute -right-6 -top-6 w-16 h-16 bg-[#1a5d43] text-white rounded-full flex items-center justify-center shadow-xl shadow-emerald-900/30 hover:bg-[#154934] transition hover:scale-105 border-4 border-[#f8fafc] pointer-events-auto z-10" 
               onClick={() => { 
                  if (isFormVisible) setIsFormVisible(false); 
                  else { setIsFormVisible(true); setEditingId(null); setForm(initialForm); } 
               }}
            >
               {isFormVisible ? <X size={28} className="animate-in fade-in zoom-in spin-in-90 duration-200" /> : <Plus size={28} className="animate-in fade-in zoom-in duration-200" />}
            </button>
         </div>
      </div>
    </AdminLayout>
  );
}
