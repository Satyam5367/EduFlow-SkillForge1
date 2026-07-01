# 🎓 EduFlow — Full-Stack Learning Management System

> A production-grade LMS platform built with the MERN stack. Students learn, instructors teach, admins manage — all in one powerful platform.


![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

## 📸 Screenshots

> **Live Demo:** [eduflow-demo.vercel.app](https://edu-flow-skillforge1-8w0e20pg8-satyam5367s-projects.vercel.app/)  
> **API Docs:** [eduflow-api.onrender.com/api-docs](https://eduflow-api.onrender.com/api-docs)

| Page | Preview |
|---|---|
| 🏠 **Landing Page** — Hero, categories, featured courses | ![Home](home_page.png) |
| 📚 **Course Catalog** — Filters, search, pagination | ![Courses](courses_all.png) |
| 🎬 **Course Detail** — Curriculum, reviews, Razorpay checkout | ![Detail](docs/screenshots/course_detail.png) |
| 🎥 **Learn Page** — Video player + AI quiz sidebar | ![Learn](docs/screenshots/learn.png) |
| 👨‍🏫 **Instructor Dashboard** — Course management, analytics & revenue tracking | ![Instructor](docs/screenshots/instructor_dashboard.png)<br><br>![Revenue](docs/screenshots/revenue_dashboard.png) |
| 💳 **Secure Checkout** — Razorpay payment gateway, coupon support & payment confirmation | ![Checkout](docs/screenshots/razorpay_checkout.png)<br><br>![Success](docs/screenshots/payment_success.png) |
| 🛡️ **Admin Panel** — Analytics, user & course moderation | ![Admin](docs/screenshots/admin.png) |
| 📖 **Swagger API Docs** — Full interactive documentation | ![Swagger](docs/screenshots/swagger.png) |

> 💡 **To add real screenshots:** Run the project locally, take screenshots, and save them to `docs/screenshots/`.

---

## ✨ Features

### 👨‍🎓 Student
- Browse & search courses by category, level, price
- Enroll in free or paid courses (Razorpay integration)
- Video lecture player with resume support
- **AI-powered quiz generation** per lecture (Claude API)
- Progress tracking across all enrolled courses
- Certificate issued on 100% completion
- Course reviews and ratings
- Wishlist management
- Student dashboard with progress analytics

### 👨‍🏫 Instructor
- Create and publish courses with sections & lectures
- Upload video content (Cloudinary — any format)
- Set pricing, discount prices, coupons, and expiry
- Revenue dashboard with monthly charts (Recharts)
- Student enrollment analytics per course
- Curriculum builder — drag-free section/lecture management
- Submit courses for admin review

### 🛡️ Admin
- Approve / reject instructor course submissions
- Manage all users — change roles, activate/deactivate, delete
- Platform-wide revenue and enrollment analytics
- Pie chart breakdown by category
- Recent payments and new users feed
- Force publish or unpublish any course

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js 18 + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JWT + bcryptjs | Auth & password hashing |
| Cloudinary | Video, image & avatar storage |
| Nodemailer | Transactional emails |
| Razorpay | Payment processing |
| Multer + CloudinaryStorage | File upload handling |
| Helmet + Mongo-Sanitize | Security hardening |
| Express Rate Limit | DDoS protection |
| Swagger UI + JSDoc | Interactive API docs |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| React Router v6 | Client-side routing |
| Context API | Global auth & cart state |
| Axios | HTTP client with interceptors |
| Recharts | Revenue & analytics charts |
| React Player | Video playback |
| React Toastify | Toast notifications |
| React Icons | Icon library |
| Framer Motion | Page animations |

### DevOps
| Technology | Purpose |
|---|---|
| Docker + Docker Compose | Containerised dev & prod |
| nginx | Static file server + SPA routing |
| GitHub Actions | CI/CD pipeline |
| Render | Backend deployment |
| Vercel | Frontend deployment |

---

## 🚀 Getting Started

### Option 1 — Docker (Recommended, zero setup)
```bash
git clone https://github.com/satyamkumar/eduflow.git
cd eduflow

# Copy env file and fill your keys
cp server/.env.example server/.env

# Start everything (MongoDB + Server + Client)
docker compose up --build

# In a new terminal — seed demo data
docker compose exec server node utils/seeder.js
```
Access: **http://localhost:3000** | API Docs: **http://localhost:5000/api-docs**

---

### Option 2 — Manual Setup

#### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier)
- Cloudinary account (free tier)
- Razorpay test account

#### 1. Clone & install all dependencies
```bash
git clone https://github.com/satyamkumar/eduflow.git
cd eduflow
npm run install-all
```

#### 2. Configure environment variables
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
# Edit both files with your actual keys
```

#### 3. Seed the database
```bash
npm run seed
```

#### 4. Start development servers
```bash
npm run dev
# Runs both frontend (port 3000) and backend (port 5000) concurrently
```

---

## 🔑 Environment Variables

### `server/.env`
```env
NODE_ENV=development
PORT=5000

# MongoDB
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/eduflow

# JWT
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_char_app_password
EMAIL_FROM=EduFlow <noreply@eduflow.com>

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Anthropic (Claude AI — for quiz generation)
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxx

# Frontend URL
CLIENT_URL=http://localhost:3000
```

### `client/.env`
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
```

---

## 🧪 Demo Accounts

After running `npm run seed`:

| Role | Email | Password |
|---|---|---|
| 🛡️ Admin | admin@eduflow.com | Admin@123 |
| 👨‍🏫 Instructor | instructor@eduflow.com | Instructor@123 |
| 👨‍🎓 Student | student@eduflow.com | Student@123 |

---

## 📡 API Reference

Full interactive documentation available at **`/api-docs`** (Swagger UI).

### Quick Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | — | Register student or instructor |
| POST | /api/auth/login | — | Login, receive JWT |
| GET | /api/auth/me | ✅ | Get current user |
| GET | /api/courses | — | Browse courses (filterable) |
| GET | /api/courses/:id | — | Course detail + curriculum |
| POST | /api/courses | Instructor | Create course |
| POST | /api/courses/:id/enroll | Student | Enroll (free courses) |
| POST | /api/payments/order | ✅ | Create Razorpay order |
| POST | /api/payments/verify | ✅ | Verify & enroll |
| POST | /api/quiz/generate | Student | AI quiz for lecture |
| GET | /api/admin/analytics | Admin | Platform analytics |
| PUT | /api/admin/courses/:id/review | Admin | Approve/reject course |

---

## 📁 Project Structure

```
eduflow/
├── .github/
│   └── workflows/
│       └── ci.yml               # GitHub Actions CI/CD
├── client/                      # React 18 Frontend
│   ├── Dockerfile               # Multi-stage Docker build
│   ├── nginx.conf               # nginx SPA routing config
│   └── src/
│       ├── components/
│       │   ├── common/          # Navbar, Footer, Loader
│       │   └── student/         # CourseCard
│       ├── context/             # AuthContext, CartContext
│       ├── pages/
│       │   ├── auth/            # Login, Register, ForgotPassword, ResetPassword
│       │   ├── student/         # Home, Courses, CourseDetail, Learn, Profile, MyCourses, Wishlist
│       │   ├── instructor/      # Dashboard, CreateCourse, EditCourse, Revenue
│       │   └── admin/           # Dashboard, ManageUsers, ManageCourses
│       └── services/
│           └── api.service.js   # Axios instance + all API calls
├── server/                      # Node.js + Express Backend
│   ├── Dockerfile               # Secure non-root Docker image
│   ├── config/
│   │   ├── db.js                # MongoDB connection
│   │   ├── cloudinary.js        # Image/video upload configs
│   │   └── swagger.js           # OpenAPI 3.0 spec
│   ├── controllers/             # Business logic
│   ├── middleware/              # Auth + error handlers
│   ├── models/                  # Mongoose schemas
│   ├── routes/                  # Express routers (with JSDoc)
│   └── utils/                   # Email, token helpers, seeder
├── docker-compose.yml           # Full stack Docker setup
├── package.json                 # Root scripts (dev, seed, build)
└── README.md
```

---

## 🚢 Deployment

### Backend → Render
1. Create **Web Service** at [render.com](https://render.com)
2. Connect your GitHub repo
3. **Build Command:** `cd server && npm install`
4. **Start Command:** `cd server && npm start`
5. Add all environment variables from `server/.env`

### Frontend → Vercel
1. Import project at [vercel.com](https://vercel.com)
2. **Root Directory:** `client`
3. Add `REACT_APP_API_URL` pointing to your Render URL
4. Deploy!

### Full Stack → Docker
```bash
# Production build
docker compose up --build -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

---

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit with conventional commits (`git commit -m 'feat: add quiz retry feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

## 👨‍💻 Author

**Satyam Kumar** — B.Tech CSE

[![GitHub](https://img.shields.io/badge/GitHub-satyamkumar-181717?style=flat-square&logo=github)](https://github.com/Satyam5367)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-satyamkumar-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/satyam-kumar-894344280)

---

<p align="center">Built with ❤️ using the MERN Stack | EduFlow &copy; 2026 Satyam Kumar</p>
