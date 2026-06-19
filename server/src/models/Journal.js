import mongoose from 'mongoose'

const journalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    mood: {
      type: String,
      enum: ['😤', '😰', '😐', '😊', '🔥'],
      default: '😊',
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
      maxlength: 10000,
    },
    tags: [{ type: String, trim: true, lowercase: true }],
    tradeIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Trade' }],
    tradesCount: { type: Number, default: 0 },
    pnl: { type: Number, default: 0 },
  },
  { timestamps: true }
)

journalSchema.index({ userId: 1, date: -1 })

export default mongoose.model('Journal', journalSchema)
