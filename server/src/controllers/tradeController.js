import Trade from '../models/Trade.js'

// GET /api/trades
export const getTrades = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 20,
      symbol, type, result, mistake,
      dateFrom, dateTo, strategy,
      sort = '-entryDate',
    } = req.query

    const filter = { userId: req.user._id }

    if (symbol) filter.symbol = new RegExp(symbol, 'i')
    if (type)   filter.type = type
    if (strategy) filter.strategy = new RegExp(strategy, 'i')
    if (mistake) filter.mistakes = mistake
    if (result === 'win')  filter.pnl = { $gt: 0 }
    if (result === 'loss') filter.pnl = { $lt: 0 }
    if (dateFrom || dateTo) {
      filter.entryDate = {}
      if (dateFrom) filter.entryDate.$gte = new Date(dateFrom)
      if (dateTo)   filter.entryDate.$lte = new Date(dateTo)
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [trades, total] = await Promise.all([
      Trade.find(filter).sort(sort).skip(skip).limit(parseInt(limit)).lean(),
      Trade.countDocuments(filter),
    ])

    res.json({ trades, total, page: parseInt(page), pages: Math.ceil(total / limit) })
  } catch (err) { next(err) }
}

// GET /api/trades/:id
export const getTrade = async (req, res, next) => {
  try {
    const trade = await Trade.findOne({ _id: req.params.id, userId: req.user._id })
    if (!trade) return res.status(404).json({ message: 'Trade not found' })
    res.json({ trade })
  } catch (err) { next(err) }
}

// POST /api/trades
export const createTrade = async (req, res, next) => {
  try {
    const data = { ...req.body, userId: req.user._id }
    // Preserve manual pnl and riskReward — don't let pre-save overwrite them
    if (req.body.pnl !== undefined && req.body.pnl !== '') {
      data.pnl = parseFloat(req.body.pnl)
    }
    if (req.body.riskReward !== undefined && req.body.riskReward !== '') {
      data.riskReward = parseFloat(req.body.riskReward)
    }
    const trade = new Trade(data)
    await trade.save()
    res.status(201).json({ trade })
  } catch (err) { next(err) }
}

// PUT /api/trades/:id
export const updateTrade = async (req, res, next) => {
  try {
    const updateData = { ...req.body }
    // Preserve manual pnl and riskReward on update too
    if (req.body.pnl !== undefined && req.body.pnl !== '') {
      updateData.pnl = parseFloat(req.body.pnl)
    }
    if (req.body.riskReward !== undefined && req.body.riskReward !== '') {
      updateData.riskReward = parseFloat(req.body.riskReward)
    }
    const trade = await Trade.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData,
      { new: true, runValidators: true }
    )
    if (!trade) return res.status(404).json({ message: 'Trade not found' })
    res.json({ trade })
  } catch (err) { next(err) }
}

// DELETE /api/trades/:id
export const deleteTrade = async (req, res, next) => {
  try {
    const trade = await Trade.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
    if (!trade) return res.status(404).json({ message: 'Trade not found' })
    res.json({ message: 'Trade deleted' })
  } catch (err) { next(err) }
}

// POST /api/trades/:id/screenshots
export const uploadScreenshot = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
    const trade = await Trade.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $push: { screenshots: req.file.path } },
      { new: true }
    )
    if (!trade) return res.status(404).json({ message: 'Trade not found' })
    res.json({ screenshots: trade.screenshots })
  } catch (err) { next(err) }
}
