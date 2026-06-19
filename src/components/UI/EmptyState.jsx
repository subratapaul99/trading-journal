export default function EmptyState({ icon = '◈', title, description, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <span className="text-3xl mb-3" style={{ color: 'var(--text-muted)' }}>{icon}</span>
      <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{title}</p>
      {description && (
        <p className="text-xs max-w-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {description}
        </p>
      )}
      {action && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: 'var(--accent-cyan)', color: 'var(--bg-primary)' }}
        >
          {action}
        </button>
      )}
    </div>
  )
}
