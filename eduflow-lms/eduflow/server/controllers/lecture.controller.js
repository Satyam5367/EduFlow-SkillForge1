const asyncHandler = require('express-async-handler');
const Course = require('../models/Course.model');
const { Progress } = require('../models/Other.models');
const { cloudinary } = require('../config/cloudinary');

// ═══════════════════════════════════════
// SECTION CONTROLLERS
// ═══════════════════════════════════════

// @desc    Add section to course
// @route   POST /api/courses/:courseId/sections
// @access  Private (Instructor)
exports.addSection = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) { res.status(404); throw new Error('Course not found'); }
  if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }

  const { title } = req.body;
  const order = course.sections.length + 1;
  course.sections.push({ title, order, lectures: [] });
  await course.save();

  res.status(201).json({ success: true, data: course, message: 'Section added' });
});

// @desc    Update section
// @route   PUT /api/courses/:courseId/sections/:sectionId
// @access  Private (Instructor)
exports.updateSection = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) { res.status(404); throw new Error('Course not found'); }
  if (course.instructor.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized');
  }

  const section = course.sections.id(req.params.sectionId);
  if (!section) { res.status(404); throw new Error('Section not found'); }

  section.title = req.body.title || section.title;
  section.order = req.body.order || section.order;
  await course.save();

  res.status(200).json({ success: true, data: course, message: 'Section updated' });
});

// @desc    Delete section
// @route   DELETE /api/courses/:courseId/sections/:sectionId
// @access  Private (Instructor)
exports.deleteSection = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) { res.status(404); throw new Error('Course not found'); }
  if (course.instructor.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized');
  }

  // Delete all video files in section
  const section = course.sections.id(req.params.sectionId);
  if (!section) { res.status(404); throw new Error('Section not found'); }

  for (const lecture of section.lectures) {
    if (lecture.video?.public_id) {
      await cloudinary.uploader.destroy(lecture.video.public_id, { resource_type: 'video' });
    }
  }

  course.sections.pull(req.params.sectionId);
  await course.save();

  res.status(200).json({ success: true, message: 'Section deleted' });
});

// ═══════════════════════════════════════
// LECTURE CONTROLLERS
// ═══════════════════════════════════════

// @desc    Add lecture to section
// @route   POST /api/courses/:courseId/sections/:sectionId/lectures
// @access  Private (Instructor)
exports.addLecture = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) { res.status(404); throw new Error('Course not found'); }
  if (course.instructor.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized');
  }

  const section = course.sections.id(req.params.sectionId);
  if (!section) { res.status(404); throw new Error('Section not found'); }

  const { title, description, isPreview, duration } = req.body;
  const order = section.lectures.length + 1;

  const lecture = {
    title,
    description: description || '',
    isPreview:   isPreview === 'true',
    order,
    video: req.file
      ? { public_id: req.file.filename, url: req.file.path, duration: Number(duration) || 0 }
      : { public_id: '', url: '', duration: 0 },
  };

  section.lectures.push(lecture);
  await course.save();

  res.status(201).json({ success: true, data: course, message: 'Lecture added' });
});

// @desc    Update lecture progress
// @route   PUT /api/courses/:courseId/sections/:sectionId/lectures/:lectureId/progress
// @access  Private (Student)
exports.updateProgress = asyncHandler(async (req, res) => {
  const { courseId, lectureId } = req.params;
  const { watchTime, completed, timestamp } = req.body;

  const course = await Course.findById(courseId);
  if (!course) { res.status(404); throw new Error('Course not found'); }

  let progress = await Progress.findOne({ user: req.user._id, course: courseId });
  if (!progress) {
    progress = await Progress.create({ user: req.user._id, course: courseId });
  }

  // Update last watched
  progress.lastWatched = { lecture: lectureId, timestamp: timestamp || 0 };

  // Mark as completed
  if (completed) {
    const alreadyCompleted = progress.completedLectures.some(
      l => l.lecture.toString() === lectureId
    );
    if (!alreadyCompleted) {
      progress.completedLectures.push({ lecture: lectureId, watchTime: watchTime || 0 });
    }
  }

  // Calculate overall progress
  const totalLectures = course.totalLectures;
  progress.overallProgress = totalLectures > 0
    ? Math.round((progress.completedLectures.length / totalLectures) * 100)
    : 0;

  if (progress.overallProgress === 100 && !progress.isCompleted) {
    progress.isCompleted = true;
    progress.completedAt = new Date();
  }

  await progress.save();

  res.status(200).json({ success: true, data: progress });
});

// @desc    Delete lecture
// @route   DELETE /api/courses/:courseId/sections/:sectionId/lectures/:lectureId
// @access  Private (Instructor)
exports.deleteLecture = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) { res.status(404); throw new Error('Course not found'); }
  if (course.instructor.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized');
  }

  const section = course.sections.id(req.params.sectionId);
  if (!section) { res.status(404); throw new Error('Section not found'); }

  const lecture = section.lectures.id(req.params.lectureId);
  if (!lecture) { res.status(404); throw new Error('Lecture not found'); }

  if (lecture.video?.public_id) {
    await cloudinary.uploader.destroy(lecture.video.public_id, { resource_type: 'video' });
  }

  section.lectures.pull(req.params.lectureId);
  await course.save();

  res.status(200).json({ success: true, message: 'Lecture deleted' });
});
