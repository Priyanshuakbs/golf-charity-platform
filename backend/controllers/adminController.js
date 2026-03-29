const User  = require('../models/User');
const Score = require('../models/Score');
const Draw  = require('../models/Draw');
const Charity = require('../models/Charity');

// ─── GET /api/admin/users ─────────────────────────────────────────────────
// FIX: Added search filter + returns `users` key to match frontend
const getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;
    const query = { role: 'user' };

    if (search) {
      query.$or = [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .populate('charityId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/admin/users/:id ─────────────────────────────────────────────
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('charityId', 'name');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PUT /api/admin/users/:id ─────────────────────────────────────────────
const updateUser = async (req, res) => {
  try {
    // Prevent accidental password overwrite from admin panel
    delete req.body.password;

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE /api/admin/users/:id ──────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Clean up scores too
    await Score.deleteMany({ user: req.params.id });

    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PUT /api/admin/users/:id/scores ─────────────────────────────────────
const updateUserScore = async (req, res) => {
  try {
    const { scores } = req.body;
    const scoreDoc = await Score.findOneAndUpdate(
      { user: req.params.id },
      { scores },
      { new: true, upsert: true }
    );
    res.json({ success: true, data: scoreDoc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/admin/winners ───────────────────────────────────────────────
// FIX: Returns shape that AdminWinners.jsx expects:
//   w.userId { name, email }, w.drawId { month, year },
//   w.matchType, w.prizeAmount, w.verificationStatus, w.paymentStatus, w.proofUrl
const getAllWinners = async (req, res) => {
  try {
    const { filter } = req.query;

    const draws = await Draw.find()
      .populate('prizes.fiveMatch.winners.userId', 'name email')
      .populate('prizes.fourMatch.winners.userId', 'name email')
      .populate('prizes.threeMatch.winners.userId', 'name email')
      .sort({ createdAt: -1 });

    const allWinners = [];

    draws.forEach((draw) => {
      ['fiveMatch', 'fourMatch', 'threeMatch'].forEach((tier) => {
        const tierData = draw.prizes?.[tier];
        if (!tierData?.winners?.length) return;

        tierData.winners.forEach((w) => {
          const winner = {
            _id:                `${draw._id}_${tier}_${w.userId?._id}`,
            drawId:             { _id: draw._id, month: draw.month, year: draw.year },
            userId:             w.userId,
            matchType:          tier,
            prizeAmount:        tierData.perWinner || 0,
            verificationStatus: w.proofStatus      || 'unverified',
            paymentStatus:      w.paymentStatus     || 'unpaid',
            proofUrl:           w.proofUrl          || null,
            // store for verify/paid actions
            _drawId: draw._id,
            _tier:   tier,
          };

          // Apply tab filter
          if (!filter || filter === 'all')            allWinners.push(winner);
          else if (filter === 'unverified' && winner.verificationStatus === 'unverified') allWinners.push(winner);
          else if (filter === 'submitted'  && winner.verificationStatus === 'submitted')  allWinners.push(winner);
          else if (filter === 'approved'   && winner.verificationStatus === 'approved')   allWinners.push(winner);
          else if (filter === 'rejected'   && winner.verificationStatus === 'rejected')   allWinners.push(winner);
          else if (filter === 'unpaid'     && winner.paymentStatus      === 'unpaid')     allWinners.push(winner);
          else if (filter === 'paid'       && winner.paymentStatus      === 'paid')       allWinners.push(winner);
        });
      });
    });

    res.json({ success: true, count: allWinners.length, winners: allWinners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PUT /api/admin/winners/:id/verify ───────────────────────────────────
// FIX: Uses drawId + userId + tier from body (since winner is embedded in Draw)
const verifyWinner = async (req, res) => {
  try {
    const { drawId, userId, tier, status = 'approved' } = req.body;

    if (!drawId || !userId || !tier) {
      return res.status(400).json({ success: false, message: 'drawId, userId and tier are required' });
    }

    const draw = await Draw.findById(drawId);
    if (!draw) return res.status(404).json({ success: false, message: 'Draw not found' });

    const winner = draw.prizes?.[tier]?.winners?.find(
      (w) => w.userId?.toString() === userId
    );
    if (!winner) return res.status(404).json({ success: false, message: 'Winner not found in draw' });

    winner.proofStatus = status; // 'approved' or 'rejected'
    await draw.save();

    res.json({ success: true, message: `Winner ${status}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PUT /api/admin/winners/:id/paid ─────────────────────────────────────
const markWinnerPaid = async (req, res) => {
  try {
    const { drawId, userId, tier } = req.body;

    if (!drawId || !userId || !tier) {
      return res.status(400).json({ success: false, message: 'drawId, userId and tier are required' });
    }

    const draw = await Draw.findById(drawId);
    if (!draw) return res.status(404).json({ success: false, message: 'Draw not found' });

    const winner = draw.prizes?.[tier]?.winners?.find(
      (w) => w.userId?.toString() === userId
    );
    if (!winner) return res.status(404).json({ success: false, message: 'Winner not found in draw' });

    winner.paymentStatus = 'paid';
    winner.paidAt        = new Date();
    await draw.save();

    // Update user's totalWinnings
    await User.findByIdAndUpdate(userId, {
      $inc: { totalWinnings: draw.prizes[tier].perWinner || 0 },
    });

    res.json({ success: true, message: 'Winner marked as paid' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/admin/reports ───────────────────────────────────────────────
// FIX: Added totalRevenue, pendingWinners, totalCharities
//      which AdminDashboard.jsx expects
const getReports = async (req, res) => {
  try {
    const [
      totalUsers,
      activeSubscribers,
      totalDraws,
      totalCharities,
      draws,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', isSubscribed: true, subscriptionEnd: { $gt: new Date() } }),
      Draw.countDocuments(),
      Charity.countDocuments({ isActive: true }),
      Draw.find(),
    ]);

    // Count pending winners (submitted proof, not yet approved)
    let pendingWinners = 0;
    let totalRevenue   = 0;

    draws.forEach((d) => {
      ['fiveMatch', 'fourMatch', 'threeMatch'].forEach((tier) => {
        d.prizes?.[tier]?.winners?.forEach((w) => {
          if (w.proofStatus === 'submitted') pendingWinners++;
          if (w.paymentStatus === 'paid') totalRevenue += d.prizes[tier].perWinner || 0;
        });
      });
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        activeSubscribers,
        totalDraws,
        totalCharities,
        pendingWinners,
        totalRevenue,
        conversionRate: totalUsers > 0
          ? ((activeSubscribers / totalUsers) * 100).toFixed(1)
          : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserScore,
  getAllWinners,
  verifyWinner,
  markWinnerPaid,
  getReports,
};