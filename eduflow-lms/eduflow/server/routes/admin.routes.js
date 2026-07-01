const express = require('express');
const router = express.Router();
const {
  getAnalytics, getUsers, updateUser,
  deleteUser, getCourses, reviewCourse,
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect, authorize('admin'));

/**
 * @swagger
 * /admin/analytics:
 *   get:
 *     summary: Get full platform analytics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Platform analytics including revenue, users, monthly stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     overview:       { type: object }
 *                     monthlyStats:   { type: array }
 *                     categoryStats:  { type: array }
 *                     recentPayments: { type: array }
 *                     recentUsers:    { type: array }
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/analytics', getAnalytics);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users with optional filters
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [student, instructor, admin] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by name or email
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Paginated list of users
 */
router.get('/users', getUsers);

/**
 * @swagger
 * /admin/users/{id}:
 *   put:
 *     summary: Update user role or active status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:                 { type: string, enum: [student, instructor, admin] }
 *               isActive:             { type: boolean }
 *               isInstructorApproved: { type: boolean }
 *     responses:
 *       200:
 *         description: User updated
 *   delete:
 *     summary: Delete a user permanently
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User deleted
 *       400:
 *         description: Cannot delete admin user
 */
router.put('/users/:id',    updateUser);
router.delete('/users/:id', deleteUser);

/**
 * @swagger
 * /admin/courses:
 *   get:
 *     summary: Get all courses for admin review
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [draft, pending, published, archived] }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Paginated list of all courses
 */
router.get('/courses', getCourses);

/**
 * @swagger
 * /admin/courses/{id}/review:
 *   put:
 *     summary: Approve or reject a course submission
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [action]
 *             properties:
 *               action: { type: string, enum: [approve, reject], example: approve }
 *               reason: { type: string, description: Required when rejecting }
 *     responses:
 *       200:
 *         description: Course approved and published, or rejected
 */
router.put('/courses/:id/review', reviewCourse);

module.exports = router;
