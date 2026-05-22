function ActionCard({ title, description, buttonLabel, onClick }) {
  return (
    <div className="card p-4">
      <h3 className="text-sm font-bold text-brand-text">{title}</h3>
      <p className="mt-1 text-xs text-brand-muted">{description}</p>
      <button className="btn-primary mt-4 text-xs" onClick={onClick}>
        {buttonLabel}
      </button>
    </div>
  );
}

export default ActionCard;
