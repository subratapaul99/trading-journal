import Trade from '../models/Trade.js'
import { startOfDay, endOfDay, subDays, subMonths, subWeeks, format } from 'date-fns'

const getRangeFilter = (range) => {
  const now = new Date()
  const map = {
    '1W': subWeeks(now, 1),
    '1M': subMonths(now, 1),
    '3M': subMonths(now, 3),
    '6M': subMonths(now, 6),
  }
  return map[range] ? { $gte: map[range] } : undefined
}

// GET /api/analytics/summary
export const getSummary = async (req, res, next) => {
  try {
    const { range } = req.query
    const dateFilter = getRangeFilter(range)
    const match = { userId: req.user._id, status: 'closed' }
    if (dateFilter) match.entryDate = dateFilter

    const trades = await Trade.find(match).lean()
    if (!trades.length) return res.json({ netPnl: 0, winRate: 0, totalTrades: 0, wins: 0, losses: 0 })

    const wins   = trades.filter(t => t.pnl > 0)
    const losses = trades.filter(t => t.pnl < 0)
    const netPnl = trades.reduce((s, t) => s + t.pnl, 0)
    const grossWin  = wins.reduce((s, t) => s + t.pnl, 0)
    const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0))

    const rrTrades = trades.filter(t => t.riskReward)
    const avgRR = rrTrades.length ? rrTrades.reduce((s, t) => s + t.riskReward, 0) / rrTrades.length : 0

    // Win rate by day of week
    const dayMap = { 0:'Sun',1:'Mon',2:'Tue',3:'Wed',4:'Thu',5:'Fri',6:'Sat' }
    const byDay = {}
    trades.forEach(t => {
      const dow = new Date(t.entryDate).getDay()
      const label = dayMap[dow]
      if (!byDay[label]) byDay[label] = { wins: 0, total: 0 }
      byDay[label].total++
      if (t.pnl > 0) byDay[label].wins++
    })
    const winRateByDay = Object.entries(byDay).map(([day, d]) => ({
      day,
      winRate: Math.round((d.wins / d.total) * 100),
      trades: d.total,
    }))

    // Open positions
    const open = await Trade.find({ userId: req.user._id, status: 'open' }).lean()
    const openPnl = open.reduce((s, t) => {
      // Unrealized: just use difference from entry (no exit yet)
      return s
    }, 0)

    res.json({
      netPnl: parseFloat(netPnl.toFixed(2)),
      winRate: parseFloat(((wins.length / trades.length) * 100).toFixed(1)),
      totalTrades: trades.length,
      wins: wins.length,
      losses: losses.length,
      avgRR: parseFloat(avgRR.toFixed(2)),
      profitFactor: grossLoss > 0 ? parseFloat((grossWin / grossLoss).toFixed(2)) : 0,
      bestTrade:  Math.max(...trades.map(t => t.pnl)),
      worstTrade: Math.min(...trades.map(t => t.pnl)),
      avgTrade:   parseFloat((netPnl / trades.length).toFixed(2)),
      winRateByDay,
      openPositions: open.length,
      openPnl,
    })
  } catch (err) { next(err) }
}

// GET /api/analytics/equity-curve
export const getEquityCurve = async (req, res, next) => {
  try {
    const { range } = req.query
    const dateFilter = getRangeFilter(range)
    const match = { userId: req.user._id, status: 'closed' }
    if (dateFilter) match.exitDate = dateFilter

    const trades = await Trade.find(match).sort('exitDate').lean()

    let equity = 0
    const curve = trades.map(t => {
      equity += t.pnl
      return {
        date: t.exitDate,
        equity: parseFloat(equity.toFixed(2)),
        pnl: t.pnl,
        symbol: t.symbol,
      }
    })

    res.json({ curve })
  } catch (err) { next(err) }
}

// GET /api/analytics/mistakes
export const getMistakes = async (req, res, next) => {
  try {
    const { range } = req.query
    const dateFilter = getRangeFilter(range)
    const match = { userId: req.user._id }
    if (dateFilter) match.entryDate = dateFilter

    const trades = await Trade.find(match).lean()
    const total  = trades.length || 1

    const mistakeMap = {}
    trades.forEach(t => {
      ;(t.mistakes || []).forEach(m => {
        if (!mistakeMap[m]) mistakeMap[m] = { count: 0, wins: 0, pnlSum: 0 }
        mistakeMap[m].count++
        if (t.pnl > 0) mistakeMap[m].wins++
        mistakeMap[m].pnlSum += t.pnl
      })
    })

    const mistakes = Object.entries(mistakeMap)
      .map(([name, d]) => ({
        name,
        count: d.count,
        pct: Math.round((d.count / total) * 100),
        winRate: Math.round((d.wins / d.count) * 100),
        avgPnl: parseFloat((d.pnlSum / d.count).toFixed(2)),
        totalImpact: parseFloat(d.pnlSum.toFixed(2)),
      }))
      .sort((a, b) => b.count - a.count)

    res.json({ mistakes })
  } catch (err) { next(err) }
}

// GET /api/analytics/calendar
export const getCalendar = async (req, res, next) => {
  try {
    const { range } = req.query
    const dateFilter = getRangeFilter(range)
    const match = { userId: req.user._id, status: 'closed' }
    if (dateFilter) match.exitDate = dateFilter

    const trades = await Trade.find(match).lean()

    const calendar = {}
    trades.forEach(t => {
      const key = format(new Date(t.exitDate), 'yyyy-MM-dd')
      calendar[key] = (calendar[key] || 0) + t.pnl
    })

    // Round values
    Object.keys(calendar).forEach(k => {
      calendar[k] = parseFloat(calendar[k].toFixed(2))
    })

    res.json({ calendar })
  } catch (err) { next(err) }
}
