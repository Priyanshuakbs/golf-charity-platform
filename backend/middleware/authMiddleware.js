const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── protect ───────────────────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authenticated — please log in' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found — token is invalid' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired — please log in again' });
  }
};

// ── adminOnly ─────────────────────────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403).json({ success: false, message: 'Access denied — admin only' });
};

// ── checkSubscription ─────────────────────────────────────────────────────────
const checkSubscription = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') return next();

    const user = await User.findById(req.user._id).select('isSubscribed subscriptionEnd');

    if (user.isSubscribed && user.subscriptionEnd && new Date() > new Date(user.subscriptionEnd)) {
      await User.findByIdAndUpdate(user._id, { isSubscribed: false });
      return res.status(403).json({
        success: false,
        message: 'Your subscription has expired. Please renew to continue.',
        code: 'SUBSCRIPTION_EXPIRED',
      });
    }

    if (!user.isSubscribed) {
      return res.status(403).json({
        success: false,
        message: 'Active subscription required to access this feature.',
        code: 'NOT_SUBSCRIBED',
      });
    }

    next();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { protect, adminOnly, checkSubscription };