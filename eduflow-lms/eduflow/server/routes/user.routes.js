const express = require('express');
const router = express.Router();
const {
  getProfile, updateProfile, changePassword,
  toggleWishlist, getEnrolledCourses, applyAsInstructor,
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { uploadAvatar } = require('../config/cloudinary');

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get current user's full profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile with enrolled courses and wishlist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:    { $ref: '#/components/schemas/User' }
 *   put:
 *     summary: Update user profile (name, bio, headline, avatar)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:     { type: string }
 *               bio:      { type: string }
 *               headline: { type: string }
 *               website:  { type: string }
 *               avatar:   { type: string, format: binary }
 *               social:   { type: string, description: JSON string of social links }
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.get('/profile', protect, getProfile);
router.put('/profile', protect, uploadAvatar.single('avatar'), updateProfile);

/**
 * @swagger
 * /users/change-password:
 *   put:
 *     summary: Change password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword:     { type: string, minLength: 6 }
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Current password incorrect
 */
router.put('/change-password', protect, changePassword);

/**
 * @swagger
 * /users/enrolled-courses:
 *   get:
 *     summary: Get all courses the current user is enrolled in
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of enrolled courses with progress
 */
router.get('/enrolled-courses', protect, getEnrolledCourses);

/**
 * @swagger
 * /users/wishlist/{courseId}:
 *   post:
 *     summary: Toggle course in/out of wishlist
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Wishlist updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 added:   { type: boolean }
 *                 message: { type: string }
 */
router.post('/wishlist/:courseId', protect, toggleWishlist);

/**
 * @swagger
 * /users/apply-instructor:
 *   post:
 *     summary: Apply to become an instructor
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [expertise, experience]
 *             properties:
 *               expertise:  { type: string, example: "Full Stack Web Development, React, Node.js" }
 *               experience: { type: string, example: "5 years of professional development experience" }
 *     responses:
 *       200:
 *         description: Application submitted successfully
 *       400:
 *         description: Already an instructor
 */
router.post('/apply-instructor', protect, applyAsInstructor);

module.exports = router;
