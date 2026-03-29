/**
 * middleware/isAdmin.js  — COMPLETE VERSION
 *
 * Must be used AFTER protect middleware.
 * protect sets req.user — isAdmin checks its role.
 *
 * Usage:
 *   const { protect } = require('../middleware/authMiddleware');
 *   const isAdmin = require('../middleware/isAdmin');
 *   router.get('/admin/users', protect, isAdmin, adminController.getAllUsers);
 */

const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authenticated',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }

  next();
};

module.exports = isAdmin;