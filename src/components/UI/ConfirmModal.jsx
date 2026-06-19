export default function ConfirmModal({ title, message, confirmLabel = 'Delete', onConfirm, onCancel, danger = true }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-xl p-6 flex flex-col gap-4"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        <div>
          <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h3>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{message}</p>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm transition-all"
            style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={danger
              ? { background: 'rgba(232,64,64,0.15)', color: 'var(--accent-red)', border: '1px solid rgba(232,64,64,0.3)' }
              : { background: 'var(--accent-cyan)', color: 'var(--bg-primary)' }
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
