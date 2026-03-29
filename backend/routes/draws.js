const express = require('express');
const router  = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getDraws,
  getAllDraws,
  getDrawById,
  getLatestDraw,
  simulateDraw,
  runDraw,
  publishDraw,
} = require('../controllers/drawController');

// ─── Public routes ────────────────────────────────────────────────────────
router.get('/',       getDraws);      // published only
router.get('/latest', getLatestDraw); // latest published

// ─── Admin only — must be BEFORE /:id to avoid route conflict ─────────────
router.get('/all',          protect, adminOnly, getAllDraws);   // all draws (draft + published)
router.post('/simulate',    protect, adminOnly, simulateDraw);
router.post('/run',         protect, adminOnly, runDraw);
router.put('/:id/publish',  protect, adminOnly, publishDraw);

// ─── Dynamic param — must be LAST ────────────────────────────────────────
router.get('/:id', getDrawById);

module.exports = router;