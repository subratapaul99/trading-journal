import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { connectDB } from './utils/db.js'
import authRoutes from './routes/auth.js'
import tradeRoutes from './routes/trades.js'
import analyticsRoutes from './routes/analytics.js'
import journalRoutes from './routes/journal.js'
import aiRoutes from './routes/ai.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()
const PORT = process.env.PORT || 5000

// ─── Connect DB ───────────────────────────────────────────────
await connectDB()

// ─── Security middleware ──────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ─── Rate limiting ────────────────────────────────────────────
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 })
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 })
app.use('/api', limiter)
app.use('/api/auth', authLimiter)

// ─── Routes ───────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/trades', tradeRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/journal', journalRoutes)
app.use('/api/ai', aiRoutes)

// ─── Health check ─────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok', ts: new Date() }))

// ─── Global error handler ─────────────────────────────────────
app.use(errorHandler)

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
