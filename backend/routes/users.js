const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Score = require('../models/Score');
const { protect } = require('../middleware/authMiddleware');

// ─── Multer config — Avatar ───────────────────────────────────────────────
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/avatars';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar_${req.user._id}_${Date.now()}${ext}`);
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const validExt = allowed.test(path.extname(file.originalname).toLowerCase());
    const validMime = allowed.test(file.mimetype);
    if (validExt && validMime) cb(null, true);
    else cb(new Error('Only image files allowed (jpg, png, webp)'));
  },
});

// ─── Multer config — Proof ────────────────────────────────────────────────
const proofStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/proofs';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `proof_${req.user._id}_${req.params.drawId}_${Date.now()}${ext}`);
  },
});

const uploadProof = multer({
  storage: proofStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|pdf/;
    const validExt = allowed.test(path.extname(file.originalname).toLowerCase());
    const validMime = /image\/(jpeg|jpg|png|webp)|application\/pdf/.test(file.mimetype);
    if (validExt && validMime) cb(null, true);
    else cb(new Error('Only image or PDF files allowed'));
  },
});

// ─── GET /api/users/me ────────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .populate('charityId', 'name logo');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, data: user });
  } catch (err) {
    console.error('[GET /me]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── GET /api/users/me/dashboard ─────────────────────────────────────────
router.get('/me/dashboard', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const [user, recentScores] = await Promise.all([
      User.findById(userId)
        .select('name email avatar isSubscribed subscriptionPlan subscriptionEnd totalWinnings drawsEntered charityId charityPercentage')
        .populate('charityId', 'name logo'),
      Score.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const allScores = await Score.find({ userId }).lean();
    const totalRounds = allScores.length;
    const avgScore = totalRounds > 0
      ? Math.round(allScores.reduce((sum, s) => sum + (s.totalScore || 0), 0) / totalRounds)
      : 0;
    const bestScore = totalRounds > 0
      ? Math.min(...allScores.map((s) => s.totalScore || Infinity))
      : null;

    res.json({
      success: true,
      data: {
        user,
        stats: { totalRounds, avgScore, bestScore, totalWinnings: user.totalWinnings, drawsEntered: user.drawsEntered },
        recentScores,
        subscription: { isSubscribed: user.isSubscribed, plan: user.subscriptionPlan, expiresAt: user.subscriptionEnd },
      },
    });
  } catch (err) {
    console.error('[GET /me/dashboard]', err);
    res.status(500).json({ success: false, message: 'Failed to load dashboard' });
  }
});

// ─── GET /api/users/me/avatar ─────────────────────────────────────────────
router.get('/me/avatar', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('avatar');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({
      success: true,
      data: {
        avatar: user.avatar
          ? `${req.protocol}://${req.get('host')}/${user.avatar}`
          : null,
      },
    });
  } catch (err) {
    console.error('[GET /me/avatar]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─── POST /api/users/me/avatar ✅ FIX: was '/avatar', now '/me/avatar' ────
router.post('/me/avatar', protect, uploadAvatar.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const avatarPath = req.file.path.replace(/\\/g, '/'); // Windows path fix

    // Purana avatar delete karo
    const existing = await User.findById(req.user._id).select('avatar');
    if (existing?.avatar) {
      const oldPath = path.resolve(existing.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarPath },
      { new: true }
    ).select('avatar name');

    res.json({
      success: true,
      message: 'Avatar updated successfully',
      data: {
        avatar: `${req.protocol}://${req.get('host')}/${avatarPath}`,
        user,
      },
    });
  } catch (err) {
    console.error('[POST /me/avatar]', err);
    if (err.message?.includes('Only image files')) {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Avatar upload failed' });
  }
});

// ─── PUT /api/users/me ────────────────────────────────────────────────────
router.put('/me', protect, async (req, res) => {
  try {
    const allowed = ['name', 'charityId', 'charityPercentage'];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.json({ success: true, data: user });
  } catch (err) {
    console.error('[PUT /me]', err);
    res.status(500).json({ success: false, message: 'Profile update failed' });
  }
});

// ─── PUT /api/users/me/password ───────────────────────────────────────────
router.put('/me/password', protect, async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both passwords required' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    console.error('[PUT /me/password]', err);
    res.status(500).json({ success: false, message: 'Password update failed' });
  }
});

// ─── GET /api/users/me/wins ───────────────────────────────────────────────
router.get('/me/wins', protect, async (req, res) => {
  try {
    const Draw = require('../models/Draw');
    const draws = await Draw.find({ status: 'published' });
    const myWins = [];

    draws.forEach((draw) => {
      ['fiveMatch', 'fourMatch', 'threeMatch'].forEach((tier) => {
        if (draw.prizes?.[tier]) {
          draw.prizes[tier].winners.forEach((winner) => {
            if (winner.userId?.toString() === req.user._id.toString()) {
              myWins.push({
                drawId: draw._id,
                drawDate: draw.drawDate,
                tier,
                prizeAmount: draw.prizes[tier].perWinner,
                proofStatus: winner.proofStatus || 'pending',
                paymentStatus: winner.paymentStatus || 'pending',
              });
            }
          });
        }
      });
    });

    res.json({ success: true, data: myWins });
  } catch (err) {
    console.error('[GET /me/wins]', err);
    res.status(500).json({ success: false, message: 'Failed to fetch wins' });
  }
});

// ─── POST /api/users/me/wins/:drawId/proof ────────────────────────────────
router.post('/me/wins/:drawId/proof', protect, uploadProof.single('proof'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const proofPath = req.file.path.replace(/\\/g, '/');
    const proofUrl = `${req.protocol}://${req.get('host')}/${proofPath}`;

    res.json({
      success: true,
      message: 'Proof uploaded successfully',
      data: { proofUrl },
    });
  } catch (err) {
    console.error('[POST /me/wins/:drawId/proof]', err);
    res.status(500).json({ success: false, message: 'Proof upload failed' });
  }
});

module.exports = router;