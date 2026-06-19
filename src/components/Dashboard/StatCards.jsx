import { formatCurrency, formatPct } from '@/utils'

const STAT_CONFIG = [
  {
    key: 'netPnl',
    label: 'Net P&L',
    format: (v) => formatCurrency(v, true),
    color: (v) => (v >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'),
    sub: (s) => `${s?.totalTrades || 0} trades total`,
  },
  {
    key: 'winRate',
    label: 'Win rate',
    format: (v) => `${v?.toFixed(1) || '0.0'}%`,
    color: (v) => (v >= 50 ? 'var(--accent-green)' : 'var(--accent-red)'),
    sub: (s) => `${s?.wins || 0}W / ${s?.losses || 0}L`,
  },
  {
    key: 'avgRR',
    label: 'Avg R:R',
    format: (v) => `${v?.toFixed(2) || '—'}R`,
    color: () => 'var(--text-primary)',
    sub: () => 'Target: 2.0R',
  },
  {
    key: 'profitFactor',
    label: 'Profit factor',
    format: (v) => v?.toFixed(2) || '—',
    color: (v) => (v >= 1.5 ? 'var(--accent-green)' : v >= 1 ? 'var(--accent-amber)' : 'var(--accent-red)'),
    sub: () => 'Gross win / loss',
  },
  {
    key: 'maxDrawdown',
    label: 'Max drawdown',
    format: (v) => formatCurrency(v),
    color: () => 'var(--accent-red)',
    sub: (s) => s?.drawdownPeriod || '—',
  },
  {
    key: 'openPositions',
    label: 'Open positions',
    format: (v) => v || 0,
    color: () => 'var(--accent-blue)',
    sub: (s) => `${s?.openPnl ? formatCurrency(s.openPnl, true) : '$0'} unrealized`,
  },
]

export default function StatCards({ summary }) {
  // Skeleton loading state
  if (!summary) {
    return (
      <div className="grid grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl p-4 animate-pulse"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', height: '90px' }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-6 gap-3">
      {STAT_CONFIG.map(({ key, label, format, color, sub }) => {
        const val = summary[key]
        return (
          <div
            key={key}
            className="rounded-xl p-4 flex flex-col gap-1"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <p
              className="text-xs uppercase tracking-wider"
              style={{ color: 'var(--text-secondary)' }}
            >
              {label}
            </p>
            <p
              className="text-xl font-medium font-mono leading-tight"
              style={{ color: color(val) }}
            >
              {format(val)}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {sub(summary)}
            </p>
          </div>
        )
      })}
    </div>
  )
}
