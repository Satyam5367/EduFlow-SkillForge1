const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/auth.middleware');
const User = require('../models/User.model');

/**
 * @swagger
 * /quiz/generate:
 *   post:
 *     summary: Generate an AI quiz for a lecture using Claude API
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [courseId, lectureTitle]
 *             properties:
 *               courseId:           { type: string }
 *               lectureTitle:       { type: string, example: "React Hooks Deep Dive" }
 *               lectureDescription: { type: string }
 *               numQuestions:       { type: integer, default: 5, minimum: 3, maximum: 10 }
 *     responses:
 *       200:
 *         description: AI-generated quiz with questions, options and explanations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     questions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:          { type: integer }
 *                           question:    { type: string }
 *                           options:     { type: array, items: { type: string } }
 *                           correct:     { type: integer, description: Index of correct option }
 *                           explanation: { type: string }
 *       403:
 *         description: Must be enrolled in the course
 */
router.post('/generate', protect, asyncHandler(async (req, res) => {
  const { courseId, lectureTitle, lectureDescription, numQuestions = 5 } = req.body;

  const user = await User.findById(req.user._id);
  const enrolled = user.enrolledCourses.some(e => e.course.toString() === courseId);
  if (!enrolled) { res.status(403); throw new Error('Must be enrolled to access quizzes'); }

  const prompt = `Generate a ${numQuestions}-question multiple choice quiz for a lecture titled "${lectureTitle}".
${lectureDescription ? `Lecture description: ${lectureDescription}` : ''}
Return ONLY valid JSON in this exact format, no other text:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct": 0,
      "explanation": "Why this answer is correct"
    }
  ]
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model:      'claude-sonnet-4-6',
      max_tokens: 2000,
      messages:   [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();
  const text = data.content[0].text;

  let quiz;
  try {
    const clean = text.replace(/```json|```/g, '').trim();
    quiz = JSON.parse(clean);
  } catch {
    res.status(500); throw new Error('Failed to parse AI quiz response');
  }

  res.status(200).json({ success: true, data: quiz });
}));

module.exports = router;
