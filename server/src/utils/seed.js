/**
 * Seed script — populates DB with realistic demo data
 * Usage: node src/utils/seed.js
 */

import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDB } from './db.js'
import User from '../models/User.js'
import Trade from '../models/Trade.js'
import Journal from '../models/Journal.js'

const SYMBOLS   = ['AAPL', 'TSLA', 'NVDA', 'AMZN', 'MSFT', 'BTC', 'ETH', 'SPY', 'QQQ', 'AMD']
const STRATEGIES = ['Breakout', 'Trend follow', 'Mean reversion', 'Scalp', 'Gap fill', 'Support/Resistance']
const MISTAKES  = ['FOMO entry', 'No stop loss', 'Oversized position', 'Early exit', 'Revenge trade', 'Chasing price']
const EMOTIONS  = ['Calm', 'Confident', 'Anxious', 'Greedy', 'Frustrated', 'Impatient']
const MOODS     = ['😊', '😐', '🔥', '😰', '😤']

const rand = (min, max) => Math.random() * (max - min) + min
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const pickN = (arr, n) => arr.sort(() => 0.5 - Math.random()).slice(0, n)
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d }

async function seed() {
  await connectDB()

  // Clear existing data
  await Promise.all([User.deleteMany({}), Trade.deleteMany({}), Journal.deleteMany({})])
  console.log('🗑  Cleared existing data')

  // Create demo user
  const user = await User.create({
    name: 'Demo Trader',
    email: 'demo@tradelog.io',
    password: 'password123',
  })
  console.log(`👤 Created user: ${user.email} / password123`)

  // Generate 90 days of trades
  const trades = []
  for (let day = 89; day >= 0; day--) {
    // Skip weekends
    const date = daysAgo(day)
    if (date.getDay() === 0 || date.getDay() === 6) continue

    // 1–4 trades per day, skip some days
    if (Math.random() < 0.25) continue
    const numTrades = Math.floor(rand(1, 4))

    for (let t = 0; t < numTrades; t++) {
      const symbol    = pick(SYMBOLS)
      const type      = Math.random() > 0.45 ? 'long' : 'short'
      const entryPrice = parseFloat(rand(50, 800).toFixed(2))
      const isWin     = Math.random() > 0.38  // 62% win rate
      const movePct   = isWin ? rand(0.5, 4.5) : rand(0.3, 3.0)
      const exitPrice = type === 'long'
        ? parseFloat((entryPrice * (1 + (isWin ? 1 : -1) * movePct / 100)).toFixed(2))
        : parseFloat((entryPrice * (1 - (isWin ? 1 : -1) * movePct / 100)).toFixed(2))
      const stopLoss  = type === 'long'
        ? parseFloat((entryPrice * 0.98).toFixed(2))
        : parseFloat((entryPrice * 1.02).toFixed(2))
      const quantity  = Math.floor(rand(10, 200))

      const entryDate = new Date(date)
      entryDate.setHours(Math.floor(rand(9, 15)), Math.floor(rand(0, 59)))
      const exitDate = new Date(entryDate)
      exitDate.setHours(exitDate.getHours() + Math.floor(rand(1, 6)))

      const hasMistake = !isWin && Math.random() > 0.3
      const mistakes   = hasMistake ? pickN(MISTAKES, Math.floor(rand(1, 3))) : []
      const emotions   = pickN(EMOTIONS, Math.floor(rand(1, 3)))
      const strategy   = pick(STRATEGIES)

      trades.push({
        userId: user._id,
        symbol,
        assetType: ['BTC', 'ETH'].includes(symbol) ? 'Crypto' : 'Stock',
        type,
        entryPrice,
        exitPrice,
        stopLoss,
        quantity,
        entryDate,
        exitDate,
        strategy,
        mistakes,
        emotions,
        status: 'closed',
        notes: isWin
          ? `Clean ${strategy.toLowerCase()} setup. Followed plan.`
          : `${mistakes[0] || 'Missed setup'} — should have waited for confirmation.`,
      })
    }
  }

  // Bulk insert — pre-save hooks won't run, so calculate pnl manually
  const tradeDocs = trades.map(t => {
    const raw = t.type === 'long'
      ? (t.exitPrice - t.entryPrice) * t.quantity
      : (t.entryPrice - t.exitPrice) * t.quantity
    const pnl = parseFloat(raw.toFixed(2))
    const risk = t.type === 'long' ? t.entryPrice - t.stopLoss : t.stopLoss - t.entryPrice
    const reward = t.type === 'long' ? t.exitPrice - t.entryPrice : t.entryPrice - t.exitPrice
    const riskReward = risk > 0 ? parseFloat((reward / risk).toFixed(2)) : null
    return { ...t, pnl, riskReward }
  })

  const inserted = await Trade.insertMany(tradeDocs)
  console.log(`📈 Created ${inserted.length} trades`)

  // Generate journal entries (every trading day)
  const tradesByDay = {}
  inserted.forEach(t => {
    const key = t.entryDate.toISOString().slice(0, 10)
    if (!tradesByDay[key]) tradesByDay[key] = []
    tradesByDay[key].push(t)
  })

  const journalEntries = Object.entries(tradesByDay).slice(0, 30).map(([dateStr, dayTrades]) => {
    const pnl = dayTrades.reduce((s, t) => s + t.pnl, 0)
    const isGoodDay = pnl > 0
    return {
      userId: user._id,
      date: new Date(dateStr),
      mood: isGoodDay ? pick(['😊', '🔥']) : pick(['😐', '😰', '😤']),
      content: isGoodDay
        ? `Good session today. Made ${dayTrades.length} trade${dayTrades.length > 1 ? 's' : ''} for +$${pnl.toFixed(0)}. ${pick(['Stayed disciplined.', 'Let winners run.', 'Stuck to the plan.', 'Followed my rules.'])}`
        : `Tough day, -$${Math.abs(pnl).toFixed(0)}. ${pick(['Need to cut losses faster.', 'Revenge traded after first loss.', 'Ignored my stop loss rules.', 'Emotions got the better of me today.'])}`,
      tags: isGoodDay ? ['disciplined', 'on-plan'] : ['emotional', 'review'],
      tradeIds: dayTrades.map(t => t._id),
      tradesCount: dayTrades.length,
      pnl: parseFloat(pnl.toFixed(2)),
    }
  })

  await Journal.insertMany(journalEntries)
  console.log(`📓 Created ${journalEntries.length} journal entries`)

  const totalPnl = tradeDocs.reduce((s, t) => s + t.pnl, 0)
  console.log(`\n✅ Seed complete!`)
  console.log(`   Total P&L: $${totalPnl.toFixed(2)}`)
  console.log(`   Login: demo@tradelog.io / password123`)
  process.exit(0)
}

seed().catch(err => { console.error(err); process.exit(1) })
