const mongoose = require('mongoose');

const ScoreEntrySchema = new mongoose.Schema({
  value: { type: Number, required: true, min: 1, max: 45 },
  date:  { type: Date,   required: true },
});

const ScoreSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
      unique:   true, // one score document per user
    },
    // Rolling 5-score array — oldest gets replaced automatically
    scores: {
      type: [ScoreEntrySchema],
      validate: {
        validator: (arr) => arr.length <= 5,
        message:   'Maximum 5 scores allowed',
      },
    },
  },
  { timestamps: true }
);

// ── Add a new score (rolling 5-score logic) ──────────────────────────────────
ScoreSchema.methods.addScore = function (value, date) {
  // Sort ASCENDING (oldest first) so pop() removes the oldest
  this.scores.sort((a, b) => new Date(a.date) - new Date(b.date));

  if (this.scores.length >= 5) {
    this.scores.pop(); // removes the OLDEST (last item after asc sort)
  }

  this.scores.push({ value, date });

  // Re-sort DESCENDING so newest is always first (matches getMyScores)
  this.scores.sort((a, b) => new Date(b.date) - new Date(a.date));
};

module.exports = mongoose.model('Score', ScoreSchema);