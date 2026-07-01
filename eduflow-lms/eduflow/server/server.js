const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Load env vars
dotenv.config();

// Connect to DB
const connectDB = require('./config/db');
connectDB();

const app = express();

// Security Middleware
app.use(helmet({ contentSecurityPolicy: false })); // disabled for swagger UI
app.use(mongoSanitize());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts, please try again after an hour',
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// General Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Swagger API Docs (available in all environments)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { background-color: #6C63FF; }',
  customSiteTitle: 'EduFlow API Docs',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
  },
}));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Routes
app.use('/api/auth',     require('./routes/auth.routes'));
app.use('/api/users',    require('./routes/user.routes'));
app.use('/api/courses',  require('./routes/course.routes'));
app.use('/api/sections', require('./routes/section.routes'));
app.use('/api/lectures', require('./routes/lecture.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/reviews',  require('./routes/review.routes'));
app.use('/api/admin',    require('./routes/admin.routes'));
app.use('/api/quiz',     require('./routes/quiz.routes'));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'EduFlow API is running',
    docs: '/api-docs',
    version: '1.0.0',
    uptime: process.uptime().toFixed(2) + 's',
  });
});

// Error Handling
const errorHandler = require('./middleware/error.middleware');
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n  EduFlow Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`  API:  http://localhost:${PORT}/api`);
  console.log(`  Docs: http://localhost:${PORT}/api-docs\n`);
});

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
