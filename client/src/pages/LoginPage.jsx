import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import AuthLayout from "../layouts/AuthLayout";
import AuthCard from "../components/AuthCard";
import { loginRequest } from "../services/authService";
import { useAuthStore } from "../store/useAuthStore";
import { useToast } from "../hooks/useToast";
import { User, Lock, Loader2 } from "lucide-react";

function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const resolveDashboard = (user) => {
    if (user?.role === "ADMIN") return "/admin/dashboard";
    if (user?.role === "FARMER") return "/farmer/dashboard";
    return "/farmer/dashboard"; // Fallback
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      const response = await loginRequest(form);
      setSession(response.data);
      navigate(resolveDashboard(response.data.user));
    } catch (error) {
      toast({
        title: "Connexion",
        message: error?.response?.data?.message || t("auth.loginError"),
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title={t("auth.loginTitle")}
        footer={
          <div className="flex flex-col gap-4">
            <Link to="/forgot-password" size="sm" className="text-[11px] text-slate-400 hover:text-brand-green transition text-right mr-2">
              {t("auth.forgotPasswordLink")}
            </Link>
            
            <p className="text-xs text-slate-400">
              {t("actions.register")} ? <Link to="/register" className="text-brand-green font-bold hover:underline ml-1">{t("auth.createAccountPrompt")}</Link>
            </p>
          </div>
        }
      >
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-brand-green transition-colors">
              <User size={18} />
            </div>
            <input
              className="w-full bg-white border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-slate-700 outline-none focus:ring-4 focus:ring-brand-green/10 focus:border-brand-green/30 transition-all shadow-sm"
              type="email"
              placeholder={t("auth.emailUsernamePlaceholder")}
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

          <button 
            className="w-full bg-brand-green text-white font-black py-4 rounded-2xl text-lg lowercase shadow-xl shadow-brand-green/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2" 
            disabled={loading}
          >
            {loading ? <Loader2 size={24} className="animate-spin" /> : t("auth.loginBtn")}
          </button>
        </form>

      </AuthCard>
    </AuthLayout>
  );
}

export default LoginPage;

