const asyncHandler = require('express-async-handler');
const { Review } = require('../models/Other.models');
const User = require('../models/User.model');
const Course = require('../models/Course.model');
const { cloudinary } = require('../config/cloudinary');

// ═══════════════════════════════════════
// REVIEW CONTROLLERS
// ═══════════════════════════════════════

exports.getCourseReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, rating } = req.query;
  const query = { course: req.params.courseId };
  if (rating) query.rating = Number(rating);

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Review.countDocuments(query);
  const reviews = await Review.find(query)
    .populate('user', 'name avatar')
    .sort('-createdAt')
    .skip(skip)
    .limit(Number(limit));

  // Rating distribution
  const distribution = await Review.aggregate([
    { $match: { course: require('mongoose').Types.ObjectId.createFromHexString(req.params.courseId) } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } },
  ]);

  res.status(200).json({ success: true, total, data: reviews, distribution });
});

exports.addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const courseId = req.params.courseId;

  // Check enrollment
  const user = await User.findById(req.user._id);
  const enrolled = user.enrolledCourses.some(e => e.course.toString() === courseId);
  if (!enrolled) { res.status(403); throw new Error('You must enroll before reviewing'); }

  // Check existing review
  const existing = await Review.findOne({ user: req.user._id, course: courseId });
  if (existing) { res.status(400); throw new Error('You already reviewed this course'); }

  const review = await Review.create({ user: req.user._id, course: courseId, rating, comment });
  await review.populate('user', 'name avatar');

  res.status(201).json({ success: true, data: review, message: 'Review added' });
});

exports.updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) { res.status(404); throw new Error('Review not found'); }
  if (review.user.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized');
  }

  review.rating  = req.body.rating  || review.rating;
  review.comment = req.body.comment || review.comment;
  await review.save();

  res.status(200).json({ success: true, data: review, message: 'Review updated' });
});

exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) { res.status(404); throw new Error('Review not found'); }
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }
  await review.deleteOne();
  res.status(200).json({ success: true, message: 'Review deleted' });
});

exports.markHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) { res.status(404); throw new Error('Review not found'); }

  const idx = review.helpful.indexOf(req.user._id);
  if (idx === -1) {
    review.helpful.push(req.user._id);
  } else {
    review.helpful.splice(idx, 1);
  }
  await review.save();
  res.status(200).json({ success: true, helpfulCount: review.helpful.length });
});

// ═══════════════════════════════════════
// USER CONTROLLERS
// ═══════════════════════════════════════

exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('enrolledCourses.course', 'title thumbnail slug totalLectures')
    .populate('wishlist', 'title thumbnail slug price instructor avgRating');
  res.status(200).json({ success: true, data: user });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, headline, website, social } = req.body;
  const updates = {};
  if (name)     updates.name = name;
  if (bio)      updates.bio = bio;
  if (headline) updates.headline = headline;
  if (website)  updates.website = website;
  if (social)   updates.social = JSON.parse(social);

  if (req.file) {
    const user = await User.findById(req.user._id);
    if (user.avatar.public_id) {
      await cloudinary.uploader.destroy(user.avatar.public_id);
    }
    updates.avatar = { public_id: req.file.filename, url: req.file.path };
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.status(200).json({ success: true, data: user, message: 'Profile updated' });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    res.status(400); throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();
  res.status(200).json({ success: true, message: 'Password changed successfully' });
});

exports.toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const courseId = req.params.courseId;
  const idx = user.wishlist.indexOf(courseId);

  if (idx === -1) {
    user.wishlist.push(courseId);
  } else {
    user.wishlist.splice(idx, 1);
  }
  await user.save();

  res.status(200).json({
    success:  true,
    added:    idx === -1,
    message:  idx === -1 ? 'Added to wishlist' : 'Removed from wishlist',
  });
});

exports.getEnrolledCourses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('enrolledCourses.course', 'title thumbnail slug instructor totalLectures avgRating');
  res.status(200).json({ success: true, data: user.enrolledCourses });
});

exports.applyAsInstructor = asyncHandler(async (req, res) => {
  const { expertise, experience } = req.body;
  const user = await User.findById(req.user._id);

  if (user.role === 'instructor') {
    res.status(400); throw new Error('You are already an instructor');
  }

  user.instructorApplication = {
    submittedAt: new Date(),
    expertise,
    experience,
    status: 'pending',
  };
  await user.save();

  res.status(200).json({ success: true, message: 'Application submitted! We will review it within 2-3 business days.' });
});
