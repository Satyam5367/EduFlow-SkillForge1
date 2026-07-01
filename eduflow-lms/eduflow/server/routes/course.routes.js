const express = require('express');
const router = express.Router();
const {
  getCourses, getCourse, getMyCourses, createCourse,
  updateCourse, deleteCourse, enrollCourse,
  submitCourse, getFeaturedCourses, getCategories,
} = require('../controllers/course.controller');
const {
  addSection, updateSection, deleteSection,
  addLecture, updateProgress, deleteLecture,
} = require('../controllers/lecture.controller');
const { getCourseReviews, addReview } = require('../controllers/user.controller');
const { protect, authorize, optionalAuth } = require('../middleware/auth.middleware');
const { uploadImage, uploadVideo } = require('../config/cloudinary');

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Get all published courses with filters
 *     tags: [Courses]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Full-text search
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         example: Web Development
 *       - in: query
 *         name: level
 *         schema: { type: string, enum: [Beginner, Intermediate, Advanced, All Levels] }
 *       - in: query
 *         name: free
 *         schema: { type: boolean }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [-createdAt, -totalStudents, -avgRating, price, -price] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 12 }
 *     responses:
 *       200:
 *         description: List of courses
 */
router.get('/', optionalAuth, getCourses);

/**
 * @swagger
 * /courses/featured:
 *   get:
 *     summary: Get featured courses for homepage
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: Featured courses list
 */
router.get('/featured', getFeaturedCourses);

/**
 * @swagger
 * /courses/categories:
 *   get:
 *     summary: Get all categories with course counts
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: Category list with counts
 */
router.get('/categories', getCategories);

/**
 * @swagger
 * /courses/my-courses:
 *   get:
 *     summary: Get instructor's own courses
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Instructor's course list
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/my-courses', protect, authorize('instructor', 'admin'), getMyCourses);

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Get single course by ID or slug
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Course ID or slug
 *     responses:
 *       200:
 *         description: Course details
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', optionalAuth, getCourse);

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, description, category, level]
 *             properties:
 *               title:            { type: string }
 *               subtitle:         { type: string }
 *               description:      { type: string }
 *               category:         { type: string }
 *               level:            { type: string }
 *               price:            { type: number }
 *               thumbnail:        { type: string, format: binary }
 *               requirements:     { type: string, description: "JSON array string" }
 *               learningOutcomes: { type: string, description: "JSON array string" }
 *               tags:             { type: string, description: "JSON array string" }
 *     responses:
 *       201:
 *         description: Course created
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/', protect, authorize('instructor', 'admin'), uploadImage.single('thumbnail'), createCourse);

/**
 * @swagger
 * /courses/{id}:
 *   put:
 *     summary: Update a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:     { type: string }
 *               thumbnail: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Course updated
 */
router.put('/:id',    protect, authorize('instructor', 'admin'), uploadImage.single('thumbnail'), updateCourse);

/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     summary: Delete a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Course deleted
 */
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteCourse);

/**
 * @swagger
 * /courses/{id}/submit:
 *   put:
 *     summary: Submit course for admin review
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Course submitted for review
 */
router.put('/:id/submit', protect, authorize('instructor'), submitCourse);

/**
 * @swagger
 * /courses/{id}/enroll:
 *   post:
 *     summary: Enroll in a free course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Enrolled successfully
 *       400:
 *         description: Already enrolled or course is paid
 */
router.post('/:id/enroll', protect, authorize('student'), enrollCourse);

// Reviews
/**
 * @swagger
 * /courses/{courseId}/reviews:
 *   get:
 *     summary: Get reviews for a course
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: rating
 *         schema: { type: integer, minimum: 1, maximum: 5 }
 *     responses:
 *       200:
 *         description: Reviews list with rating distribution
 *   post:
 *     summary: Add a review (enrolled students only)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating, comment]
 *             properties:
 *               rating:  { type: integer, minimum: 1, maximum: 5 }
 *               comment: { type: string, minLength: 10 }
 *     responses:
 *       201:
 *         description: Review added
 */
router.get('/:courseId/reviews',  optionalAuth, getCourseReviews);
router.post('/:courseId/reviews', protect, authorize('student'), addReview);

// Sections
/**
 * @swagger
 * /courses/{courseId}/sections:
 *   post:
 *     summary: Add a section to a course
 *     tags: [Sections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string, example: Introduction to React }
 *     responses:
 *       201:
 *         description: Section added
 */
router.post('/:courseId/sections',                  protect, authorize('instructor', 'admin'), addSection);
router.put('/:courseId/sections/:sectionId',        protect, authorize('instructor', 'admin'), updateSection);
router.delete('/:courseId/sections/:sectionId',     protect, authorize('instructor', 'admin'), deleteSection);

// Lectures
/**
 * @swagger
 * /courses/{courseId}/sections/{sectionId}/lectures:
 *   post:
 *     summary: Add a lecture to a section
 *     tags: [Lectures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: sectionId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:       { type: string }
 *               description: { type: string }
 *               isPreview:   { type: boolean }
 *               duration:    { type: number, description: Duration in seconds }
 *               video:       { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Lecture added
 */
router.post('/:courseId/sections/:sectionId/lectures', protect, authorize('instructor', 'admin'), uploadVideo.single('video'), addLecture);

/**
 * @swagger
 * /courses/{courseId}/sections/{sectionId}/lectures/{lectureId}/progress:
 *   put:
 *     summary: Update lecture watch progress
 *     tags: [Lectures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: sectionId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: lectureId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               completed:  { type: boolean }
 *               watchTime:  { type: number }
 *               timestamp:  { type: number, description: Video position in seconds }
 *     responses:
 *       200:
 *         description: Progress updated
 */
router.put('/:courseId/sections/:sectionId/lectures/:lectureId/progress', protect, updateProgress);
router.delete('/:courseId/sections/:sectionId/lectures/:lectureId',       protect, authorize('instructor', 'admin'), deleteLecture);

module.exports = router;
