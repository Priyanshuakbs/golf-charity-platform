const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserScore,
  getAllWinners,
  verifyWinner,
  markWinnerPaid,
  getReports,
} = require('../controllers/adminController');

// All admin routes are protected + admin only
router.use(protect, adminOnly);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/scores', updateUserScore);

// Winners management
router.get('/winners', getAllWinners);
router.put('/winners/:id/verify', verifyWinner);
router.put('/winners/:id/paid', markWinnerPaid);

// Reports & analytics
router.get('/reports', getReports);

module.exports = router;