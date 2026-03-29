const Score = require('../models/Score');

// @desc  Get my scores
// @route GET /api/scores
const getMyScores = async (req, res) => {
  try {
    let scoreDoc = await Score.findOne({ userId: req.user.id });
    if (!scoreDoc) return res.json({ success: true, data: [] });
    const sorted = scoreDoc.scores.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ success: true, data: sorted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Add a score (rolling 5 logic)
// @route POST /api/scores
const addScore = async (req, res) => {
  try {
    const { value, date } = req.body;

    if (!value || value < 1 || value > 45) {
      return res.status(400).json({ success: false, message: 'Score must be between 1 and 45' });
    }

    let scoreDoc = await Score.findOne({ userId: req.user.id });

    if (!scoreDoc) {
      scoreDoc = await Score.create({
        userId: req.user.id,
        scores: [{ value, date: date || new Date() }],
      });
    } else {
      // Rolling 5 — remove oldest if already 5 scores
      if (scoreDoc.scores.length >= 5) {
        scoreDoc.scores.sort((a, b) => new Date(a.date) - new Date(b.date));
        scoreDoc.scores.shift(); // remove oldest
      }
      scoreDoc.scores.push({ value, date: date || new Date() });
      await scoreDoc.save();
    }

    res.status(201).json({ success: true, data: scoreDoc.scores });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update a score
// @route PUT /api/scores/:id
const updateScore = async (req, res) => {
  try {
    const { value, date } = req.body;
    const scoreDoc = await Score.findOne({ userId: req.user.id });
    if (!scoreDoc) return res.status(404).json({ success: false, message: 'No scores found' });

    const score = scoreDoc.scores.id(req.params.id);
    if (!score) return res.status(404).json({ success: false, message: 'Score not found' });

    if (value) score.value = value;
    if (date) score.date = date;
    await scoreDoc.save();

    res.json({ success: true, data: scoreDoc.scores });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Delete a score
// @route DELETE /api/scores/:id
const deleteScore = async (req, res) => {
  try {
    const scoreDoc = await Score.findOne({ userId: req.user.id });
    if (!scoreDoc) return res.status(404).json({ success: false, message: 'No scores found' });

    scoreDoc.scores = scoreDoc.scores.filter(s => s._id.toString() !== req.params.id);
    await scoreDoc.save();

    res.json({ success: true, data: scoreDoc.scores });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getMyScores, addScore, updateScore, deleteScore };
