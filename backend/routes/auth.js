const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // ✅ Fixed
const {
  register,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

router.post('/register',             register);
router.post('/login',                login);
router.post('/logout',               logout);
router.get('/me',                    protect, getMe);
router.post('/forgot-password',      forgotPassword);
router.put('/reset-password/:token', resetPassword);

module.exports = router;