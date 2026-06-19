import mongoose from 'mongoose'

const tradeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    symbol: {
      type: String,
      required: [true, 'Symbol is required'],
      trim: true,
      uppercase: true,
      maxlength: 20,
    },
    assetType: {
      type: String,
      enum: ['Stock', 'Crypto', 'Forex', 'Futures', 'Options', 'ETF'],
      default: 'Stock',
    },
    type: {
      type: String,
      enum: ['long', 'short'],
      required: [true, 'Trade type is required'],
    },
    entryPrice: {
      type: Number,
      required: [true, 'Entry price is required'],
      min: 0,
    },
    exitPrice: { type: Number, min: 0 },
    stopLoss:  { type: Number, min: 0 },
    quantity:  {
      type: Number,
      required: [true, 'Quantity is required'],
      min: 0,
    },
    entryDate: {
      type: Date,
      required: [true, 'Entry date is required'],
      index: true,
    },
    exitDate: { type: Date },

    // Calculated fields (stored for performance)
    pnl:        { type: Number, default: 0 },
    riskReward: { type: Number },

    // Trade classification
    strategy: { type: String, trim: true },
    mistakes:  [{ type: String, trim: true }],
    emotions:  [{ type: String, trim: true }],
    notes:     { type: String, trim: true, maxlength: 5000 },
    screenshots: [{ type: String }], // Cloudinary URLs

    // Status
    status: {
      type: String,
      enum: ['open', 'closed'],
      default: function () { return this.exitPrice ? 'closed' : 'open' },
    },
  },
  { timestamps: true }
)

// Auto-calculate P&L and R:R before save — respects manual entry
tradeSchema.pre('save', function (next) {
  // Only auto-calc P&L if user didn't enter it manually
  if (!this.pnl && this.exitPrice && this.entryPrice && this.quantity) {
    const raw = this.type === 'long'
      ? (this.exitPrice - this.entryPrice) * this.quantity
      : (this.entryPrice - this.exitPrice) * this.quantity
    this.pnl = parseFloat(raw.toFixed(2))
  }

  // Mark as closed if exit price or pnl is present
  if (this.exitPrice || this.pnl) {
    this.status = 'closed'
  }

  // Only auto-calc R:R if user didn't enter it manually
  if (!this.riskReward && this.stopLoss && this.entryPrice && this.exitPrice) {
    const reward = this.type === 'long'
      ? this.exitPrice - this.entryPrice
      : this.entryPrice - this.exitPrice
    const risk = this.type === 'long'
      ? this.entryPrice - this.stopLoss
      : this.stopLoss - this.entryPrice
    if (risk > 0) this.riskReward = parseFloat((reward / risk).toFixed(2))
  }

  next()
})

// Indexes for common queries
tradeSchema.index({ userId: 1, entryDate: -1 })
tradeSchema.index({ userId: 1, symbol: 1 })
tradeSchema.index({ userId: 1, status: 1 })

export default mongoose.model('Trade', tradeSchema)
