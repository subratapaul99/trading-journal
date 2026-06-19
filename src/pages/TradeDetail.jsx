import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTradeStore, useUIStore } from '@/store/useStore'
import { tradesAPI } from '@/services/api'
import { formatCurrency, formatDateTime, MISTAKE_OPTIONS, EMOTION_OPTIONS } from '@/utils'
import toast from 'react-hot-toast'

export default function TradeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { selectedTrade, setSelectedTrade, updateTrade, removeTrade } = useTradeStore()
  const { openTradeForm } = useUIStore()
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setLoading(true)
    tradesAPI.getOne(id)
      .then(r => setSelectedTrade(r.data.trade))
      .catch(() => navigate('/trades'))
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!confirm('Delete this trade? This cannot be undone.')) return
    setDeleting(true)
    try {
      await tradesAPI.delete(id)
      removeTrade(id)
      toast.success('Trade deleted')
      navigate('/trades')
    } catch { toast.error('Failed to delete') }
    finally { setDeleting(false) }
  }

  const handleScreenshot = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { data } = await tradesAPI.uploadScreenshot(id, file)
      updateTrade(id, { screenshots: data.screenshots })
      setSelectedTrade({ ...selectedTrade, screenshots: data.screenshots })
      toast.success('Screenshot uploaded')
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--accent-cyan)' }} />
    </div>
  )

  const t = selectedTrade
  if (!t) return null

  const card = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }
  const isWin = t.pnl >= 0

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/trades')}
          className="text-sm transition-colors"
          style={{ color: 'var(--text-secondary)' }}>
          ← Back
        </button>
        <div className="flex items-center gap-3 flex-1">
          <h1 className="text-xl font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>{t.symbol}</h1>
          <span className="px-2.5 py-1 rounded-lg text-xs font-medium"
            style={t.type === 'long'
              ? { background: 'rgba(0,200,150,0.12)', color: 'var(--accent-green)' }
              : { background: 'rgba(232,64,64,0.12)', color: 'var(--accent-red)' }}>
            {t.type === 'long' ? '▲' : '▼'} {t.type}
          </span>
          {t.strategy && (
            <span className="px-2 py-0.5 rounded text-xs"
              style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              {t.strategy}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-2xl font-mono font-semibold"
              style={{ color: isWin ? 'var(--accent-green)' : 'var(--accent-red)' }}>
              {formatCurrency(t.pnl, true)}
            </p>
            {t.riskReward && (
              <p className="text-xs font-mono mt-0.5" style={{ color: 'var(--accent-blue)' }}>
                {t.riskReward}R
              </p>
            )}
          </div>
          <button onClick={() => openTradeForm(id)}
            className="px-3 py-1.5 rounded-lg text-xs transition-all"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
            ✎ Edit
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="px-3 py-1.5 rounded-lg text-xs transition-all disabled:opacity-50"
            style={{ background: 'rgba(232,64,64,0.1)', color: 'var(--accent-red)', border: '1px solid rgba(232,64,64,0.2)' }}>
            {deleting ? '...' : '✕ Delete'}
          </button>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-3 gap-5">
        {/* Trade details */}
        <div style={card}>
          <h2 className="text-xs uppercase tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>Trade Details</h2>
          <div className="flex flex-col gap-3">
            {[
              ['Entry price', `$${t.entryPrice}`, 'var(--text-primary)'],
              ['Exit price', t.exitPrice ? `$${t.exitPrice}` : 'Open', t.exitPrice ? 'var(--text-primary)' : 'var(--accent-amber)'],
              ['Stop loss', t.stopLoss ? `$${t.stopLoss}` : '—', 'var(--text-primary)'],
              ['Quantity', t.quantity, 'var(--text-primary)'],
              ['Asset type', t.assetType || '—', 'var(--text-primary)'],
            ].map(([label, value, color]) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                <span className="text-sm font-mono" style={{ color }}>{value}</span>
              </div>
            ))}
            <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }} />
            {[
              ['Entry time', formatDateTime(t.entryDate)],
              ['Exit time', t.exitDate ? formatDateTime(t.exitDate) : '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance */}
        <div style={card}>
          <h2 className="text-xs uppercase tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>Performance</h2>
          <div className="flex flex-col gap-4">
            {/* P&L visual */}
            <div className="rounded-lg p-3 text-center"
              style={{ background: isWin ? 'rgba(0,200,150,0.08)' : 'rgba(232,64,64,0.08)', border: `1px solid ${isWin ? 'rgba(0,200,150,0.2)' : 'rgba(232,64,64,0.2)'}` }}>
              <p className="text-3xl font-mono font-semibold"
                style={{ color: isWin ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {formatCurrency(t.pnl, true)}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {isWin ? 'Winning' : 'Losing'} trade
              </p>
            </div>
            {[
              ['Risk/Reward', t.riskReward ? `${t.riskReward}R` : '—', 'var(--accent-blue)'],
              ['Move', t.entryPrice && t.exitPrice ? `${(((t.exitPrice - t.entryPrice) / t.entryPrice) * 100).toFixed(2)}%` : '—', 'var(--text-primary)'],
              ['Position value', t.entryPrice && t.quantity ? formatCurrency(t.entryPrice * t.quantity) : '—', 'var(--text-primary)'],
            ].map(([label, value, color]) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                <span className="text-sm font-mono font-medium" style={{ color }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Psychology */}
        <div style={card}>
          <h2 className="text-xs uppercase tracking-wider mb-4" style={{ color: 'var(--text-secondary)' }}>Psychology</h2>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Mistakes</p>
              <div className="flex flex-wrap gap-1.5">
                {t.mistakes?.length ? t.mistakes.map(m => (
                  <span key={m} className="px-2 py-1 rounded-lg text-xs"
                    style={{ background: 'rgba(245,158,11,0.12)', color: 'var(--accent-amber)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    {m}
                  </span>
                )) : <span className="text-xs" style={{ color: 'var(--text-muted)' }}>None logged ✓</span>}
              </div>
            </div>
            <div>
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Emotions</p>
              <div className="flex flex-wrap gap-1.5">
                {t.emotions?.length ? t.emotions.map(e => (
                  <span key={e} className="px-2 py-1 rounded-lg text-xs"
                    style={{ background: 'rgba(88,130,255,0.12)', color: 'var(--accent-blue)', border: '1px solid rgba(88,130,255,0.2)' }}>
                    {e}
                  </span>
                )) : <span className="text-xs" style={{ color: 'var(--text-muted)' }}>None logged</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes + Screenshots */}
      <div className="grid grid-cols-2 gap-5">
        <div style={card}>
          <h2 className="text-xs uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>Notes</h2>
          {t.notes ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
              {t.notes}
            </p>
          ) : (
            <div className="py-6 text-center">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No notes for this trade.</p>
              <button onClick={() => openTradeForm(id)}
                className="mt-2 text-xs" style={{ color: 'var(--accent-cyan)' }}>
                Add notes →
              </button>
            </div>
          )}
        </div>

        <div style={card}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Screenshots</h2>
            <label className="cursor-pointer px-3 py-1 rounded-lg text-xs transition-all"
              style={{ background: 'var(--bg-hover)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
              {uploading ? 'Uploading...' : '+ Upload'}
              <input type="file" accept="image/*" className="hidden" onChange={handleScreenshot} disabled={uploading} />
            </label>
          </div>
          {t.screenshots?.length ? (
            <div className="grid grid-cols-2 gap-2">
              {t.screenshots.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noreferrer">
                  <img src={url} alt={`Screenshot ${i + 1}`}
                    className="w-full rounded-lg object-cover transition-opacity hover:opacity-80"
                    style={{ height: '120px', border: '1px solid var(--border)' }} />
                </a>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center rounded-lg"
              style={{ background: 'var(--bg-secondary)', border: '2px dashed var(--border)' }}>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                No screenshots yet.<br />Upload chart images for reference.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
