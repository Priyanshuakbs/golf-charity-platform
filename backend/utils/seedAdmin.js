/**
 * userController.js — UPDATED
 * Added getDashboard() endpoint that Dashboard.jsx calls at /api/users/me/dashboard
 * Everything else is unchanged from your original.
 */

const User = require('../models/User');
const Score = require('../models/Score');
const Draw = require('../models/Draw');
const path = require('path');
const fs = require('fs');

// @desc  Get dashboard data (user + scores + latest draw)
// @route GET /api/users/me/dashboard
const getDashboard = async (req, res) => {
  try {
    const [user, scoreDoc, latestDraw] = await Promise.all([
      User.findById(req.user._id)
        .select('-password -resetPasswordToken -resetPasswordExpire')
        .populate('charityId', 'name description logo category'),
      Score.findOne({ userId: req.user._id }),
      Draw.findOne({ status: 'published' }).sort({ drawDate: -1 }),
    ]);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Sort scores newest first
    const scores = scoreDoc
      ? scoreDoc.scores.sort((a, b) => new Date(b.date) - new Date(a.date))
      : [];

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          charityId: user.charityId,
          charityPercentage: user.charityPercentage,
          totalWinnings: user.totalWinnings,
          drawsEntered: user.drawsEntered,
          // Subscription formatted the way Dashboard.jsx expects it
          subscription: {
            status: user.isSubscribed && user.subscriptionEnd > new Date() ? 'active' : 'inactive',
            plan: user.subscriptionPlan ?? 'none',
            end: user.subscriptionEnd,
          },
          isSubscribed: user.isSubscribed,
          subscriptionPlan: user.subscriptionPlan,
          subscriptionEnd: user.subscriptionEnd,
        },
        scores,
        latestDraw: latestDraw ? {
          _id: latestDraw._id,
          month: latestDraw.month,
          year: latestDraw.year,
          winningNumbers: latestDraw.winningNumbers,
          status: latestDraw.status,
          jackpotRolledOver: latestDraw.jackpotRolledOver,
        } : null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get my profile
// @route GET /api/users/me
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .populate('charityId', 'name description logo');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update profile
// @route PUT /api/users/me
const updateProfile = async (req, res) => {
  try {
    const { name, charityId, charityPercentage } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (charityId) updates.charityId = charityId;
    if (charityPercentage !== undefined) {
      updates.charityPercentage = Math.max(10, Number(charityPercentage));
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).populate('charityId', 'name logo');

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update password
// @route PUT /api/users/me/password
const updatePassword = async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both passwords are required' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Upload avatar
// @route POST /api/users/avatar
const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const avatarPath = req.file.path.replace(/\\/g, '/');

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
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get my wins
// @route GET /api/users/me/wins
const getMyWins = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Upload winner proof
// @route POST /api/users/me/wins/:drawId/proof
const uploadProof = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const proofPath = req.file.path.replace(/\\/g, '/');
    const proofUrl = `${req.protocol}://${req.get('host')}/${proofPath}`;

    res.json({
      success: true,
      message: 'Proof uploaded successfully',
      data: { proofUrl },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboard,
  getProfile,
  updateProfile,
  updatePassword,
  updateAvatar,
  getMyWins,
  uploadProof,
};