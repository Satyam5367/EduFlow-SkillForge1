const asyncHandler = require('express-async-handler');
const Course = require('../models/Course.model');
const User = require('../models/User.model');
const { Progress } = require('../models/Other.models');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all courses (with filters, search, pagination)
// @route   GET /api/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res) => {
  const {
    search, category, level, minPrice, maxPrice,
    sort = '-createdAt', page = 1, limit = 12, free,
  } = req.query;

  const query = { status: 'published', isApproved: true };

  if (search) {
    query.$text = { $search: search };
  }
  if (category)  query.category = category;
  if (level)     query.level = level;
  if (free === 'true') query.isFree = true;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Course.countDocuments(query);

  const courses = await Course.find(query)
    .populate('instructor', 'name avatar headline')
    .sort(sort)
    .skip(skip)
    .limit(Number(limit))
    .select('-sections');

  res.status(200).json({
    success: true,
    total,
    page:     Number(page),
    pages:    Math.ceil(total / Number(limit)),
    data:     courses,
  });
});

// @desc    Get single course (full details)
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findOne({
    $or: [{ _id: req.params.id.length === 24 ? req.params.id : null }, { slug: req.params.id }],
    status: 'published',
    isApproved: true,
  })
    .populate('instructor', 'name avatar bio headline social totalStudents avgRating')
    .populate({ path: 'reviews', populate: { path: 'user', select: 'name avatar' }, options: { limit: 10, sort: '-createdAt' } });

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // Check enrollment if user logged in
  let isEnrolled = false;
  let progress = null;
  if (req.user) {
    const enrollment = req.user.enrolledCourses?.find(e => e.course.toString() === course._id.toString());
    isEnrolled = !!enrollment;
    if (isEnrolled) {
      progress = await Progress.findOne({ user: req.user._id, course: course._id });
    }
  }

  // Filter locked lectures (non-preview) for unenrolled users
  const courseData = course.toObject();
  if (!isEnrolled) {
    courseData.sections = courseData.sections.map(section => ({
      ...section,
      lectures: section.lectures.map(lec => ({
        ...lec,
        video: lec.isPreview ? lec.video : { url: '', duration: lec.video.duration },
      })),
    }));
  }

  res.status(200).json({ success: true, data: courseData, isEnrolled, progress });
});

// @desc    Get instructor's own courses
// @route   GET /api/courses/my-courses
// @access  Private (Instructor)
exports.getMyCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: req.user._id })
    .sort('-createdAt')
    .select('title slug thumbnail price status totalStudents avgRating totalRevenue createdAt');

  res.status(200).json({ success: true, count: courses.length, data: courses });
});

// @desc    Create course
// @route   POST /api/courses
// @access  Private (Instructor)
exports.createCourse = asyncHandler(async (req, res) => {
  const { title, subtitle, description, category, level, price, requirements, learningOutcomes, tags } = req.body;

  const course = await Course.create({
    title,
    subtitle,
    description,
    category,
    level,
    price:            Number(price) || 0,
    instructor:       req.user._id,
    requirements:     requirements ? JSON.parse(requirements) : [],
    learningOutcomes: learningOutcomes ? JSON.parse(learningOutcomes) : [],
    tags:             tags ? JSON.parse(tags) : [],
    thumbnail:        req.file ? { public_id: req.file.filename, url: req.file.path } : undefined,
  });

  res.status(201).json({ success: true, data: course, message: 'Course created successfully' });
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Instructor/Admin)
exports.updateCourse = asyncHandler(async (req, res) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this course');
  }

  const updates = { ...req.body };
  if (req.file) {
    if (course.thumbnail.public_id) {
      await cloudinary.uploader.destroy(course.thumbnail.public_id);
    }
    updates.thumbnail = { public_id: req.file.filename, url: req.file.path };
  }
  if (updates.requirements)      updates.requirements = JSON.parse(updates.requirements);
  if (updates.learningOutcomes)  updates.learningOutcomes = JSON.parse(updates.learningOutcomes);
  if (updates.tags)              updates.tags = JSON.parse(updates.tags);
  if (updates.price !== undefined) updates.isFree = Number(updates.price) === 0;

  // Reset approval if instructor edits published course
  if (course.isApproved && req.user.role !== 'admin') {
    updates.isApproved = false;
    updates.status = 'pending';
  }

  course = await Course.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });

  res.status(200).json({ success: true, data: course, message: 'Course updated' });
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Instructor/Admin)
exports.deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this course');
  }

  if (course.thumbnail.public_id) {
    await cloudinary.uploader.destroy(course.thumbnail.public_id);
  }

  await course.deleteOne();
  res.status(200).json({ success: true, message: 'Course deleted' });
});

// @desc    Enroll in free course
// @route   POST /api/courses/:id/enroll
// @access  Private (Student)
exports.enrollCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) { res.status(404); throw new Error('Course not found'); }
  if (!course.isFree) { res.status(400); throw new Error('This is a paid course. Please complete payment.'); }

  const user = await User.findById(req.user._id);
  const alreadyEnrolled = user.enrolledCourses.some(e => e.course.toString() === course._id.toString());

  if (alreadyEnrolled) {
    res.status(400);
    throw new Error('Already enrolled in this course');
  }

  user.enrolledCourses.push({ course: course._id });
  await user.save();

  await Progress.create({ user: req.user._id, course: course._id });
  await Course.findByIdAndUpdate(course._id, { $inc: { totalStudents: 1 } });

  res.status(200).json({ success: true, message: 'Enrolled successfully!' });
});

// @desc    Submit course for review
// @route   PUT /api/courses/:id/submit
// @access  Private (Instructor)
exports.submitCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) { res.status(404); throw new Error('Course not found'); }
  if (course.instructor.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized');
  }
  if (course.sections.length === 0) {
    res.status(400); throw new Error('Add at least one section before submitting');
  }

  course.status = 'pending';
  await course.save();

  res.status(200).json({ success: true, message: 'Course submitted for review!' });
});

// @desc    Get featured courses
// @route   GET /api/courses/featured
// @access  Public
exports.getFeaturedCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ status: 'published', isApproved: true, featured: true })
    .populate('instructor', 'name avatar')
    .sort('-avgRating')
    .limit(8)
    .select('-sections');

  res.status(200).json({ success: true, data: courses });
});

// @desc    Get course categories with counts
// @route   GET /api/courses/categories
// @access  Public
exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Course.aggregate([
    { $match: { status: 'published', isApproved: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  res.status(200).json({ success: true, data: categories });
});
