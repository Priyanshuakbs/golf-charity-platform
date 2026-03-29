/**
 * controllers/paymentController.js  — FIXED VERSION
 *
 * Fix applied:
 *   checkout.session.completed webhook now correctly sets subscriptionEnd
 *   to +1 MONTH for monthly plans and +1 YEAR for yearly plans.
 *   Original code always set +1 month regardless of plan — yearly users
 *   would have expired after 30 days.
 *
 * Everything else is unchanged from your original.
 */

const User = require('../models/User');

// @desc  Get subscription plans
// @route GET /api/payments/plans
const getPlans = async (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'monthly',
        name: 'Monthly',
        price: 9.99,
        currency: 'gbp',
        interval: 'month',
        priceId: process.env.STRIPE_MONTHLY_PRICE_ID,
        features: ['Score tracking', 'Monthly draw entry', 'Charity contribution'],
      },
      {
        id: 'yearly',
        name: 'Yearly',
        price: 99.99,
        currency: 'gbp',
        interval: 'year',
        priceId: process.env.STRIPE_YEARLY_PRICE_ID,
        savings: '£19.89',
        features: ['Everything in monthly', '2 months free', 'Priority support'],
      },
    ],
  });
};

// @desc  Create Stripe checkout session
// @route POST /api/payments/create-checkout-session
const createCheckoutSession = async (req, res) => {
  try {
    const stripe = require('../config/stripe');
    const { priceId, plan } = req.body; // FIX: also accept 'plan' from frontend

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: req.user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.CLIENT_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.CLIENT_URL}/subscribe?payment=cancelled`,
      metadata: {
        userId: req.user.id,
        plan: plan || 'monthly', // FIX: store plan in metadata so webhook can read it
      },
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Handle Stripe webhook
// @route POST /api/payments/webhook
const handleWebhook = async (req, res) => {
  const stripe = require('../config/stripe');
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ message: `Webhook error: ${err.message}` });
  }

  switch (event.type) {

    case 'checkout.session.completed': {
      const session = event.data.object;

      // ── FIX: Read plan from metadata and set correct end date ──────────────
      const plan = session.metadata?.plan || 'monthly';
      const subscriptionEnd = new Date();

      if (plan === 'yearly') {
        subscriptionEnd.setFullYear(subscriptionEnd.getFullYear() + 1); // +12 months
      } else {
        subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1); // +1 month
      }
      // ────────────────────────────────────────────────────────────────────────

      await User.findByIdAndUpdate(session.metadata.userId, {
        isSubscribed: true,
        subscriptionPlan: plan,
        subscriptionStart: new Date(),
        subscriptionEnd,
      });
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      await User.findOneAndUpdate(
        { email: subscription.customer_email },
        { isSubscribed: false, subscriptionEnd: new Date() }
      );
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      await User.findOneAndUpdate(
        { email: invoice.customer_email },
        { isSubscribed: false, subscriptionEnd: new Date() }
      );
      break;
    }

    // Handle subscription renewals (keeps subscriptionEnd updated)
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;
      if (invoice.billing_reason === 'subscription_cycle') {
        const user = await User.findOne({ email: invoice.customer_email });
        if (user) {
          const newEnd = new Date();
          if (user.subscriptionPlan === 'yearly') {
            newEnd.setFullYear(newEnd.getFullYear() + 1);
          } else {
            newEnd.setMonth(newEnd.getMonth() + 1);
          }
          await User.findOneAndUpdate(
            { email: invoice.customer_email },
            { isSubscribed: true, subscriptionEnd: newEnd }
          );
        }
      }
      break;
    }
  }

  res.json({ received: true });
};

// @desc  Get subscription status
// @route GET /api/payments/subscription-status
const getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('isSubscribed subscriptionPlan subscriptionStart subscriptionEnd');

    res.json({
      success: true,
      data: {
        isSubscribed: user.isSubscribed,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionStart: user.subscriptionStart,
        subscriptionEnd: user.subscriptionEnd,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Cancel subscription
// @route POST /api/payments/cancel-subscription
const cancelSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('isSubscribed subscriptionEnd');

    if (!user.isSubscribed) {
      return res.status(400).json({ success: false, message: 'No active subscription found' });
    }

    // In production: call stripe.subscriptions.del(stripeSubId)
    // For now: mark as cancelled immediately
    await User.findByIdAndUpdate(req.user.id, {
      isSubscribed: false,
      subscriptionEnd: new Date(),
    });

    res.json({ success: true, message: 'Subscription cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPlans,
  createCheckoutSession,
  handleWebhook,
  getSubscriptionStatus,
  cancelSubscription,
};