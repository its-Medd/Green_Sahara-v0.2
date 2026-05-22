import { useTranslation } from "react-i18next";
import AuthLayout from "../layouts/AuthLayout";
import AuthCard from "../components/AuthCard";

function ForgotPasswordPage() {
  const { t } = useTranslation();
  return (
    <AuthLayout>
      <AuthCard title={t("auth.forgotPasswordTitle")} subtitle={t("auth.forgotPasswordSubtitle")}>
        <input className="input" placeholder={t("auth.email")} />
        <button className="btn-primary w-full text-sm">{t("auth.sendLink")}</button>
      </AuthCard>
    </AuthLayout>
  );
}

export default ForgotPasswordPage;

