import { format, parseISO, isValid } from 'date-fns'

// ─── Number formatters ────────────────────────────────────────
export const formatCurrency = (value, showSign = false) => {
  const abs = Math.abs(value)
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(abs)

  if (showSign || value !== 0) {
    return value >= 0 ? `+${formatted}` : `-${formatted}`
  }
  return formatted
}

export const formatPct = (value, decimals = 1) => {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(decimals)}%`
}

export const formatRR = (value) => {
  if (!value || isNaN(value)) return '—'
  return `${value.toFixed(2)}R`
}

// ─── Date formatters ─────────────────────────────────────────
export const formatDate = (date, fmt = 'MMM dd, yyyy') => {
  if (!date) return '—'
  const d = typeof date === 'string' ? parseISO(date) : date
  return isValid(d) ? format(d, fmt) : '—'
}

export const formatDateShort = (date) => formatDate(date, 'MMM dd')

export const formatDateTime = (date) => formatDate(date, 'MMM dd, yyyy HH:mm')

// ─── Trade calculations ───────────────────────────────────────
export const calcPnL = (type, entry, exit, quantity) => {
  if (!entry || !exit || !quantity) return 0
  const raw = type === 'long'
    ? (exit - entry) * quantity
    : (entry - exit) * quantity
  return parseFloat(raw.toFixed(2))
}

export const calcRiskReward = (type, entry, exit, stopLoss) => {
  if (!entry || !exit || !stopLoss) return null
  const reward = type === 'long' ? exit - entry : entry - exit
  const risk = type === 'long' ? entry - stopLoss : stopLoss - entry
  if (risk <= 0) return null
  return parseFloat((reward / risk).toFixed(2))
}

export const calcWinRate = (trades) => {
  if (!trades.length) return 0
  const wins = trades.filter((t) => t.pnl > 0).length
  return parseFloat(((wins / trades.length) * 100).toFixed(1))
}

export const calcProfitFactor = (trades) => {
  const gross = trades.reduce(
    (acc, t) => {
      if (t.pnl > 0) acc.win += t.pnl
      else acc.loss += Math.abs(t.pnl)
      return acc
    },
    { win: 0, loss: 0 }
  )
  if (gross.loss === 0) return gross.win > 0 ? Infinity : 0
  return parseFloat((gross.win / gross.loss).toFixed(2))
}

export const calcMaxDrawdown = (equityCurve) => {
  let peak = -Infinity
  let maxDD = 0
  for (const point of equityCurve) {
    if (point.equity > peak) peak = point.equity
    const dd = peak - point.equity
    if (dd > maxDD) maxDD = dd
  }
  return -maxDD
}

// ─── Misc helpers ─────────────────────────────────────────────
export const getPnLClass = (value) =>
  value >= 0 ? 'pnl-pos' : 'pnl-neg'

export const getTypeClass = (type) =>
  type === 'long' ? 'tag-long' : 'tag-short'

export const MISTAKE_OPTIONS = [
  'FOMO entry',
  'No stop loss',
  'Oversized position',
  'Early exit',
  'Revenge trade',
  'Chasing price',
  'Ignored setup rules',
  'Emotional trade',
  'Wrong time frame',
  'Poor risk/reward',
  'News trading',
  'Over-trading',
]

export const EMOTION_OPTIONS = [
  'Calm',
  'Confident',
  'Anxious',
  'Fearful',
  'Greedy',
  'Frustrated',
  'Impatient',
  'Euphoric',
  'Hesitant',
  'Bored',
]

export const STRATEGY_OPTIONS = [
  'Breakout',
  'Trend follow',
  'Mean reversion',
  'Scalp',
  'Swing',
  'News play',
  'Gap fill',
  'Support/Resistance',
  'Moving average crossover',
  'Other',
]

export const ASSET_TYPES = ['Stock', 'Crypto', 'Forex', 'Futures', 'Options', 'ETF']
