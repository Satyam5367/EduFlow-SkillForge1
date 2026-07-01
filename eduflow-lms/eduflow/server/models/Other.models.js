const mongoose = require('mongoose');

// ═══════════════════════════════════════════════════════════════
// REVIEW MODEL
// ═══════════════════════════════════════════════════════════════
const reviewSchema = new mongoose.Schema({
  user: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
  },
  course: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'Course',
    required: true,
  },
  rating: {
    type:     Number,
    required: [true, 'Rating is required'],
    min:      1,
    max:      5,
  },
  comment: {
    type:     String,
    required: [true, 'Review comment is required'],
    minlength: [10, 'Comment must be at least 10 characters'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters'],
  },
  helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reply: {
    text:      String,
    repliedAt: Date,
  },
}, { timestamps: true });

// One review per user per course
reviewSchema.index({ user: 1, course: 1 }, { unique: true });

// Update course avgRating after save
reviewSchema.post('save', async function () {
  const Course = mongoose.model('Course');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { course: this.course } },
    { $group: { _id: '$course', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Course.findByIdAndUpdate(this.course, {
      avgRating:    Math.round(stats[0].avgRating * 10) / 10,
      totalRatings: stats[0].count,
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// PROGRESS MODEL
// ═══════════════════════════════════════════════════════════════
const progressSchema = new mongoose.Schema({
  user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  completedLectures: [{
    lecture:     { type: mongoose.Schema.Types.ObjectId },
    completedAt: { type: Date, default: Date.now },
    watchTime:   { type: Number, default: 0 }, // seconds watched
  }],
  lastWatched: {
    lecture:   { type: mongoose.Schema.Types.ObjectId },
    section:   { type: mongoose.Schema.Types.ObjectId },
    timestamp: { type: Number, default: 0 }, // position in video
  },
  overallProgress: { type: Number, default: 0 }, // 0-100 %
  isCompleted:     { type: Boolean, default: false },
  completedAt:     Date,
  certificateUrl:  { type: String, default: '' },
  quizScores: [{
    lectureId: mongoose.Schema.Types.ObjectId,
    score:     Number,
    takenAt:   { type: Date, default: Date.now },
  }],
}, { timestamps: true });

progressSchema.index({ user: 1, course: 1 }, { unique: true });

// ═══════════════════════════════════════════════════════════════
// PAYMENT MODEL
// ═══════════════════════════════════════════════════════════════
const paymentSchema = new mongoose.Schema({
  user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  razorpay: {
    orderId:    { type: String },
    paymentId:  { type: String },
    signature:  { type: String },
  },
  amount:   { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: {
    type:    String,
    enum:    ['created', 'completed', 'failed', 'refunded'],
    default: 'created',
  },
  couponUsed:    { type: String, default: '' },
  discountAmount:{ type: Number, default: 0 },
  refundReason:  { type: String, default: '' },
  refundedAt:    Date,
}, { timestamps: true });

paymentSchema.index({ user: 1 });
paymentSchema.index({ course: 1 });
paymentSchema.index({ 'razorpay.paymentId': 1 });

module.exports = {
  Review:   mongoose.model('Review', reviewSchema),
  Progress: mongoose.model('Progress', progressSchema),
  Payment:  mongoose.model('Payment', paymentSchema),
};
