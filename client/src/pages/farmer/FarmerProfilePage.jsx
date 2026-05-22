import { useEffect, useState } from "react";
import FarmerLayout from "../../layouts/FarmerLayout";
import { getFarmerProfile, updateFarmerProfile } from "../../services/farmerService";
import { useToast } from "../../hooks/useToast";
import { useAuthStore } from "../../store/useAuthStore";
import { Shield, Save, Pencil, Sprout } from "lucide-react";

function FarmerProfilePage() {
  const [form, setForm] = useState({
    farmName: "",
    region: "",
    city: "",
    surfaceHectares: "",
    climate: "",
    mainCrops: "",
    equipment: ""
  });
  const user = useAuthStore((state) => state.user);
  const { toast } = useToast();

  useEffect(() => {
    getFarmerProfile()
      .then((response) => {
        const profile = response.data;
        setForm({
          farmName: profile?.farmName || "",
          region: profile?.region || "",
          city: profile?.city || "",
          surfaceHectares: profile?.surfaceHectares || "",
          climate: profile?.climate || "",
          mainCrops: profile?.mainCrops || "",
          equipment: profile?.equipment || ""
        });
      })
      .catch(() => null);
  }, []);

  const save = async () => {
    await updateFarmerProfile(form);
    toast({ title: "Profil", message: "Informations ferme mises à jour", type: "success" });
  };

  const inputClass = "w-full bg-white border border-slate-200 rounded-2xl py-3 px-4 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#1a5d43]/20 transition placeholder:text-slate-400";
  const labelClass = "text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block";

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
    : "Janvier 2023";

  return (
    <FarmerLayout>
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Paramètres du compte</p>
          <h1 className="text-4xl font-black text-slate-900 mt-1">Profil Farmer</h1>
          <p className="text-slate-500 text-sm mt-2 max-w-md font-medium">
            Gérez vos informations agricoles pour optimiser les recommandations de l'écosystème Green Sahara.
          </p>
        </div>

        {/* Impact circular score */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center gap-4 min-w-[180px]">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Impact Circulaire</p>
            <p className="text-3xl font-black text-[#1a5d43] mt-1">84%</p>
          </div>
          <div className="relative w-14 h-14 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f0fdf4" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1a5d43" strokeWidth="3"
                strokeDasharray="84 16" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-[1fr_300px] gap-6">
        {/* Main form */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-7">
            <div className="w-10 h-10 bg-[#f0fdf4] rounded-xl flex items-center justify-center">
              <Sprout size={20} className="text-[#1a5d43]" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Détails de l'Exploitation</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Nom</label>
              <input className={inputClass} placeholder="Nom de la ferme" value={form.farmName} onChange={(e) => setForm({ ...form, farmName: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Ville</label>
              <input className={inputClass} placeholder="Ville" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Région</label>
              <input className={inputClass} placeholder="Région" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Surface (Hectares)</label>
              <input type="number" className={inputClass} placeholder="Ex: 12" value={form.surfaceHectares} onChange={(e) => setForm({ ...form, surfaceHectares: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Climat</label>
              <select className={inputClass} value={form.climate} onChange={(e) => setForm({ ...form, climate: e.target.value })}>
                <option value="">Choisir un climat...</option>
                <option value="Tempéré">Tempéré</option>
                <option value="Aride">Aride</option>
                <option value="Semi-aride">Semi-aride</option>
                <option value="Méditerranéen">Méditerranéen</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Cultures Principales</label>
              <input className={inputClass} placeholder="Ex: Tomates, Olives" value={form.mainCrops} onChange={(e) => setForm({ ...form, mainCrops: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Équipements</label>
              <textarea
                className={`${inputClass} min-h-[100px] resize-none`}
                placeholder="Listez vos équipements agricoles..."
                value={form.equipment}
                onChange={(e) => setForm({ ...form, equipment: e.target.value })}
              />
            </div>
          </div>

          <button
            onClick={save}
            className="mt-7 bg-[#1a5d43] hover:bg-[#154934] text-white py-4 px-8 rounded-2xl text-sm font-black flex items-center gap-2 transition shadow-md shadow-emerald-900/20"
          >
            <Save size={16} /> Enregistrer
          </button>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Avatar card */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center">
            <div className="relative w-20 h-20 mx-auto">
              <div className="w-20 h-20 rounded-full bg-slate-800 text-white text-2xl font-black flex items-center justify-center">
                {user?.fullName?.slice(0, 1) || "F"}
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 bg-[#1a5d43] rounded-full flex items-center justify-center text-white border-2 border-white hover:bg-[#154934] transition">
                <Pencil size={12} strokeWidth={2.5} />
              </button>
            </div>
            <p className="mt-4 text-base font-black text-slate-900">{user?.fullName || form.farmName || "Farmer"}</p>
            <p className="text-xs text-slate-500 mt-1">Inscrit depuis {memberSince}</p>

            <div className="mt-4 bg-[#f0fdf4] rounded-2xl p-3 flex items-center gap-2.5">
              <Shield size={16} className="text-[#1a5d43]" />
              <div className="text-left">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Statut</p>
                <p className="text-sm font-black text-[#1a5d43]">Ambassadeur Vert</p>
              </div>
            </div>
          </div>

          {/* Support card */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white">
            <h3 className="text-sm font-bold mb-2">Aide & Support</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Besoin d'aide pour configurer votre système d'irrigation ?
            </p>
            <button className="mt-4 w-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2.5 rounded-xl transition">
              Contacter un Expert
            </button>
          </div>
        </div>
      </div>
    </FarmerLayout>
  );
}

export default FarmerProfilePage;
