import { useState, useEffect } from 'react'
import { format, subDays, parseISO } from 'date-fns'
import { formatDate } from '@/utils'
import api from '@/services/api'
import toast from 'react-hot-toast'

const MOODS = [
  { emoji: '😤', label: 'Frustrated' },
  { emoji: '😰', label: 'Anxious' },
  { emoji: '😐', label: 'Neutral' },
  { emoji: '😊', label: 'Good' },
  { emoji: '🔥', label: 'In the zone' },
]

const MOCK_ENTRIES = [
  {
    _id: '1',
    date: subDays(new Date(), 1).toISOString(),
    mood: '😊',
    content: 'Solid session today. Stuck to my plan on the TSLA trade and let winners run. The breakout at $245 was clean — exactly the setup I was looking for. Need to work on not jumping in too early on FOMO signals.',
    tradeIds: ['TSLA', 'NVDA'],
    tags: ['disciplined', 'breakout'],
    tradesCount: 3,
    pnl: 680,
  },
  {
    _id: '2',
    date: subDays(new Date(), 3).toISOString(),
    mood: '😤',
    content: 'Revenge traded after the BTC loss. Should have walked away. Entered SPY without a clear setup — exactly the pattern I keep repeating on bad days. Taking tomorrow off.',
    tradeIds: ['BTC', 'SPY'],
    tags: ['revenge-trade', 'emotional'],
    tradesCount: 4,
    pnl: -540,
  },
]

export default function Journal() {
  const [entries, setEntries] = useState(MOCK_ENTRIES)
  const [selected, setSelected] = useState(null)
  const [isWriting, setIsWriting] = useState(false)
  const [draft, setDraft] = useState({ content: '', mood: '😊', tags: '' })
  const [saving, setSaving] = useState(false)

  const today = format(new Date(), 'yyyy-MM-dd')
  const hasEntryToday = entries.some(e => format(parseISO(e.date), 'yyyy-MM-dd') === today)

  const saveEntry = async () => {
    if (!draft.content.trim()) return toast.error('Write something first')
    setSaving(true)
    try {
      const newEntry = {
        _id: Date.now().toString(),
        date: new Date().toISOString(),
        mood: draft.mood,
        content: draft.content,
        tags: draft.tags.split(',').map(t => t.trim()).filter(Boolean),
        tradesCount: 0,
        pnl: 0,
      }
      // await api.post('/journal', newEntry)  // Uncomment when backend is ready
      setEntries(prev => [newEntry, ...prev])
      setSelected(newEntry)
      setIsWriting(false)
      setDraft({ content: '', mood: '😊', tags: '' })
      toast.success('Entry saved')
    } catch {
      toast.error('Failed to save entry')
    } finally {
      setSaving(false)
    }
  }

  const card = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px' }
  const inp = {
    width: '100%', padding: '10px 12px', borderRadius: '8px', fontSize: '13px',
    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', outline: 'none', resize: 'none',
  }

  return (
    <div className="flex flex-col md:flex-row gap-5 max-w-7xl mx-auto h-full" style={{ minHeight: '70vh' }}>
      {/* Sidebar: entry list */}
      <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-3">
        <button
          onClick={() => { setIsWriting(true); setSelected(null) }}
          disabled={hasEntryToday && !isWriting}
          className="w-full py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
          style={{ background: 'var(--accent-cyan)', color: 'var(--bg-primary)' }}
        >
          {hasEntryToday ? '✓ Entry logged today' : '+ Write today\'s entry'}
        </button>

        <div className="flex flex-col gap-2 overflow-y-auto max-h-48 md:max-h-none">
          {entries.map(entry => (
            <button
              key={entry._id}
              onClick={() => { setSelected(entry); setIsWriting(false) }}
              className="text-left p-3 rounded-xl transition-all"
              style={{
                ...card,
                background: selected?._id === entry._id ? 'var(--bg-hover)' : 'var(--bg-card)',
                border: selected?._id === entry._id ? '1px solid var(--border-hover)' : '1px solid var(--border)',
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                  {formatDate(entry.date, 'MMM dd, yyyy')}
                </span>
                <span className="text-base">{entry.mood}</span>
              </div>
              <p className="text-xs line-clamp-2 mb-2" style={{ color: 'var(--text-secondary)' }}>
                {entry.content}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono"
                  style={{ color: entry.pnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                  {entry.pnl >= 0 ? '+' : ''}${entry.pnl}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {entry.tradesCount} trades
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 rounded-xl overflow-hidden" style={card}>
        {isWriting ? (
          <div className="flex flex-col h-full p-4 md:p-6 gap-4" style={{ minHeight: '500px' }}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {format(new Date(), 'EEEE, MMMM d')}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>How was your session today?</p>
              </div>
              <button onClick={() => setIsWriting(false)} style={{ color: 'var(--text-muted)', fontSize: '18px' }}>×</button>
            </div>

            {/* Mood selector */}
            <div>
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Mood</p>
              <div className="flex gap-2 md:gap-3 flex-wrap">
                {MOODS.map(m => (
                  <button
                    key={m.label}
                    onClick={() => setDraft(d => ({ ...d, mood: m.emoji }))}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg transition-all"
                    style={{
                      background: draft.mood === m.emoji ? 'var(--bg-hover)' : 'transparent',
                      border: `1px solid ${draft.mood === m.emoji ? 'var(--border-hover)' : 'var(--border)'}`,
                    }}
                  >
                    <span className="text-2xl">{m.emoji}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col">
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Reflection</p>
              <textarea
                style={{ ...inp, flex: 1, minHeight: '200px' }}
                placeholder="What happened today? What did you do well? What mistakes did you make? What will you do differently tomorrow?"
                value={draft.content}
                onChange={e => setDraft(d => ({ ...d, content: e.target.value }))}
                autoFocus
              />
            </div>

            {/* Tags */}
            <div>
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Tags (comma separated)</p>
              <input
                style={{ ...inp, resize: undefined }}
                placeholder="disciplined, breakout, fomo, emotional..."
                value={draft.tags}
                onChange={e => setDraft(d => ({ ...d, tags: e.target.value }))}
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
              <button onClick={() => setIsWriting(false)}
                className="px-4 py-2 rounded-lg text-sm"
                style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                Cancel
              </button>
              <button onClick={saveEntry} disabled={saving}
                className="px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
                style={{ background: 'var(--accent-cyan)', color: 'var(--bg-primary)' }}>
                {saving ? 'Saving...' : 'Save entry'}
              </button>
            </div>
          </div>
        ) : selected ? (
          <div className="p-4 md:p-6 flex flex-col gap-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {formatDate(selected.date, 'EEEE, MMMM d, yyyy')}
                </h2>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-2xl">{selected.mood}</span>
                  <span className="text-sm font-mono"
                    style={{ color: selected.pnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                    {selected.pnl >= 0 ? '+' : ''}${selected.pnl}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {selected.tradesCount} trades
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-xl p-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
                {selected.content}
              </p>
            </div>

            {selected.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selected.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 rounded-lg text-xs"
                    style={{ background: 'rgba(88,130,255,0.12)', color: 'var(--accent-blue)', border: '1px solid rgba(88,130,255,0.2)' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 p-6">
            <span className="text-4xl">✦</span>
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Select an entry or write today's reflection</p>
            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              Daily journaling helps identify emotional patterns that affect your trading
            </p>
            <button onClick={() => setIsWriting(true)}
              className="mt-2 px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: 'var(--accent-cyan)', color: 'var(--bg-primary)' }}>
              Write today's entry
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
