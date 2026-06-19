import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useUIStore, useTradeStore } from '@/store/useStore'
import { useTrades } from '@/hooks/useTrades'
import { MISTAKE_OPTIONS, EMOTION_OPTIONS, STRATEGY_OPTIONS } from '@/utils'
import MultiSelect from '@/components/UI/MultiSelect'

export default function TradeFormModal() {
  const { closeTradeForm, editingTradeId } = useUIStore()
  const { trades } = useTradeStore()
  const { createTrade, editTrade } = useTrades()

  const editingTrade = editingTradeId
    ? trades.find((t) => t._id === editingTradeId)
    : null

  const {
    register, handleSubmit, watch, setValue, control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      symbol: '',
      assetType: 'Stock',
      type: 'long',
      entryPrice: '',
      exitPrice: '',
      stopLoss: '',
      quantity: '',
      pnl: '',
      riskReward: '',
      entryDate: new Date().toISOString().slice(0, 16),
      exitDate: '',
      strategy: '',
      mistakes: [],
      emotions: [],
      notes: '',
      ...editingTrade,
    },
  })

  const type = watch('type')

  useEffect(() => {
    if (editingTrade) reset(editingTrade)
  }, [editingTrade])

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      entryPrice: +data.entryPrice,
      exitPrice: data.exitPrice ? +data.exitPrice : undefined,
      stopLoss: data.stopLoss ? +data.stopLoss : undefined,
      quantity: +data.quantity,
      pnl: data.pnl !== '' ? +data.pnl : undefined,
      riskReward: data.riskReward !== '' ? +data.riskReward : undefined,
    }
    if (editingTradeId) {
      await editTrade(editingTradeId, payload)
    } else {
      await createTrade(payload)
    }
    closeTradeForm()
  }

  const inputStyle = {
    width: '100%', padding: '8px 12px', borderRadius: '8px', fontSize: '13px',
    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
    color: 'var(--text-primary)', outline: 'none',
  }

  const labelStyle = {
    display: 'block', fontSize: '11px', color: 'var(--text-secondary)',
    marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => e.target === e.currentTarget && closeTradeForm()}
    >
      <div
        className="w-full max-w-2xl rounded-xl overflow-hidden flex flex-col"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            {editingTradeId ? 'Edit Trade' : 'Log New Trade'}
          </h2>
          <button onClick={closeTradeForm} style={{ color: 'var(--text-muted)', fontSize: '20px' }}>×</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto flex-1 px-6 py-5">

          {/* Row 1: Symbol + Asset + Direction */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <label style={labelStyle}>Symbol *</label>
              <input {...register('symbol', { required: 'Required' })}
                placeholder="NIFTY, RELIANCE..." style={{ ...inputStyle, textTransform: 'uppercase' }} />
              {errors.symbol && <p className="text-xs mt-1" style={{ color: 'var(--accent-red)' }}>{errors.symbol.message}</p>}
            </div>
            <div>
              <label style={labelStyle}>Asset type</label>
              <select {...register('assetType')} style={inputStyle}>
                {['Stock', 'Crypto', 'Forex', 'Futures', 'Options', 'ETF'].map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Direction *</label>
              <div className="flex gap-2">
                {['long', 'short'].map(t => (
                  <button key={t} type="button" onClick={() => setValue('type', t)}
                    className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                    style={{
                      background: type === t ? (t === 'long' ? 'rgba(0,200,150,0.15)' : 'rgba(232,64,64,0.15)') : 'var(--bg-secondary)',
                      color: type === t ? (t === 'long' ? 'var(--accent-green)' : 'var(--accent-red)') : 'var(--text-secondary)',
                      border: `1px solid ${type === t ? (t === 'long' ? 'var(--accent-green)' : 'var(--accent-red)') : 'var(--border)'}`,
                    }}>
                    {t === 'long' ? '▲ Long' : '▼ Short'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Prices */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { name: 'entryPrice', label: 'Entry Price *', required: true },
              { name: 'exitPrice', label: 'Exit Price', required: false },
              { name: 'stopLoss', label: 'Stop Loss', required: false },
              { name: 'quantity', label: 'Quantity *', required: true },
            ].map(({ name, label, required }) => (
              <div key={name}>
                <label style={labelStyle}>{label}</label>
                <input type="number" step="any" placeholder="0.00"
                  {...register(name, { required: required ? 'Required' : false })}
                  style={inputStyle} />
                {errors[name] && <p className="text-xs mt-1" style={{ color: 'var(--accent-red)' }}>{errors[name].message}</p>}
              </div>
            ))}
          </div>

          {/* Row 3: Manual P&L + R:R */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label style={labelStyle}>P&L (your actual profit/loss)</label>
              <input type="number" step="any"
                {...register('pnl')}
                placeholder="e.g. 2500 or -1200"
                style={{
                  ...inputStyle,
                  border: '1px solid var(--accent-cyan)',
                  background: 'rgba(0,212,255,0.05)',
                }} />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Enter positive for profit, negative for loss
              </p>
            </div>
            <div>
              <label style={labelStyle}>Risk:Reward ratio</label>
              <input type="number" step="any"
                {...register('riskReward')}
                placeholder="e.g. 2.5"
                style={inputStyle} />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                e.g. 2.5 means 2.5R
              </p>
            </div>
          </div>

          {/* Row 4: Dates */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label style={labelStyle}>Entry Date *</label>
              <input type="datetime-local" {...register('entryDate', { required: 'Required' })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Exit Date</label>
              <input type="datetime-local" {...register('exitDate')} style={inputStyle} />
            </div>
          </div>

          {/* Strategy */}
          <div className="mb-4">
            <label style={labelStyle}>Strategy</label>
            <select {...register('strategy')} style={inputStyle}>
              <option value="">Select strategy...</option>
              {STRATEGY_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Mistakes */}
          <div className="mb-4">
            <label style={labelStyle}>Mistakes made</label>
            <Controller name="mistakes" control={control}
              render={({ field }) => (
                <MultiSelect options={MISTAKE_OPTIONS} value={field.value} onChange={field.onChange} color="amber" />
              )} />
          </div>

          {/* Emotions */}
          <div className="mb-4">
            <label style={labelStyle}>Emotions</label>
            <Controller name="emotions" control={control}
              render={({ field }) => (
                <MultiSelect options={EMOTION_OPTIONS} value={field.value} onChange={field.onChange} color="blue" />
              )} />
          </div>

          {/* Notes */}
          <div className="mb-5">
            <label style={labelStyle}>Notes</label>
            <textarea {...register('notes')} rows={3}
              placeholder="What happened? What would you do differently?"
              style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6' }} />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={closeTradeForm}
              className="px-4 py-2 rounded-lg text-sm"
              style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}
              className="px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60"
              style={{ background: 'var(--accent-cyan)', color: 'var(--bg-primary)' }}>
              {isSubmitting ? 'Saving...' : editingTradeId ? 'Update Trade' : 'Log Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

