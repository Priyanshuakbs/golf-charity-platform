/**
 * models/Draw.js  — FIXED VERSION
 *
 * Fix applied:
 *   The original Draw schema stored prizePool.fiveMatch as a Number.
 *   But drawController.js saves prizes.fiveMatch as an OBJECT with:
 *     { pool, perWinner, winners: [...] }
 *   These two structures conflicted — saving would silently fail or lose data.
 *
 *   This version aligns the schema with what the controller actually saves.
 *   Also added proper indexes and the jackpotRolledOver field the controller uses.
 */

const mongoose = require('mongoose');

// ── Winner subdocument ────────────────────────────────────────────────────────
const WinnerEntrySchema = new mongoose.Schema({
  userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name:          { type: String },
  email:         { type: String },
  matchCount:    { type: Number },
  matchedScores: [{ type: Number }],
  userScores:    [{ type: Number }],
  proofStatus: {
    type: String,
    enum: ['pending', 'submitted', 'approved', 'rejected'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid'],
    default: 'pending',
  },
  proofImageUrl: { type: String, default: '' },
  paidAt:        { type: Date },
});

// ── Prize tier subdocument ────────────────────────────────────────────────────
// FIX: This now matches exactly what drawController.js saves
const PrizeTierSchema = new mongoose.Schema({
  pool:       { type: Number, default: 0 }, // total pool for this tier (pence)
  perWinner:  { type: Number, default: 0 }, // amount per winner (pence)
  winners:    [WinnerEntrySchema],
});

// ── Main Draw schema ──────────────────────────────────────────────────────────
const DrawSchema = new mongoose.Schema(
  {
    month: { type: Number, required: true, min: 1, max: 12 },
    year:  { type: Number, required: true },

    drawDate: { type: Date, default: Date.now },

    mode: {
      type: String,
      enum: ['random', 'weighted_most', 'weighted_least'],
      default: 'random',
    },

    // The 5 drawn winning numbers
    winningNumbers: {
      type: [Number],
      validate: {
        validator: (arr) => arr.length === 5,
        message: 'Must have exactly 5 winning numbers',
      },
    },

    // FIX: prizes is now a proper nested object matching the controller
    prizes: {
      fiveMatch:  { type: PrizeTierSchema, default: () => ({}) },
      fourMatch:  { type: PrizeTierSchema, default: () => ({}) },
      threeMatch: { type: PrizeTierSchema, default: () => ({}) },
    },

    // Total prize pool for this draw (pence)
    prizePool: { type: Number, default: 0 },

    // FIX: jackpotRolledOver — used by controller when no 5-match winner
    jackpotRolledOver: { type: Boolean, default: false },

    // How much jackpot was carried FROM previous month (pence)
    jackpotCarriedForward: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ['draft', 'simulated', 'published'],
      default: 'draft',
    },

    publishedAt: { type: Date },

    activeSubscribers: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// One draw per month/year
DrawSchema.index({ month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Draw', DrawSchema);