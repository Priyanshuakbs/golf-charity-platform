const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createCheckoutSession,
  handleWebhook,
  getSubscriptionStatus,
  cancelSubscription,
  getPlans,
} = require('../controllers/paymentController');

// Public routes
router.get('/plans', getPlans);

// Stripe webhook - raw body required (before express.json middleware)
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes
router.use(protect);
router.post('/create-checkout-session', createCheckoutSession);
router.get('/subscription-status', getSubscriptionStatus);
router.post('/cancel-subscription', cancelSubscription);

module.exports = router;