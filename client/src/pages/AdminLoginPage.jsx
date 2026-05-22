import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthLayout from "../layouts/AuthLayout";
import AuthCard from "../components/AuthCard";
import { adminLoginRequest } from "../services/authService";
import { useAuthStore } from "../store/useAuthStore";
import { useToast } from "../hooks/useToast";

function AdminLoginPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ email: "", password: "" });
  const setSession = useAuthStore((state) => state.setSession);
  const navigate = useNavigate();
  const { toast } = useToast();

  const submit = async (event) => {
    event.preventDefault();
    try {
      const response = await adminLoginRequest(form);
      setSession(response.data);
      navigate("/admin/dashboard");
    } catch (error) {
      toast({
        title: "Admin",
        message: error?.response?.data?.message || t("auth.loginError"),
        type: "error"
      });
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title={t("auth.adminLogin")}
        footer={<Link to="/login" className="text-brand-green text-xs">{t("auth.backToLogin")}</Link>}
      >
        <form className="space-y-3" onSubmit={submit}>
          <input className="input" type="email" placeholder={t("auth.email")} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" type="password" placeholder={t("auth.password")} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button className="btn-primary w-full text-sm">{t("actions.login")}</button>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}

export default AdminLoginPage;
