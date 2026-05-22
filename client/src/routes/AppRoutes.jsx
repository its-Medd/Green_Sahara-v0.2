import { Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import AdminLoginPage from "../pages/AdminLoginPage";
import RegisterPage from "../pages/RegisterPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import AuthCallbackPage from "../pages/AuthCallbackPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import NotFoundPage from "../pages/NotFoundPage";
import ProtectedRoute from "./ProtectedRoute";
import FarmerDashboardPage from "../pages/farmer/FarmerDashboardPage";
import FarmerMarketplacePage from "../pages/farmer/FarmerMarketplacePage";
import FarmerOrdersPage from "../pages/farmer/FarmerOrdersPage";
import FarmerAIPage from "../pages/farmer/FarmerAIPage";
import FarmerProfilePage from "../pages/farmer/FarmerProfilePage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminAnalysisPage from "../pages/admin/AdminAnalysisPage";
import AdminStatsPage from "../pages/admin/AdminStatsPage";
import AdminLotsPage from "../pages/admin/AdminLotsPage";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin-login" element={<AdminLoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute role="FARMER" />}>
        <Route path="/farmer/dashboard" element={<FarmerDashboardPage />} />
        <Route path="/farmer/marketplace" element={<FarmerMarketplacePage />} />
        <Route path="/farmer/orders" element={<FarmerOrdersPage />} />
        <Route path="/farmer/ai" element={<FarmerAIPage />} />
        <Route path="/farmer/profile" element={<FarmerProfilePage />} />
      </Route>

      <Route element={<ProtectedRoute role="ADMIN" />}>
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/analysis" element={<AdminAnalysisPage />} />
        <Route path="/admin/stats" element={<AdminStatsPage />} />
        <Route path="/admin/lots" element={<AdminLotsPage />} />
      </Route>

      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;

