import Journal from '../models/Journal.js'
import Trade from '../models/Trade.js'
import { startOfDay, endOfDay, format } from 'date-fns'

// GET /api/journal
export const getEntries = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query
    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [entries, total] = await Promise.all([
      Journal.find({ userId: req.user._id })
        .sort('-date')
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Journal.countDocuments({ userId: req.user._id }),
    ])

    res.json({ entries, total })
  } catch (err) { next(err) }
}

// POST /api/journal
export const createEntry = async (req, res, next) => {
  try {
    const { date = new Date(), mood, content, tags } = req.body
    if (!content) return res.status(400).json({ message: 'Content is required' })

    // Check duplicate for date
    const dayStart = startOfDay(new Date(date))
    const dayEnd   = endOfDay(new Date(date))
    const existing = await Journal.findOne({
      userId: req.user._id,
      date: { $gte: dayStart, $lte: dayEnd },
    })
    if (existing) return res.status(400).json({ message: 'Entry already exists for this date' })

    // Attach trades from that day
    const trades = await Trade.find({
      userId: req.user._id,
      entryDate: { $gte: dayStart, $lte: dayEnd },
    }).lean()

    const pnl = trades.reduce((s, t) => s + (t.pnl || 0), 0)

    const entry = await Journal.create({
      userId: req.user._id,
      date: new Date(date),
      mood,
      content,
      tags: tags || [],
      tradeIds: trades.map(t => t._id),
      tradesCount: trades.length,
      pnl: parseFloat(pnl.toFixed(2)),
    })

    res.status(201).json({ entry })
  } catch (err) { next(err) }
}

// PUT /api/journal/:id
export const updateEntry = async (req, res, next) => {
  try {
    const entry = await Journal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    )
    if (!entry) return res.status(404).json({ message: 'Entry not found' })
    res.json({ entry })
  } catch (err) { next(err) }
}

// DELETE /api/journal/:id
export const deleteEntry = async (req, res, next) => {
  try {
    const entry = await Journal.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
    if (!entry) return res.status(404).json({ message: 'Entry not found' })
    res.json({ message: 'Entry deleted' })
  } catch (err) { next(err) }
}
