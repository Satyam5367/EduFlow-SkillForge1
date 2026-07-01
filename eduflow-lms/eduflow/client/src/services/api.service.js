import axios from 'axios';

// On Vercel: frontend and backend are on same domain, so use /api
// Locally: use localhost:5000/api
const BASE_URL = process.env.REACT_APP_API_URL || '/api';

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// ─── Request interceptor (attach token) ─────────────────────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('eduflow_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor (handle 401) ──────────────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('eduflow_token');
      localStorage.removeItem('eduflow_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

// ════════════════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════════════════
export const authAPI = {
  register:       (data) => API.post('/auth/register', data),
  login:          (data) => API.post('/auth/login', data),
  logout:         ()     => API.post('/auth/logout'),
  getMe:          ()     => API.get('/auth/me'),
  forgotPassword: (data) => API.post('/auth/forgot-password', data),
  resetPassword:  (token, data) => API.put(`/auth/reset-password/${token}`, data),
  verifyEmail:    (token) => API.get(`/auth/verify-email/${token}`),
};

// ════════════════════════════════════════════════════════════
// COURSES
// ════════════════════════════════════════════════════════════
export const courseAPI = {
  getAll:        (params)   => API.get('/courses', { params }),
  getOne:        (id)       => API.get(`/courses/${id}`),
  getFeatured:   ()         => API.get('/courses/featured'),
  getCategories: ()         => API.get('/courses/categories'),
  getMyCourses:  ()         => API.get('/courses/my-courses'),
  create:        (data)     => API.post('/courses', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:        (id, data) => API.put(`/courses/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete:        (id)       => API.delete(`/courses/${id}`),
  enroll:        (id)       => API.post(`/courses/${id}/enroll`),
  submit:        (id)       => API.put(`/courses/${id}/submit`),
  // Sections
  addSection:    (courseId, data)               => API.post(`/courses/${courseId}/sections`, data),
  updateSection: (courseId, sectionId, data)    => API.put(`/courses/${courseId}/sections/${sectionId}`, data),
  deleteSection: (courseId, sectionId)          => API.delete(`/courses/${courseId}/sections/${sectionId}`),
  // Lectures
  addLecture:    (courseId, sectionId, data)    =>
    API.post(`/courses/${courseId}/sections/${sectionId}/lectures`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateProgress: (courseId, sectionId, lectureId, data) =>
    API.put(`/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}/progress`, data),
  deleteLecture:  (courseId, sectionId, lectureId) =>
    API.delete(`/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`),
  // Reviews
  getReviews:   (courseId, params) => API.get(`/courses/${courseId}/reviews`, { params }),
  addReview:    (courseId, data)   => API.post(`/courses/${courseId}/reviews`, data),
  updateReview: (id, data)         => API.put(`/reviews/${id}`, data),
  deleteReview: (id)               => API.delete(`/reviews/${id}`),
};

// ════════════════════════════════════════════════════════════
// USERS
// ════════════════════════════════════════════════════════════
export const userAPI = {
  getProfile:         ()         => API.get('/users/profile'),
  updateProfile:      (data)     => API.put('/users/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  changePassword:     (data)     => API.put('/users/change-password', data),
  getEnrolledCourses: ()         => API.get('/users/enrolled-courses'),
  toggleWishlist:     (courseId) => API.post(`/users/wishlist/${courseId}`),
  applyInstructor:    (data)     => API.post('/users/apply-instructor', data),
};

// ════════════════════════════════════════════════════════════
// PAYMENTS
// ════════════════════════════════════════════════════════════
export const paymentAPI = {
  createOrder:          (data) => API.post('/payments/order', data),
  verifyPayment:        (data) => API.post('/payments/verify', data),
  getHistory:           ()     => API.get('/payments/history'),
  getInstructorRevenue: ()     => API.get('/payments/instructor-revenue'),
};

// ════════════════════════════════════════════════════════════
// ADMIN
// ════════════════════════════════════════════════════════════
export const adminAPI = {
  getAnalytics:  ()         => API.get('/admin/analytics'),
  getUsers:      (params)   => API.get('/admin/users', { params }),
  updateUser:    (id, data) => API.put(`/admin/users/${id}`, data),
  deleteUser:    (id)       => API.delete(`/admin/users/${id}`),
  getCourses:    (params)   => API.get('/admin/courses', { params }),
  reviewCourse:  (id, data) => API.put(`/admin/courses/${id}/review`, data),
};

// ════════════════════════════════════════════════════════════
// QUIZ (AI)
// ════════════════════════════════════════════════════════════
export const quizAPI = {
  generate: (data) => API.post('/quiz/generate', data),
};

export default API;
