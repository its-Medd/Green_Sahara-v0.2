import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { meRequest } from "../services/authService";

function AuthCallbackPage() {
  const [params] = useSearchParams();
  const setSession = useAuthStore((state) => state.setSession);
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      const token = params.get("token");
      const redirect = params.get("redirect");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const me = await meRequest();
        setSession({ token, user: me.data });
        navigate(
          redirect || me.data.redirectPath || (me.data.role === "ADMIN"
            ? "/admin/dashboard"
            : me.data.role === "FARMER"
              ? "/farmer/dashboard"
              : "/provider/dashboard")
        );
      } catch {
        navigate("/login");
      }
    };
    run();
  }, [navigate, params, setSession]);

  return <div className="min-h-screen flex items-center justify-center">Authentification...</div>;
}

export default AuthCallbackPage;
