interface EmptyStateProps {
  title: string
  description: string
  actionLabel: string
  onAction: () => void
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="card empty-state">
      <strong className="section-title">{title}</strong>
      <p className="muted">{description}</p>
      <button type="button" className="button button--primary" onClick={onAction}>
        {actionLabel}
      </button>
    </div>
  )
}
