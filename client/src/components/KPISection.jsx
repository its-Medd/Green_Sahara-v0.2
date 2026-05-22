import StatCard from "./StatCard";

function KPISection({ items = [] }) {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {items.map((item) => (
        <StatCard key={item.label} label={item.label} value={item.value} suffix={item.suffix} accent={item.accent} />
      ))}
    </div>
  );
}

export default KPISection;

