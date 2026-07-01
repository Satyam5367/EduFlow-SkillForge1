const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const User = require('../models/User.model');
const sendEmail = require('../utils/email.util');
const { sendTokenResponse } = require('../utils/token.util');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email and password');
  }

  // Prevent self-assigning admin
  const allowedRoles = ['student', 'instructor'];
  const userRole = allowedRoles.includes(role) ? role : 'student';

  const user = await User.create({ name, email, password, role: userRole });

  // Send verification email
  const verifyToken = user.getEmailVerifyToken();
  await user.save({ validateBeforeSave: false });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${verifyToken}`;
  try {
    await sendEmail({
      to:      email,
      subject: '🎓 Welcome to EduFlow — Verify Your Email',
      html:    `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;">
          <h2 style="color:#6C63FF;">Welcome to EduFlow, ${name}! 🎓</h2>
          <p>Click the button below to verify your email address:</p>
          <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#6C63FF;color:white;border-radius:8px;text-decoration:none;font-weight:bold;">Verify Email</a>
          <p style="color:#888;margin-top:20px;">This link expires in 24 hours.</p>
        </div>
      `,
    });
  } catch {
    user.emailVerifyToken = undefined;
    user.emailVerifyExpire = undefined;
    await user.save({ validateBeforeSave: false });
  }

  sendTokenResponse(user, 201, res, 'Registration successful! Please verify your email.');
});

// @desc    Login
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(401);
    throw new Error('Account deactivated. Please contact support.');
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res, 'Login successful');
});

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate('enrolledCourses.course', 'title thumbnail slug')
    .populate('wishlist', 'title thumbnail slug price instructor');

  res.status(200).json({ success: true, data: user });
});

// @desc    Logout
// @route   POST /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.status(404);
    throw new Error('No user found with this email');
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      to:      user.email,
      subject: '🔑 EduFlow — Password Reset Request',
      html:    `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;">
          <h2 style="color:#6C63FF;">Reset Your Password</h2>
          <p>You requested a password reset. Click below to set a new password:</p>
          <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#6C63FF;color:white;border-radius:8px;text-decoration:none;font-weight:bold;">Reset Password</a>
          <p style="color:#888;margin-top:20px;">This link expires in <strong>10 minutes</strong>. If you didn't request this, ignore this email.</p>
        </div>
      `,
    });

    res.status(200).json({ success: true, message: 'Password reset email sent' });
  } catch {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500);
    throw new Error('Email could not be sent. Try again later.');
  }
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken:  hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password reset successful');
});

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    emailVerifyToken:  hashedToken,
    emailVerifyExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired verification link');
  }

  user.isVerified = true;
  user.emailVerifyToken = undefined;
  user.emailVerifyExpire = undefined;
  await user.save();

  res.status(200).json({ success: true, message: 'Email verified successfully' });
});
