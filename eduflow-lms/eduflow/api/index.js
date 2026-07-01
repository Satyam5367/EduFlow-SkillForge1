const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

dotenv.config();

// Connect DB
const connectDB = require('../server/config/db');
connectDB();

const app = express();

// ─── Security ───────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(mongoSanitize());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later.',
});
app.use(limiter);

// ─── CORS ────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors());

// ─── Body Parser ─────────────────────────────────────────────
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ─── Routes ──────────────────────────────────────────────────
app.use('/api/auth',     require('../server/routes/auth.routes'));
app.use('/api/users',    require('../server/routes/user.routes'));
app.use('/api/courses',  require('../server/routes/course.routes'));
app.use('/api/sections', require('../server/routes/section.routes'));
app.use('/api/lectures', require('../server/routes/lecture.routes'));
app.use('/api/payments', require('../server/routes/payment.routes'));
app.use('/api/reviews',  require('../server/routes/review.routes'));
app.use('/api/admin',    require('../server/routes/admin.routes'));
app.use('/api/quiz',     require('../server/routes/quiz.routes'));

// ─── Health Check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'EduFlow API is running on Vercel',
    version: '1.0.0',
  });
});

// ─── Error Handler ───────────────────────────────────────────
app.use(require('../server/middleware/error.middleware'));

// ─── 404 ─────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

module.exports = app;
