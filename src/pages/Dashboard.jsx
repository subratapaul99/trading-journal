import { useEffect } from 'react'
import { useAnalyticsStore } from '@/store/useStore'
import { analyticsAPI } from '@/services/api'
import StatCards from '@/components/Dashboard/StatCards'
import EquityChart from '@/components/Charts/EquityChart'
import RecentTrades from '@/components/Dashboard/RecentTrades'
import MistakeBreakdown from '@/components/Dashboard/MistakeBreakdown'
import AIInsightPanel from '@/components/Dashboard/AIInsightPanel'

export default function Dashboard() {
  const { setSummary, setEquityCurve, setMistakeData, summary, equityCurve, mistakeData } =
    useAnalyticsStore()

  useEffect(() => {
    const load = async () => {
      try {
        const [s, e, m] = await Promise.all([
          analyticsAPI.getSummary(),
          analyticsAPI.getEquityCurve({ range: '1M' }),
          analyticsAPI.getMistakes(),
        ])
        setSummary(s.data)
        setEquityCurve(e.data.curve)
        setMistakeData(m.data.mistakes)
      } catch {
        // handled by api interceptor
      }
    }
    load()
  }, [])

  return (
    <div className="flex flex-col gap-5 max-w-7xl mx-auto">
      {/* Stat cards */}
      <StatCards summary={summary} />

      {/* Equity curve */}
      <div
        className="rounded-xl p-5"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Equity curve
          </h2>
          <div className="flex gap-1">
            {['1W', '1M', '3M', 'All'].map((r) => (
              <button
                key={r}
                className="px-2.5 py-1 rounded-md text-xs transition-all"
                style={{
                  background: r === '1M' ? 'var(--bg-hover)' : 'transparent',
                  color: r === '1M' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <EquityChart data={equityCurve} />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2">
          <RecentTrades />
        </div>
        <div className="flex flex-col gap-5">
          <MistakeBreakdown data={mistakeData} />
          <AIInsightPanel />
        </div>
      </div>
    </div>
  )
}
