const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User.model');
const Course = require('../models/Course.model');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB Connected');
};

const seedData = async () => {
  await connectDB();

  // Clear existing
  await User.deleteMany();
  await Course.deleteMany();
  console.log('🗑️  Cleared existing data');

  // Create admin
  const admin = await User.create({
    name:       'Admin User',
    email:      'admin@eduflow.com',
    password:   'Admin@123',
    role:       'admin',
    isVerified: true,
    isActive:   true,
  });

  // Create instructor
  const instructor = await User.create({
    name:                 'John Instructor',
    email:                'instructor@eduflow.com',
    password:             'Instructor@123',
    role:                 'instructor',
    isVerified:           true,
    isActive:             true,
    isInstructorApproved: true,
    headline:             'Senior Full Stack Developer | 8+ years experience',
    bio:                  'Passionate educator and developer with expertise in MERN stack, System Design, and Cloud.',
  });

  // Create student
  const student = await User.create({
    name:       'Jane Student',
    email:      'student@eduflow.com',
    password:   'Student@123',
    role:       'student',
    isVerified: true,
    isActive:   true,
  });

  console.log('👥 Users created');

  // Create sample courses
  const courses = await Course.insertMany([
    {
      title:       'Complete MERN Stack Development Bootcamp',
      subtitle:    'Build full-stack web apps with MongoDB, Express, React & Node',
      description: 'Learn to build production-ready full-stack applications using the MERN stack. This comprehensive course covers everything from React basics to Node.js APIs to MongoDB database design. You will build 5 real projects and deploy them to production.',
      instructor:  instructor._id,
      category:    'Web Development',
      level:       'Beginner',
      price:       999,
      isFree:      false,
      status:      'published',
      isApproved:  true,
      featured:    true,
      requirements:     ['Basic JavaScript knowledge', 'HTML & CSS basics', 'A computer with internet'],
      learningOutcomes: ['Build complete MERN stack apps', 'Design REST APIs', 'Manage state with Context API', 'Deploy to Vercel & Render'],
      tags:             ['mern', 'react', 'nodejs', 'mongodb', 'express'],
      avgRating:    4.8,
      totalRatings: 234,
      totalStudents: 1820,
      sections: [
        {
          title: 'Getting Started',
          order: 1,
          lectures: [
            { title: 'Course Introduction', description: 'What you will learn in this course', isPreview: true, order: 1, video: { url: '', duration: 300 } },
            { title: 'Setting Up Your Environment', description: 'Install Node.js, VS Code, and MongoDB', isPreview: true, order: 2, video: { url: '', duration: 600 } },
          ],
        },
        {
          title: 'React Fundamentals',
          order: 2,
          lectures: [
            { title: 'React Components & JSX', description: 'Understanding components and JSX syntax', isPreview: false, order: 1, video: { url: '', duration: 900 } },
            { title: 'State & Props', description: 'Managing component state and passing props', isPreview: false, order: 2, video: { url: '', duration: 1200 } },
            { title: 'React Hooks Deep Dive', description: 'useState, useEffect, useContext and custom hooks', isPreview: false, order: 3, video: { url: '', duration: 1500 } },
          ],
        },
      ],
    },
    {
      title:       'Python for Data Science & Machine Learning',
      subtitle:    'Master Python, Pandas, NumPy, Scikit-learn & TensorFlow',
      description: 'A complete guide to data science and machine learning using Python. Learn data wrangling, visualization, and build predictive models from scratch. Includes hands-on projects with real datasets from Kaggle.',
      instructor:  instructor._id,
      category:    'Data Science',
      level:       'Intermediate',
      price:       1299,
      isFree:      false,
      status:      'published',
      isApproved:  true,
      featured:    true,
      requirements:     ['Python basics', 'Basic math/statistics'],
      learningOutcomes: ['Data analysis with Pandas', 'ML algorithms', 'Build & deploy ML models', 'Neural networks with TensorFlow'],
      tags:             ['python', 'data science', 'machine learning', 'tensorflow', 'pandas'],
      avgRating:    4.9,
      totalRatings: 412,
      totalStudents: 3200,
    },
    {
      title:       'DevOps & Cloud — AWS, Docker & Kubernetes',
      subtitle:    'CI/CD pipelines, containerization, and cloud deployment',
      description: 'Master modern DevOps practices. Learn Docker containerization, Kubernetes orchestration, AWS services, and set up complete CI/CD pipelines using GitHub Actions. Deploy microservices like a pro.',
      instructor:  instructor._id,
      category:    'DevOps',
      level:       'Advanced',
      price:       1499,
      isFree:      false,
      status:      'published',
      isApproved:  true,
      featured:    false,
      tags:             ['devops', 'docker', 'kubernetes', 'aws', 'cicd'],
      avgRating:    4.7,
      totalRatings: 189,
      totalStudents: 980,
    },
    {
      title:       'Git & GitHub — The Complete Guide',
      subtitle:    'Version control, branching, collaboration and open source',
      description: 'Learn Git version control from scratch. Master branching strategies, merge conflicts, pull requests, and contribute to open source projects. Essential knowledge for every developer.',
      instructor:  instructor._id,
      category:    'Programming Languages',
      level:       'Beginner',
      price:       0,
      isFree:      true,
      status:      'published',
      isApproved:  true,
      featured:    true,
      tags:             ['git', 'github', 'version control', 'open source'],
      avgRating:    4.6,
      totalRatings: 892,
      totalStudents: 12400,
    },
  ]);

  // Enroll student in a course
  student.enrolledCourses.push({ course: courses[3]._id });
  await student.save();

  console.log('📚 Courses created');
  console.log('\n✅ Seed complete! Test accounts:');
  console.log('   Admin:      admin@eduflow.com / Admin@123');
  console.log('   Instructor: instructor@eduflow.com / Instructor@123');
  console.log('   Student:    student@eduflow.com / Student@123\n');
  process.exit(0);
};

seedData().catch(err => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
