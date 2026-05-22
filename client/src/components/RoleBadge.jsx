function RoleBadge({ role }) {
  const value = role === "ADMIN" ? "Admin" : role === "PROVIDER" ? "Provider" : "Farmer";
  const tone =
    role === "ADMIN"
      ? "bg-slate-100 text-slate-800"
      : role === "PROVIDER"
        ? "bg-blue-50 text-blue-700"
        : "bg-green-50 text-green-700";
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${tone}`}>{value}</span>;
}

export default RoleBadge;
