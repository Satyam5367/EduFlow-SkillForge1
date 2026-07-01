const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    default: 'student',
  },
  avatar: {
    public_id: { type: String, default: '' },
    url:       { type: String, default: 'https://ui-avatars.com/api/?background=6C63FF&color=fff&name=User' },
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: '',
  },
  headline: { type: String, default: '' },
  website:  { type: String, default: '' },
  social: {
    twitter:  { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github:   { type: String, default: '' },
  },
  // Instructor specific
  isInstructorApproved: { type: Boolean, default: false },
  instructorApplication: {
    submittedAt: Date,
    expertise:   String,
    experience:  String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  // Student specific
  enrolledCourses: [{
    course:      { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    enrolledAt:  { type: Date, default: Date.now },
    completedAt: Date,
    progress:    { type: Number, default: 0 },
    certificateIssued: { type: Boolean, default: false },
  }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  // Auth
  isVerified:        { type: Boolean, default: false },
  isActive:          { type: Boolean, default: true },
  emailVerifyToken:  String,
  emailVerifyExpire: Date,
  resetPasswordToken:  String,
  resetPasswordExpire: Date,
  lastLogin:         Date,
}, { timestamps: true });

// ─── Indexes ────────────────────────────────────────────────────────
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// ─── Pre-save: Hash password ────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  // Auto-set avatar URL from name
  if (!this.avatar.url || this.avatar.url.includes('ui-avatars')) {
    this.avatar.url = `https://ui-avatars.com/api/?background=6C63FF&color=fff&name=${encodeURIComponent(this.name)}&size=200`;
  }
  next();
});

// ─── Methods ─────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.getSignedJWT = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min
  return resetToken;
};

userSchema.methods.getEmailVerifyToken = function () {
  const verifyToken = crypto.randomBytes(20).toString('hex');
  this.emailVerifyToken = crypto.createHash('sha256').update(verifyToken).digest('hex');
  this.emailVerifyExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return verifyToken;
};

module.exports = mongoose.model('User', userSchema);
