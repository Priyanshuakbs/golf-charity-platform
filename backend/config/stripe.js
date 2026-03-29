/**
 * config/stripe.js
 *
 * Initialises the Stripe SDK with your secret key from .env
 * Required by paymentController.js via: require('../config/stripe')
 *
 * Make sure STRIPE_SECRET_KEY is in your backend .env file.
 * Test key format:  sk_test_...
 * Live key format:  sk_live_...
 */

const Stripe = require('stripe');

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is missing from .env');
}

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

module.exports = stripe;