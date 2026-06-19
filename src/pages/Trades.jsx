import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrades } from '@/hooks/useTrades'
import { useTradeStore, useUIStore } from '@/store/useStore'
import { formatCurrency, formatDate, MISTAKE_OPTIONS } from '@/utils'

export default function Trades() {
  const navigate = useNavigate()
  const { trades, filters, pagination, isLoading, fetchTrades } = useTrades()
  const { setFilters, resetFilters } = useTradeStore()
  const { openTradeForm } = useUIStore()
  const [localFilters, setLocalFilters] = useState(filters)

  useEffect(() => { fetchTrades() }, [filters, pagination.page])

  const applyFilters = () => setFilters(localFilters)
  const handleReset = () => { resetFilters(); setLocalFilters(filters) }

  const inp = {
    padding: '7px 10px', borderRadius: '8px', fontSize: '12px',
    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', outline: 'none',
  }

  return (
    <div className="flex flex-col gap-4 max-w-7xl mx-auto">
      {/* Filter bar */}
      <div
        className="rounded-xl p-4 flex flex-wrap items-center gap-3"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <input
          style={{ ...inp, width: '100px' }}
          placeholder="Symbol..."
          value={localFilters.symbol}
          onChange={(e) => setLocalFilters((f) => ({ ...f, symbol: e.target.value.toUpperCase() }))}
        />
        <select
          style={{ ...inp, width: '100px' }}
          value={localFilters.type}
          onChange={(e) => setLocalFilters((f) => ({ ...f, type: e.target.value }))}
        >
          <option value="">All types</option>
          <option value="long">Long</option>
          <option value="short">Short</option>
        </select>
        <select
          style={{ ...inp, width: '130px' }}
          value={localFilters.result}
          onChange={(e) => setLocalFilters((f) => ({ ...f, result: e.target.value }))}
        >
          <option value="">Win + Loss</option>
          <option value="win">Winners only</option>
          <option value="loss">Losers only</option>
        </select>
        <select
          style={{ ...inp, width: '150px' }}
          value={localFilters.mistake}
          onChange={(e) => setLocalFilters((f) => ({ ...f, mistake: e.target.value }))}
        >
          <option value="">Any mistake</option>
          {MISTAKE_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <input type="date" style={{ ...inp }} value={localFilters.dateFrom}
          onChange={(e) => setLocalFilters((f) => ({ ...f, dateFrom: e.target.value }))} />
        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>→</span>
        <input type="date" style={{ ...inp }} value={localFilters.dateTo}
          onChange={(e) => setLocalFilters((f) => ({ ...f, dateTo: e.target.value }))} />
        <button onClick={applyFilters}
          className="px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{ background: 'var(--accent-cyan)', color: 'var(--bg-primary)' }}>
          Filter
        </button>
        <button onClick={handleReset}
          className="px-3 py-1.5 rounded-lg text-xs"
          style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
          Reset
        </button>
        <div className="ml-auto">
          <button onClick={() => openTradeForm()}
            className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
            + Log Trade
          </button>
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Symbol', 'Type', 'Entry', 'Exit', 'Qty', 'P&L', 'R:R', 'Strategy', 'Mistakes', 'Date'].map((h) => (
                <th key={h} className="text-left py-3 px-4 text-xs uppercase tracking-wider font-normal"
                  style={{ color: 'var(--text-secondary)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(30,42,58,0.4)' }}>
                  {Array.from({ length: 10 }).map((__, j) => (
                    <td key={j} className="py-3 px-4">
                      <div className="h-4 rounded animate-pulse" style={{ background: 'var(--bg-hover)', width: '60%' }} />
                    </td>
                  ))}
                </tr>
              ))
              : trades.map((t) => (
                <tr key={t._id}
                  onClick={() => navigate(`/trades/${t._id}`)}
                  className="cursor-pointer transition-colors"
                  style={{ borderBottom: '1px solid rgba(30,42,58,0.4)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td className="py-3 px-4 font-mono font-medium" style={{ color: 'var(--text-primary)' }}>{t.symbol}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-xs font-medium"
                      style={t.type === 'long'
                        ? { background: 'rgba(0,200,150,0.12)', color: 'var(--accent-green)' }
                        : { background: 'rgba(232,64,64,0.12)', color: 'var(--accent-red)' }}>
                      {t.type === 'long' ? '▲' : '▼'} {t.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>${t.entryPrice}</td>
                  <td className="py-3 px-4 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {t.exitPrice ? `$${t.exitPrice}` : <span style={{ color: 'var(--text-muted)' }}>Open</span>}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{t.quantity}</td>
                  <td className="py-3 px-4 font-mono text-xs font-medium"
                    style={{ color: t.pnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                    {t.pnl !== undefined ? formatCurrency(t.pnl, true) : '—'}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs" style={{ color: 'var(--accent-blue)' }}>
                    {t.riskReward ? `${t.riskReward}R` : '—'}
                  </td>
                  <td className="py-3 px-4 text-xs" style={{ color: 'var(--text-secondary)' }}>{t.strategy || '—'}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1 flex-wrap">
                      {t.mistakes?.slice(0, 2).map((m) => (
                        <span key={m} className="px-1.5 py-0.5 rounded text-xs"
                          style={{ background: 'rgba(245,158,11,0.12)', color: 'var(--accent-amber)' }}>
                          {m}
                        </span>
                      ))}
                      {(t.mistakes?.length || 0) > 2 && (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>+{t.mistakes.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {formatDate(t.exitDate || t.entryDate, 'MMM dd')}
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>

        {/* Pagination */}
        {pagination.total > pagination.limit && (
          <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {pagination.total} trades total
            </span>
            <div className="flex gap-2">
              <button
                disabled={pagination.page === 1}
                className="px-3 py-1 rounded text-xs disabled:opacity-40"
                style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                ← Prev
              </button>
              <span className="px-3 py-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                {pagination.page}
              </span>
              <button
                disabled={pagination.page * pagination.limit >= pagination.total}
                className="px-3 py-1 rounded text-xs disabled:opacity-40"
                style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
