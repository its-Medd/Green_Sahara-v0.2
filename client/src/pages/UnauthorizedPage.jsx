import { Link } from "react-router-dom";

function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card p-8 text-center">
        <h1 className="text-2xl font-black">403</h1>
        <p className="text-sm text-brand-muted mt-2">Accès non autorisé.</p>
        <Link className="btn-primary mt-4 text-sm" to="/">
          Accueil
        </Link>
      </div>
    </div>
  );
}

export default UnauthorizedPage;

