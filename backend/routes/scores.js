const express = require('express');
const router = express.Router();
const { protect, checkSubscription } = require('../middleware/authMiddleware');
const {
  getMyScores,
  addScore,
  updateScore,
  deleteScore,
} = require('../controllers/scoreController');

// protect = must be logged in
// checkSubscription = must have active subscription (admins bypass automatically)
router.use(protect);
router.use(checkSubscription);

router.route('/')
  .get(getMyScores)
  .post(addScore);

router.route('/:id')
  .put(updateScore)
  .delete(deleteScore);

module.exports = router;