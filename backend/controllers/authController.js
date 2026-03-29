/**
 * controllers/authController.js  — FIXED VERSION
 *
 * Changes from original:
 *  1. forgotPassword() now actually CALLS sendEmail() instead of just a TODO comment
 *  2. logout() clears both cookie AND responds properly
 *  3. No other logic changed — all your existing code is preserved
 */

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendEmail, emailTemplates } = require('../utils/sendEmail'); // FIX: was missing

// ─── helpers ──────────────────────────────────────────────────────────────────

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const userPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  isSubscribed: user.isSubscribed,
  subscriptionPlan: user.subscriptionPlan,
  subscriptionStart: user.subscriptionStart,
  subscriptionEnd: user.subscriptionEnd,
  charityId: user.charityId,
  charityPercentage: user.charityPercentage,
  totalWinnings: user.totalWinnings,
  drawsEntered: user.drawsEntered,
});

// ─── @route  POST /api/auth/register ─────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { name, email, password, charityId, charityPercentage } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      charityId: charityId || null,
      charityPercentage: charityPercentage || 10,
    });

    // Send welcome email (non-blocking — don't fail registration if email fails)
    try {
      const { subject, html } = emailTemplates.welcome(user.name);
      await sendEmail({ to: user.email, subject, html });
    } catch (emailErr) {
      console.warn('Welcome email failed (non-critical):', emailErr.message);
    }

    const token = generateToken(user._id);

    res
      .cookie('token', token, cookieOptions)
      .status(201)
      .json({
        success: true,
        token,
        data: { user: userPayload(user) },
      });
  } catch (error) {
    console.error('Register error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route  POST /api/auth/login ────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res
      .cookie('token', token, cookieOptions)
      .json({
        success: true,
        token,
        data: { user: userPayload(user) },
      });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route  GET /api/auth/me ─────────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('charityId', 'name logo category');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: { user: userPayload(user) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route  POST /api/auth/logout ───────────────────────────────────────────
const logout = (req, res) => {
  res
    .cookie('token', '', { ...cookieOptions, maxAge: 0 })
    .json({ success: true, message: 'Logged out successfully' });
};

// ─── @route  POST /api/auth/forgot-password ──────────────────────────────────
// FIX: This now actually sends the reset email instead of just a TODO comment
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always return success — never reveal whether email exists (security best practice)
    if (!user) {
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // ── FIX: Actually send the email now ──────────────────────────────────────
    try {
      await sendEmail({
        to: user.email,
        subject: '🔐 Reset Your Golf Charity Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a7f4b;">Password Reset Request</h2>
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>You requested a password reset. Click the button below to set a new password.</p>
            <p style="margin: 28px 0;">
              <a href="${resetLink}"
                 style="background: #1a7f4b; color: white; padding: 12px 28px;
                        border-radius: 6px; text-decoration: none; font-weight: bold;">
                Reset Password
              </a>
            </p>
            <p style="color: #666; font-size: 13px;">
              This link expires in <strong>10 minutes</strong>.<br>
              If you did not request this, you can safely ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
            <p style="color: #999; font-size: 12px;">Golf Charity Platform</p>
          </div>
        `,
      });
    } catch (emailErr) {
      // If email fails, clear the reset token so user can try again
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      console.error('Reset email failed:', emailErr.message);
      return res.status(500).json({ success: false, message: 'Email could not be sent. Please try again.' });
    }

    // In development, also return the token for easy testing
    const isDev = process.env.NODE_ENV !== 'production';
    res.json({
      success: true,
      message: 'Password reset link sent to your email',
      ...(isDev && { resetToken, resetLink }),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route  PUT /api/auth/reset-password/:token ─────────────────────────────
const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    // pre-save hook hashes this automatically
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = generateToken(user._id);
    res
      .cookie('token', token, cookieOptions)
      .json({ success: true, token, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe, logout, forgotPassword, resetPassword };