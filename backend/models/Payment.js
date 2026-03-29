const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stripePaymentIntentId: String,
  stripeInvoiceId: String,
  amount: {
    type: Number,
    required: true  // in pence/cents
  },
  currency: {
    type: String,
    default: 'gbp'
  },
  plan: {
    type: String,
    enum: ['monthly', 'yearly'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'succeeded', 'failed', 'refunded'],
    default: 'pending'
  },
  // Breakdown
  prizePoolContribution: Number,
  charityContribution: Number,
  platformFee: Number,
  charityRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Charity'
  },
  charityPercent: Number,
  periodStart: Date,
  periodEnd: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', PaymentSchema);