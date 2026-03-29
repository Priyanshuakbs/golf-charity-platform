const User = require('../models/User');
const path = require('path');
const fs = require('fs');

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
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get my wins
// @route GET /api/users/me/wins
const getMyWins = async (req, res) => {
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
  getProfile,
  updateProfile,
  updatePassword,
  updateAvatar,
  getMyWins,
  uploadProof,
};
```

---

## 4. `.gitignore` — uploads commit na ho
```
node_modules/
.env
uploads/avatars/*
uploads/proofs/*
!uploads/avatars/.gitkeep
!uploads/proofs/.gitkeep