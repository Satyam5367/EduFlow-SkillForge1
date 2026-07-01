const asyncHandler = require('express-async-handler');
const User = require('../models/User.model');
const Course = require('../models/Course.model');
const { Payment, Review } = require('../models/Other.models');

// @desc    Get platform analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
exports.getAnalytics = asyncHandler(async (req, res) => {
  const [
    totalUsers, totalInstructors, totalStudents,
    totalCourses, publishedCourses,
    totalRevenue, recentPayments,
    recentUsers,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'instructor' }),
    User.countDocuments({ role: 'student' }),
    Course.countDocuments(),
    Course.countDocuments({ status: 'published', isApproved: true }),
    Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Payment.find({ status: 'completed' })
      .populate('user', 'name email')
      .populate('course', 'title')
      .sort('-createdAt')
      .limit(10),
    User.find().sort('-createdAt').limit(10).select('name email role createdAt avatar'),
  ]);

  // Monthly data for last 12 months
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const monthlyStats = await Payment.aggregate([
    { $match: { status: 'completed', createdAt: { $gte: oneYearAgo } } },
    {
      $group: {
        _id:     { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        revenue: { $sum: '$amount' },
        count:   { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const categoryStats = await Course.aggregate([
    { $match: { status: 'published', isApproved: true } },
    { $group: { _id: '$category', count: { $sum: 1 }, students: { $sum: '$totalStudents' } } },
    { $sort: { count: -1 } },
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalUsers, totalInstructors, totalStudents,
        totalCourses, publishedCourses,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      monthlyStats,
      categoryStats,
      recentPayments,
      recentUsers,
    },
  });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (role)   query.role = role;
  if (search) query.$or = [
    { name:  { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .sort('-createdAt')
    .skip(skip)
    .limit(Number(limit))
    .select('-password');

  res.status(200).json({ success: true, total, data: users });
});

// @desc    Update user (role, status)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = asyncHandler(async (req, res) => {
  const { role, isActive, isInstructorApproved } = req.body;
  const updates = {};
  if (role !== undefined)                 updates.role = role;
  if (isActive !== undefined)             updates.isActive = isActive;
  if (isInstructorApproved !== undefined) updates.isInstructorApproved = isInstructorApproved;

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
  if (!user) { res.status(404); throw new Error('User not found'); }

  res.status(200).json({ success: true, data: user, message: 'User updated' });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  if (user.role === 'admin') { res.status(400); throw new Error('Cannot delete admin user'); }
  await user.deleteOne();
  res.status(200).json({ success: true, message: 'User deleted' });
});

// @desc    Get all courses (admin)
// @route   GET /api/admin/courses
// @access  Private (Admin)
exports.getCourses = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Course.countDocuments(query);
  const courses = await Course.find(query)
    .populate('instructor', 'name email avatar')
    .sort('-createdAt')
    .skip(skip)
    .limit(Number(limit))
    .select('-sections');

  res.status(200).json({ success: true, total, data: courses });
});

// @desc    Approve or reject course
// @route   PUT /api/admin/courses/:id/review
// @access  Private (Admin)
exports.reviewCourse = asyncHandler(async (req, res) => {
  const { action, reason } = req.body; // action: 'approve' | 'reject'

  const course = await Course.findById(req.params.id).populate('instructor', 'email name');
  if (!course) { res.status(404); throw new Error('Course not found'); }

  if (action === 'approve') {
    course.isApproved = true;
    course.status = 'published';
  } else {
    course.isApproved = false;
    course.status = 'draft';
  }
  await course.save();

  res.status(200).json({
    success: true,
    message: `Course ${action === 'approve' ? 'approved and published' : 'rejected'}`,
    data: course,
  });
});
