/**
 * middleware/isSubscribed.js  — COMPLETE VERSION
 *
 * Protects routes that require an active subscription.
 * Checks BOTH the isSubscribed flag AND the expiry date.
 *
 * Why check both?
 *   isSubscribed can be true but subscriptionEnd can be in the past
 *   if the webhook hasn't fired yet. Double-checking prevents edge cases.
 *
 * Usage in routes:
 *   const { protect } = require('../middleware/authMiddleware');
 *   const isSubscribed = require('../middleware/isSubscribed');
 *   router.get('/scores', protect, isSubscribed, scoreController.getMyScores);
 */

const isSubscribed = (req, res, next) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
  }

  // Admins bypass subscription check — they always have access
  if (user.role === 'admin') {
    return next();
  }

  const isActive =
    user.isSubscribed === true &&
    user.subscriptionEnd &&
    new Date(user.subscriptionEnd) > new Date();

  if (!isActive) {
    return res.status(403).json({
      success: false,
      message: 'Active subscription required to access this feature',
      code: 'SUBSCRIPTION_REQUIRED',
    });
  }

  next();
};

module.exports = isSubscribed;