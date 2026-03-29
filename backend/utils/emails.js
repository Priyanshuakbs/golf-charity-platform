const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"Golf Charity Platform" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

// ── Email Templates ───────────────────────────────────────────────────────────
const emailTemplates = {
  welcome: (name) => ({
    subject: '🏌️ Welcome to Golf Charity Platform!',
    html: `<h2>Hi ${name},</h2><p>Welcome aboard! Start entering your scores and make an impact.</p>`,
  }),

  subscriptionConfirmed: (name, plan) => ({
    subject: '✅ Subscription Confirmed',
    html: `<h2>Hi ${name},</h2><p>Your <strong>${plan}</strong> subscription is now active. You're ready to play!</p>`,
  }),

  drawResult: (name, isWinner, matchType, prize) => ({
    subject: isWinner ? '🏆 You Won the Monthly Draw!' : '🎯 Monthly Draw Results',
    html: isWinner
      ? `<h2>Congratulations ${name}!</h2><p>You matched <strong>${matchType}</strong> and won <strong>£${prize}</strong>! Please log in to verify and claim your prize.</p>`
      : `<h2>Hi ${name},</h2><p>This month's draw is complete. Better luck next month! Keep entering your scores.</p>`,
  }),

  winnerVerified: (name, prize) => ({
    subject: '💰 Prize Approved — Payment Processing',
    html: `<h2>Hi ${name},</h2><p>Your win of <strong>£${prize}</strong> has been verified and payment is being processed.</p>`,
  }),
};

module.exports = { sendEmail, emailTemplates };