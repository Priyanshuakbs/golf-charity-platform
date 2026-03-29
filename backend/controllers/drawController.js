const Draw  = require('../models/Draw');
const Score = require('../models/Score');
const User  = require('../models/User');
const { runDraw, simulateDraw, findWinners }      = require('../utils/drawEngine');
const { calculatePrizePool, splitAmongWinners }   = require('../utils/prizePool');

// @desc  Get all PUBLISHED draws (public)
// @route GET /api/draws
const getDraws = async (req, res) => {
  try {
    const draws = await Draw.find({ status: 'published' }).sort({ drawDate: -1 });
    res.json({ success: true, data: draws });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get ALL draws — draft + completed + published (admin only)
// @route GET /api/draws/all
const getAllDraws = async (req, res) => {
  try {
    const draws = await Draw.find().sort({ createdAt: -1 });
    res.json({ success: true, data: draws });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get latest published draw
// @route GET /api/draws/latest
const getLatestDraw = async (req, res) => {
  try {
    const draw = await Draw.findOne({ status: 'published' }).sort({ drawDate: -1 });
    if (!draw) return res.status(404).json({ success: false, message: 'No draws yet' });
    res.json({ success: true, data: draw });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get single draw by ID
// @route GET /api/draws/:id
const getDrawById = async (req, res) => {
  try {
    const draw = await Draw.findById(req.params.id);
    if (!draw) return res.status(404).json({ success: false, message: 'Draw not found' });
    res.json({ success: true, data: draw });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Simulate a draw (admin preview, not saved)
// @route POST /api/draws/simulate
const simulateDrawHandler = async (req, res) => {
  try {
    const { mode = 'random' } = req.body;
    const result = await simulateDraw(mode);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Run official draw and save to DB
// @route POST /api/draws/run
const runDrawHandler = async (req, res) => {
  try {
    const { mode = 'random', month, year } = req.body;

    const activeSubscribers = await User.countDocuments({
      isSubscribed: true,
      subscriptionEnd: { $gt: new Date() },
      role: 'user',
    });

    const prizePool = calculatePrizePool(activeSubscribers, 999);

    const drawnNumbers = await runDraw(mode);
    const winners      = await findWinners(drawnNumbers);

    const fiveMatchPerWinner  = splitAmongWinners(prizePool.fiveMatchPool,  winners.fiveMatch.length);
    const fourMatchPerWinner  = splitAmongWinners(prizePool.fourMatchPool,  winners.fourMatch.length);
    const threeMatchPerWinner = splitAmongWinners(prizePool.threeMatchPool, winners.threeMatch.length);

    const draw = await Draw.create({
      drawDate: new Date(),
      month:    month || new Date().getMonth() + 1,
      year:     year  || new Date().getFullYear(),
      winningNumbers: drawnNumbers,
      mode,
      prizePool: prizePool.totalPool,
      prizes: {
        fiveMatch:  { pool: prizePool.fiveMatchPool,  perWinner: fiveMatchPerWinner,  winners: winners.fiveMatch },
        fourMatch:  { pool: prizePool.fourMatchPool,  perWinner: fourMatchPerWinner,  winners: winners.fourMatch },
        threeMatch: { pool: prizePool.threeMatchPool, perWinner: threeMatchPerWinner, winners: winners.threeMatch },
      },
      jackpotRolledOver: winners.fiveMatch.length === 0,
      status: 'draft',
      activeSubscribers,
    });

    res.status(201).json({ success: true, data: draw });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Publish a draw result
// @route PUT /api/draws/:id/publish
const publishDraw = async (req, res) => {
  try {
    const draw = await Draw.findByIdAndUpdate(
      req.params.id,
      { status: 'published', publishedAt: new Date() },
      { new: true }
    );
    if (!draw) return res.status(404).json({ success: false, message: 'Draw not found' });
    res.json({ success: true, data: draw });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDraws,
  getAllDraws,
  getDrawById,
  getLatestDraw,
  simulateDraw: simulateDrawHandler,
  runDraw:      runDrawHandler,
  publishDraw,
};