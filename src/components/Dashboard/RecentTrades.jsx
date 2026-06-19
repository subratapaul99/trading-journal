import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrades } from '@/hooks/useTrades'
import { formatCurrency, formatDateShort } from '@/utils'

export default function RecentTrades() {
  const { trades, fetchTrades, isLoading } = useTrades()
  const navigate = useNavigate()

  useEffect(() => {
    fetchTrades({ limit: 10, page: 1 })
  }, [])

  return (
    <div
      className="rounded-xl p-5 h-full"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          Recent trades
        </h2>
        <button
          onClick={() => navigate('/trades')}
          className="text-xs transition-colors"
          style={{ color: 'var(--accent-cyan)' }}
        >
          View all →
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-10 rounded-lg animate-pulse"
              style={{ background: 'var(--bg-secondary)' }}
            />
          ))}
        </div>
      ) : trades.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            No trades yet. Log your first trade!
          </p>
        </div>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              {['Symbol', 'Type', 'Date', 'P&L', 'R:R', 'Mistakes'].map((h) => (
                <th
                  key={h}
                  className="text-left text-xs uppercase tracking-wider pb-3 px-2"
                  style={{
                    color: 'var(--text-secondary)',
                    fontWeight: 400,
                    borderBottom: '1px solid var(--border)',
                    letterSpacing: '0.05em',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trades.slice(0, 8).map((trade) => (
              <tr
                key={trade._id}
                onClick={() => navigate(`/trades/${trade._id}`)}
                className="cursor-pointer transition-colors"
                style={{ borderBottom: '1px solid rgba(30,42,58,0.5)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td className="py-3 px-2 font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
                  {trade.symbol}
                </td>
                <td className="py-3 px-2">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium"
                    style={
                      trade.type === 'long'
                        ? { background: 'rgba(0,200,150,0.12)', color: 'var(--accent-green)' }
                        : { background: 'rgba(232,64,64,0.12)', color: 'var(--accent-red)' }
                    }
                  >
                    {trade.type === 'long' ? '▲ Long' : '▼ Short'}
                  </span>
                </td>
                <td className="py-3 px-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {formatDateShort(trade.exitDate || trade.entryDate)}
                </td>
                <td
                  className="py-3 px-2 font-mono text-xs"
                  style={{ color: trade.pnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}
                >
                  {trade.pnl !== undefined ? formatCurrency(trade.pnl, true) : '—'}
                </td>
                <td className="py-3 px-2 font-mono text-xs" style={{ color: 'var(--accent-blue)' }}>
                  {trade.riskReward ? `${trade.riskReward}R` : '—'}
                </td>
                <td className="py-3 px-2">
                  {trade.mistakes?.slice(0, 1).map((m) => (
                    <span
                      key={m}
                      className="px-1.5 py-0.5 rounded text-xs"
                      style={{
                        background: 'rgba(245,158,11,0.12)',
                        color: 'var(--accent-amber)',
                      }}
                    >
                      {m}
                    </span>
                  ))}
                  {(trade.mistakes?.length || 0) > 1 && (
                    <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>
                      +{trade.mistakes.length - 1}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
