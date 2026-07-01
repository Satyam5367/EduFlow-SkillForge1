const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getPaymentHistory, getInstructorRevenue } = require('../controllers/payment.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /payments/order:
 *   post:
 *     summary: Create a Razorpay payment order
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [courseId]
 *             properties:
 *               courseId:   { type: string, example: 64f1a2b3c4d5e6f7a8b9c0d2 }
 *               couponCode: { type: string, example: SAVE20 }
 *     responses:
 *       200:
 *         description: Razorpay order created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderId:    { type: string }
 *                 amount:     { type: number }
 *                 currency:   { type: string }
 *                 key:        { type: string }
 *                 courseName: { type: string }
 *       400:
 *         description: Already enrolled or invalid course
 */
router.post('/order', protect, createOrder);

/**
 * @swagger
 * /payments/verify:
 *   post:
 *     summary: Verify Razorpay payment signature and enroll student
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId]
 *             properties:
 *               razorpay_order_id:   { type: string }
 *               razorpay_payment_id: { type: string }
 *               razorpay_signature:  { type: string }
 *               courseId:            { type: string }
 *     responses:
 *       200:
 *         description: Payment verified and student enrolled
 *       400:
 *         description: Invalid payment signature
 */
router.post('/verify', protect, verifyPayment);

/**
 * @swagger
 * /payments/history:
 *   get:
 *     summary: Get payment history for current user
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of completed payments
 */
router.get('/history', protect, getPaymentHistory);

/**
 * @swagger
 * /payments/instructor-revenue:
 *   get:
 *     summary: Get revenue analytics for instructor
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue data with monthly breakdown
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalRevenue:   { type: number }
 *                 totalStudents:  { type: number }
 *                 monthlyRevenue: { type: array }
 *                 courses:        { type: array }
 */
router.get('/instructor-revenue', protect, authorize('instructor', 'admin'), getInstructorRevenue);

module.exports = router;
