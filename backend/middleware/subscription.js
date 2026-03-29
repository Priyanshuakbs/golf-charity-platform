const User = require('../models/User');

/**
 * Middleware: Checks that the authenticated user has an active subscription.
 * Must be used AFTER the `protect` middleware so req.user is already set.
 */
const checkSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('isSubscribed subscriptionEnd role');

    // Admins bypass subscription check
    if (user.role === 'admin') return next();

    if (!user.isSubscribed) {
      return res.status(403).json({
        success: false,
        message: 'Active subscription required to access this feature.',
        code: 'SUBSCRIPTION_REQUIRED',
      });
    }

    // Check if subscription has expired
    if (user.subscriptionEnd && new Date() > new Date(user.subscriptionEnd)) {
      // Update status to expired
      await User.findByIdAndUpdate(req.user.id, {
        isSubscribed: false,
      });

      return res.status(403).json({
        success: false,
        message: 'Your subscription has expired. Please renew to continue.',
        code: 'SUBSCRIPTION_EXPIRED',
      });
    }

    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ success: false, message: 'Server error during subscription validation.' });
  }
};

module.exports = { checkSubscription };