const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getCharities,
  getCharityById,
  getFeaturedCharities,
  createCharity,
  updateCharity,
  deleteCharity,
} = require('../controllers/charityController');

// Public routes
router.get('/', getCharities);
router.get('/featured', getFeaturedCharities);
router.get('/:id', getCharityById);

// Admin only routes
router.post('/', protect, adminOnly, createCharity);
router.put('/:id', protect, adminOnly, updateCharity);
router.delete('/:id', protect, adminOnly, deleteCharity);

module.exports = router;