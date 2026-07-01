const express = require('express');
const router = express.Router();
const { updateReview, deleteReview, markHelpful } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /reviews/{id}:
 *   put:
 *     summary: Update your review
 *     tags: [Reviews]
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
 *               rating:  { type: integer, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 *     responses:
 *       200:
 *         description: Review updated
 *   delete:
 *     summary: Delete your review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Review deleted
 */
router.put('/:id',    protect, updateReview);
router.delete('/:id', protect, deleteReview);

/**
 * @swagger
 * /reviews/{id}/helpful:
 *   post:
 *     summary: Toggle helpful vote on a review
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Helpful vote toggled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:      { type: boolean }
 *                 helpfulCount: { type: integer }
 */
router.post('/:id/helpful', protect, markHelpful);

module.exports = router;
