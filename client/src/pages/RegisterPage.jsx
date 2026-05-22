import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import AuthLayout from "../layouts/AuthLayout";
import AuthCard from "../components/AuthCard";
import { registerRequest } from "../services/authService";
import { useAuthStore } from "../store/useAuthStore";
import { useToast } from "../hooks/useToast";
import { User, Mail, Lock, Home, MapPin, Sprout, ArrowRight, ArrowLeft } from "lucide-react";

function RegisterPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "farmer",
    farmName: "",
    city: "",
    region: "",
    mainCrops: ""
  });

  const nextStep = (e) => {
    if (e) e.preventDefault();
    if (!form.email.includes("@")) {
      return toast({ title: "Inscription", message: t("auth.invalidEmail"), type: "error" });
    }
    if (form.password.length < 8) {
      return toast({ title: "Inscription", message: t("auth.shortPassword"), type: "error" });
    }
    setStep(2);
  };

  const resolveDashboard = () => "/farmer/dashboard";

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!form.fullName.trim()) {
      return toast({
        title: "Inscription",
        message: t("auth.fullNameRequired"),
        type: "error"
      });
    }

    try {
      const response = await registerRequest(form);
      setSession(response.data);
      navigate(resolveDashboard());
    } catch (error) {
      toast({
        title: "Inscription",
        message: error?.response?.data?.message || t("auth.registerError"),
        type: "error"
      });
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title={step === 1 ? t("auth.registerStep1Title") : t("auth.registerStep2Title")}
        footer={
          <p className="text-xs text-slate-400">
            {t("actions.login")} ?{" "}
            <Link className="text-brand-green font-bold hover:underline ml-1" to="/login">
              {t("actions.login")}
            </Link>
          </p>
        }
      >
        <form className="space-y-5" onSubmit={step === 1 ? nextStep : onSubmit}>
          {step === 1 ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-green transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-slate-700 outline-none focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green/30 transition-all shadow-sm"
                  type="email"
                  placeholder={t("auth.email")}
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-green transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-slate-700 outline-none focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green/30 transition-all shadow-sm"
                  type="password"
                  placeholder={t("auth.password")}
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  required
                />
              </div>

              <button type="submit" className="w-full bg-brand-green text-white font-black py-4 rounded-2xl text-lg lowercase shadow-xl shadow-brand-green/20 hover:brightness-110 transition-all flex items-center justify-center gap-2 group">
                {t("auth.continueBtn")}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition" />
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-green transition-colors">
                  <User size={18} />
                </div>
                <input
                  className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-slate-700 outline-none focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green/30 transition-all shadow-sm"
                  placeholder={t("auth.fullName")}
                  value={form.fullName}
                  onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                  required
                />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-green transition-colors">
                  <Home size={18} />
                </div>
                <input
                  className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-slate-700 outline-none focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green/30 transition-all shadow-sm"
                  placeholder={t("auth.farmNamePlaceholder")}
                  value={form.farmName}
                  onChange={(event) => setForm({ ...form, farmName: event.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-green transition-colors">
                    <MapPin size={18} />
                  </div>
                  <input
                    className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-slate-700 outline-none focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green/30 transition-all shadow-sm"
                    placeholder={t("auth.cityPlaceholder")}
                    value={form.city}
                    onChange={(event) => setForm({ ...form, city: event.target.value })}
                  />
                </div>
                <input
                  className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 px-4 text-sm text-slate-700 outline-none focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green/30 transition-all shadow-sm"
                  placeholder={t("auth.regionPlaceholder")}
                  value={form.region}
                  onChange={(event) => setForm({ ...form, region: event.target.value })}
                />
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-green transition-colors">
                  <Sprout size={18} />
                </div>
                <input
                  className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-slate-700 outline-none focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green/30 transition-all shadow-sm"
                  placeholder={t("auth.cropsPlaceholder")}
                  value={form.mainCrops}
                  onChange={(event) => setForm({ ...form, mainCrops: event.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-white border border-slate-100 text-slate-400 font-bold py-4 rounded-2xl text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2 group"
                >
                  <ArrowLeft size={18} className="group-hover:-translate-x-1 transition" />
                  {t("auth.prevBtn")}
                </button>
                <button type="submit" className="flex-[2] bg-brand-green text-white font-black py-4 rounded-2xl text-lg lowercase shadow-xl shadow-brand-green/20 hover:brightness-110 transition-all">
                  {t("auth.finishBtn")}
                </button>
              </div>
            </div>
          )}
        </form>
      </AuthCard>
    </AuthLayout>
  );
}

export default RegisterPage;

