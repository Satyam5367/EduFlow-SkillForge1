const asyncHandler = require('express-async-handler');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Course = require('../models/Course.model');
const User = require('../models/User.model');
const { Payment, Progress } = require('../models/Other.models');
const sendEmail = require('../utils/email.util');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay order
// @route   POST /api/payments/order
// @access  Private
exports.createOrder = asyncHandler(async (req, res) => {
  const { courseId, couponCode } = req.body;

  const course = await Course.findById(courseId);
  if (!course) { res.status(404); throw new Error('Course not found'); }

  // Check already enrolled
  const user = await User.findById(req.user._id);
  const alreadyEnrolled = user.enrolledCourses.some(e => e.course.toString() === courseId);
  if (alreadyEnrolled) { res.status(400); throw new Error('Already enrolled'); }

  let amount = course.effectivePrice;
  let discountAmount = 0;

  // Apply coupon
  if (couponCode && course.couponCode) {
    if (
      couponCode.toUpperCase() === course.couponCode.toUpperCase() &&
      (!course.couponExpiry || new Date() < course.couponExpiry)
    ) {
      discountAmount = (amount * course.couponDiscount) / 100;
      amount = amount - discountAmount;
    }
  }

  const amountInPaise = Math.round(amount * 100);

  const options = {
    amount:   amountInPaise,
    currency: 'INR',
    receipt:  `receipt_${Date.now()}`,
    notes:    { courseId, userId: req.user._id.toString() },
  };

  const order = await razorpay.orders.create(options);

  // Save pending payment
  const payment = await Payment.create({
    user:           req.user._id,
    course:         courseId,
    razorpay:       { orderId: order.id },
    amount,
    discountAmount,
    couponUsed:     couponCode || '',
    status:         'created',
  });

  res.status(200).json({
    success: true,
    data: {
      orderId:    order.id,
      amount:     order.amount,
      currency:   order.currency,
      paymentId:  payment._id,
      key:        process.env.RAZORPAY_KEY_ID,
      courseName: course.title,
      userName:   user.name,
      userEmail:  user.email,
    },
  });
});

// @desc    Verify payment & enroll student
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;

  // Verify signature
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    res.status(400);
    throw new Error('Payment verification failed - invalid signature');
  }

  // Update payment record
  const payment = await Payment.findOneAndUpdate(
    { 'razorpay.orderId': razorpay_order_id, user: req.user._id },
    {
      'razorpay.paymentId':  razorpay_payment_id,
      'razorpay.signature':  razorpay_signature,
      status: 'completed',
    },
    { new: true }
  );

  if (!payment) { res.status(404); throw new Error('Payment record not found'); }

  // Enroll student
  await User.findByIdAndUpdate(req.user._id, {
    $push: { enrolledCourses: { course: courseId, enrolledAt: new Date() } },
  });

  // Create progress record
  await Progress.create({ user: req.user._id, course: courseId });

  // Update course revenue and student count
  const course = await Course.findByIdAndUpdate(courseId, {
    $inc: { totalStudents: 1, totalRevenue: payment.amount },
  }).populate('instructor', 'email name');

  // Send confirmation email
  try {
    await sendEmail({
      to:      req.user.email,
      subject: `🎉 Enrollment Confirmed — ${course.title}`,
      html:    `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;">
          <h2 style="color:#6C63FF;">You're enrolled! 🎓</h2>
          <p>Hi ${req.user.name},</p>
          <p>Your payment was successful and you're now enrolled in:</p>
          <h3 style="color:#333;">${course.title}</h3>
          <p>Amount paid: ₹${payment.amount}</p>
          <p>Payment ID: ${razorpay_payment_id}</p>
          <a href="${process.env.CLIENT_URL}/learn/${courseId}" style="display:inline-block;padding:12px 24px;background:#6C63FF;color:white;border-radius:8px;text-decoration:none;font-weight:bold;">Start Learning →</a>
        </div>
      `,
    });
  } catch (e) {
    console.error('Email send error:', e.message);
  }

  res.status(200).json({ success: true, message: 'Payment verified & enrolled successfully!', data: payment });
});

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
exports.getPaymentHistory = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ user: req.user._id, status: 'completed' })
    .populate('course', 'title thumbnail slug')
    .sort('-createdAt');

  res.status(200).json({ success: true, count: payments.length, data: payments });
});

// @desc    Get instructor revenue
// @route   GET /api/payments/instructor-revenue
// @access  Private (Instructor)
exports.getInstructorRevenue = asyncHandler(async (req, res) => {
  // Get all courses by instructor
  const courses = await Course.find({ instructor: req.user._id }).select('_id title totalRevenue totalStudents');
  const courseIds = courses.map(c => c._id);

  const payments = await Payment.find({ course: { $in: courseIds }, status: 'completed' })
    .populate('course', 'title')
    .populate('user', 'name email')
    .sort('-createdAt')
    .limit(50);

  const totalRevenue = courses.reduce((sum, c) => sum + c.totalRevenue, 0);
  const totalStudents = courses.reduce((sum, c) => sum + c.totalStudents, 0);

  // Monthly revenue for chart (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyRevenue = await Payment.aggregate([
    { $match: { course: { $in: courseIds }, status: 'completed', createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id:     { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
        revenue: { $sum: '$amount' },
        count:   { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  res.status(200).json({
    success: true,
    data: { totalRevenue, totalStudents, courses, payments, monthlyRevenue },
  });
});
