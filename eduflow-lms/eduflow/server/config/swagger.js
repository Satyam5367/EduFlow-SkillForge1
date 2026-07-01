const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '🎓 EduFlow LMS API',
      version: '1.0.0',
      description: `
## EduFlow — Full Stack Learning Management System API

A production-grade REST API built with **Node.js + Express + MongoDB**.

### Features
- 🔐 JWT Authentication with role-based access control
- 👥 Three roles: Student, Instructor, Admin
- 📚 Complete course management (CRUD, sections, lectures)
- 💳 Razorpay payment integration
- 🤖 AI-powered quiz generation (Claude API)
- 📊 Revenue and enrollment analytics
- ☁️ Cloudinary media storage

### Authentication
Include the JWT token in the **Authorization** header:
\`\`\`
Authorization: Bearer <your_token>
\`\`\`

### Rate Limiting
- General API: 100 requests / 15 minutes
- Auth endpoints: 10 requests / hour
      `,
      contact: {
        name:  'Satyam Kumar',
        email: 'satyam@example.com',
        url:   'https://github.com/satyamkumar',
      },
      license: { name: 'MIT', url: 'https://opensource.org/licenses/MIT' },
    },
    servers: [
      { url: 'http://localhost:5000/api', description: 'Development server' },
      { url: 'https://eduflow-api.onrender.com/api', description: 'Production server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        // ── User ───────────────────────────────────────────
        User: {
          type: 'object',
          properties: {
            _id:       { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
            name:      { type: 'string', example: 'Satyam Kumar' },
            email:     { type: 'string', format: 'email', example: 'satyam@example.com' },
            role:      { type: 'string', enum: ['student', 'instructor', 'admin'], example: 'student' },
            avatar:    { type: 'object', properties: { url: { type: 'string' }, public_id: { type: 'string' } } },
            bio:       { type: 'string', example: 'Passionate developer and learner' },
            headline:  { type: 'string', example: 'Full Stack Developer' },
            isVerified:{ type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        // ── Course ─────────────────────────────────────────
        Course: {
          type: 'object',
          properties: {
            _id:             { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d2' },
            title:           { type: 'string', example: 'Complete MERN Stack Development' },
            slug:            { type: 'string', example: 'complete-mern-stack-development-1690000000000' },
            subtitle:        { type: 'string' },
            description:     { type: 'string' },
            instructor:      { $ref: '#/components/schemas/User' },
            category:        { type: 'string', example: 'Web Development' },
            level:           { type: 'string', enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'] },
            price:           { type: 'number', example: 999 },
            isFree:          { type: 'boolean', example: false },
            thumbnail:       { type: 'object', properties: { url: { type: 'string' } } },
            avgRating:       { type: 'number', example: 4.8 },
            totalStudents:   { type: 'number', example: 1820 },
            totalLectures:   { type: 'number', example: 48 },
            totalDuration:   { type: 'number', example: 72000 },
            status:          { type: 'string', enum: ['draft', 'pending', 'published', 'archived'] },
            isApproved:      { type: 'boolean' },
            createdAt:       { type: 'string', format: 'date-time' },
          },
        },
        // ── Auth responses ──────────────────────────────────
        AuthResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Login successful' },
            token:   { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            data:    { $ref: '#/components/schemas/User' },
          },
        },
        // ── Error ──────────────────────────────────────────
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'An error occurred' },
          },
        },
        // ── Review ─────────────────────────────────────────
        Review: {
          type: 'object',
          properties: {
            _id:     { type: 'string' },
            user:    { $ref: '#/components/schemas/User' },
            course:  { type: 'string' },
            rating:  { type: 'number', minimum: 1, maximum: 5, example: 5 },
            comment: { type: 'string', example: 'Excellent course! Very detailed.' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        // ── Payment ────────────────────────────────────────
        Payment: {
          type: 'object',
          properties: {
            _id:      { type: 'string' },
            user:     { $ref: '#/components/schemas/User' },
            course:   { $ref: '#/components/schemas/Course' },
            amount:   { type: 'number', example: 999 },
            currency: { type: 'string', example: 'INR' },
            status:   { type: 'string', enum: ['created', 'completed', 'failed', 'refunded'] },
            createdAt:{ type: 'string', format: 'date-time' },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: 'Authentication required',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
        Forbidden: {
          description: 'Insufficient permissions',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
        NotFound: {
          description: 'Resource not found',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
      },
    },
    tags: [
      { name: 'Auth',     description: 'Authentication — register, login, password management' },
      { name: 'Courses',  description: 'Course management — browse, create, enroll' },
      { name: 'Sections', description: 'Section management within courses' },
      { name: 'Lectures', description: 'Lecture management and progress tracking' },
      { name: 'Reviews',  description: 'Course reviews and ratings' },
      { name: 'Payments', description: 'Razorpay payment integration' },
      { name: 'Users',    description: 'User profile management' },
      { name: 'Quiz',     description: 'AI-powered quiz generation' },
      { name: 'Admin',    description: 'Admin-only operations' },
    ],
  },
  apis: ['./routes/*.js', './controllers/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
