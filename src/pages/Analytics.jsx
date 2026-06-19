import { useEffect, useState } from 'react'
import { analyticsAPI } from '@/services/api'
import { useAnalyticsStore } from '@/store/useStore'
import PnLCalendar from '@/components/Charts/PnLCalendar'
import WinRateByDay from '@/components/Charts/WinRateByDay'
import RRDistribution from '@/components/Charts/RRDistribution'
import DrawdownChart from '@/components/Charts/DrawdownChart'
import { formatCurrency } from '@/utils'

export default function Analytics() {
  const { setSummary, setEquityCurve, setMistakeData, setCalendarData, summary, equityCurve, mistakeData, calendarData } = useAnalyticsStore()
  const [range, setRange] = useState('1M')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [s, e, m, c] = await Promise.all([
          analyticsAPI.getSummary({ range }),
          analyticsAPI.getEquityCurve({ range }),
          analyticsAPI.getMistakes({ range }),
          analyticsAPI.getCalendar({ range }),
        ])
        setSummary(s.data)
        setEquityCurve(e.data.curve)
        setMistakeData(m.data.mistakes)
        setCalendarData(c.data.calendar)
      } catch { /* handled globally */ }
      finally { setLoading(false) }
    }
    load()
  }, [range])

  const RANGES = ['1W', '1M', '3M', '6M', 'All']

  const card = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Analytics</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Deep performance breakdown</p>
        </div>
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          {RANGES.map((r) => (
            <button key={r} onClick={() => setRange(r)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
              style={{
                background: range === r ? 'var(--bg-hover)' : 'transparent',
                color: range === r ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total P&L', value: formatCurrency(summary?.netPnl || 0, true), color: (summary?.netPnl || 0) >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' },
          { label: 'Best trade', value: formatCurrency(summary?.bestTrade || 0, true), color: 'var(--accent-green)' },
          { label: 'Worst trade', value: formatCurrency(summary?.worstTrade || 0, true), color: 'var(--accent-red)' },
          { label: 'Avg trade', value: formatCurrency(summary?.avgTrade || 0, true), color: 'var(--text-primary)' },
        ].map(({ label, value, color }) => (
          <div key={label} style={card}>
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>{label}</p>
            <p className="text-xl font-mono font-medium" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* P&L Calendar */}
      <div style={card}>
        <h2 className="text-sm font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Daily P&L Heatmap</h2>
        <PnLCalendar data={calendarData} loading={loading} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-5">
        <div style={card}>
          <h2 className="text-sm font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Win Rate by Day</h2>
          <WinRateByDay data={summary?.winRateByDay} loading={loading} />
        </div>
        <div style={card}>
          <h2 className="text-sm font-medium mb-4" style={{ color: 'var(--text-primary)' }}>R:R Distribution</h2>
          <RRDistribution data={equityCurve} loading={loading} />
        </div>
      </div>

      {/* Drawdown chart */}
      <div style={card}>
        <h2 className="text-sm font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Drawdown</h2>
        <DrawdownChart data={equityCurve} loading={loading} />
      </div>

      {/* Mistake analysis */}
      <div style={card}>
        <h2 className="text-sm font-medium mb-4" style={{ color: 'var(--text-primary)' }}>Mistake Impact Analysis</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Mistake', 'Occurrences', 'Avg P&L when present', 'Win rate', 'Est. $ impact'].map(h => (
                  <th key={h} className="text-left py-3 px-3 text-xs uppercase tracking-wider font-normal" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(mistakeData?.length ? mistakeData : MOCK_MISTAKES).map((m, i) => (
                <tr key={m.name} style={{ borderBottom: '1px solid rgba(30,42,58,0.5)' }}>
                  <td className="py-3 px-3 font-medium" style={{ color: 'var(--text-primary)' }}>{m.name}</td>
                  <td className="py-3 px-3 font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>{m.count || m.pct + '%'}</td>
                  <td className="py-3 px-3 font-mono text-xs" style={{ color: 'var(--accent-red)' }}>{formatCurrency(m.avgPnl || -180 - i * 30, true)}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 rounded-full overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                        <div className="h-full rounded-full" style={{ width: `${m.winRate || 35 - i * 3}%`, background: 'var(--accent-red)' }} />
                      </div>
                      <span className="text-xs font-mono" style={{ color: 'var(--accent-red)' }}>{m.winRate || 35 - i * 3}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-xs font-medium" style={{ color: 'var(--accent-red)' }}>{formatCurrency(m.totalImpact || -(180 + i * 30) * (m.pct || 10) / 5, true)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const MOCK_MISTAKES = [
  { name: 'FOMO entry', pct: 34, avgPnl: -210, winRate: 28, totalImpact: -1470 },
  { name: 'No stop loss', pct: 22, avgPnl: -380, winRate: 22, totalImpact: -1900 },
  { name: 'Oversized position', pct: 18, avgPnl: -290, winRate: 31, totalImpact: -1160 },
  { name: 'Early exit', pct: 14, avgPnl: -140, winRate: 40, totalImpact: -560 },
  { name: 'Revenge trade', pct: 12, avgPnl: -420, winRate: 18, totalImpact: -1260 },
]
