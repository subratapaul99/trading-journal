import Trade from '../models/Trade.js'

// POST /api/ai/analyze
export const analyzeTrading = async (req, res, next) => {
  try {
    // Gather last 90 days of trades
    const since = new Date()
    since.setDate(since.getDate() - 90)

    const trades = await Trade.find({
      userId: req.user._id,
      entryDate: { $gte: since },
    }).lean()

    if (trades.length < 3) {
      return res.status(400).json({ message: 'Need at least 3 trades for analysis' })
    }

    // Build summary for AI
    const summary = {
      totalTrades: trades.length,
      wins: trades.filter(t => t.pnl > 0).length,
      losses: trades.filter(t => t.pnl < 0).length,
      netPnl: trades.reduce((s, t) => s + t.pnl, 0).toFixed(2),
      mistakes: trades.flatMap(t => t.mistakes || []),
      emotions: trades.flatMap(t => t.emotions || []),
      symbols: [...new Set(trades.map(t => t.symbol))],
      pnlBySymbol: Object.entries(
        trades.reduce((acc, t) => {
          acc[t.symbol] = (acc[t.symbol] || 0) + t.pnl
          return acc
        }, {})
      ).map(([symbol, pnl]) => ({ symbol, pnl: parseFloat(pnl.toFixed(2)) })),
      recentTrades: trades.slice(-10).map(t => ({
        symbol: t.symbol,
        type: t.type,
        pnl: t.pnl,
        mistakes: t.mistakes,
        emotions: t.emotions,
      })),
    }

    // Count mistake frequency
    const mistakeFreq = {}
    summary.mistakes.forEach(m => { mistakeFreq[m] = (mistakeFreq[m] || 0) + 1 })
    summary.topMistakes = Object.entries(mistakeFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: `You are an expert trading coach analyzing a trader's journal.
Return ONLY a JSON array of exactly 3 insight objects. No preamble, no markdown.
Schema: [{ "title": string, "insight": string, "severity": "warning"|"info"|"success" }]
Be specific, data-driven, and actionable. Reference actual patterns from the data.`,
        messages: [{
          role: 'user',
          content: `Analyze this 90-day trading data and provide 3 key insights:\n${JSON.stringify(summary, null, 2)}`,
        }],
      }),
    })

    const data = await response.json()
    if (data.error) throw new Error(data.error.message)

    const text = data.content?.map(c => c.text || '').join('')
    const clean = text.replace(/```json|```/g, '').trim()
    const insights = JSON.parse(clean)

    res.json({ insights })
  } catch (err) {
    if (err.message?.includes('API')) {
      return res.status(502).json({ message: 'AI service unavailable' })
    }
    next(err)
  }
}


