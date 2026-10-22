export default function EmptyState({ title, children }) {
  return (
    <div className="empty-state">
      {title && <h2 className="h5">{title}</h2>}
      {children}
    </div>
  );
}
