import { useState } from 'react'
import { useAnalyticsStore, useTradeStore } from '@/store/useStore'

export default function AIInsightPanel() {
  const { aiInsights, setAIInsights, isLoadingInsights, setLoadingInsights } = useAnalyticsStore()
  const { trades } = useTradeStore()
  const [error, setError] = useState(null)

  const fetchInsights = async () => {
    if (!trades.length) return
    setLoadingInsights(true)
    setError(null)
    try {
      const summary = {
        totalTrades: trades.length,
        mistakes: trades.flatMap((t) => t.mistakes || []),
        pnlData: trades.map((t) => ({ symbol: t.symbol, pnl: t.pnl, type: t.type })),
        emotions: trades.flatMap((t) => t.emotions || []),
      }

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: `You are a trading coach analyzing a trader's journal data.
Return ONLY a JSON array of 3 insight objects, no preamble or markdown.
Each object: { "title": string, "insight": string, "severity": "warning"|"info"|"success" }
Be specific, actionable, and reference actual patterns from the data.`,
          messages: [
            {
              role: 'user',
              content: `Analyze this trading data and give 3 key insights:\n${JSON.stringify(summary, null, 2)}`,
            },
          ],
        }),
      })

      const data = await res.json()
      const text = data.content?.map((c) => c.text || '').join('')
      const clean = text.replace(/```json|```/g, '').trim()
      const insights = JSON.parse(clean)
      setAIInsights(insights)
    } catch (e) {
      setError('Could not generate insights. Connect your API key.')
    } finally {
      setLoadingInsights(false)
    }
  }

  const SEV_STYLE = {
    warning: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', icon: '⚠', color: '#F59E0B' },
    info:    { bg: 'rgba(88,130,255,0.1)', border: 'rgba(88,130,255,0.2)', icon: '◈', color: '#5882FF' },
    success: { bg: 'rgba(0,200,150,0.1)', border: 'rgba(0,200,150,0.2)', icon: '✦', color: '#00C896' },
  }

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>AI Insights</span>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(88,130,255,0.15)', color: '#5882FF', border: '1px solid rgba(88,130,255,0.3)' }}
          >
            Claude
          </span>
        </div>
        <button
          onClick={fetchInsights}
          disabled={isLoadingInsights}
          className="text-xs px-2.5 py-1 rounded-lg transition-all disabled:opacity-50"
          style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
        >
          {isLoadingInsights ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      {error && (
        <p className="text-xs text-center py-3" style={{ color: 'var(--accent-red)' }}>{error}</p>
      )}

      {!aiInsights.length && !error && (
        <div className="py-6 text-center">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Click Analyze to get AI-powered pattern insights from your trades
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {aiInsights.map((ins, i) => {
          const s = SEV_STYLE[ins.severity] || SEV_STYLE.info
          return (
            <div
              key={i}
              className="rounded-lg p-3 flex gap-3"
              style={{ background: s.bg, border: `1px solid ${s.border}` }}
            >
              <span className="text-sm flex-shrink-0" style={{ color: s.color }}>{s.icon}</span>
              <div>
                <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>{ins.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{ins.insight}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
