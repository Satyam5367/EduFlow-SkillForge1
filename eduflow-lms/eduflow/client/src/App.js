import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Loader from './components/common/Loader';

// Lazy load pages
const Home           = lazy(() => import('./pages/student/Home'));
const Courses        = lazy(() => import('./pages/student/Courses'));
const CourseDetail   = lazy(() => import('./pages/student/CourseDetail'));
const Learn          = lazy(() => import('./pages/student/Learn'));
const Profile        = lazy(() => import('./pages/student/Profile'));
const Wishlist       = lazy(() => import('./pages/student/Wishlist'));
const MyCourses      = lazy(() => import('./pages/student/MyCourses'));
const Login          = lazy(() => import('./pages/auth/Login'));
const Register       = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword  = lazy(() => import('./pages/auth/ResetPassword'));
const VerifyEmail    = lazy(() => import('./pages/auth/VerifyEmail'));
// Instructor
const InstructorDashboard = lazy(() => import('./pages/instructor/Dashboard'));
const CreateCourse        = lazy(() => import('./pages/instructor/CreateCourse'));
const EditCourse          = lazy(() => import('./pages/instructor/EditCourse'));
const InstructorRevenue   = lazy(() => import('./pages/instructor/Revenue'));
// Admin
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const ManageUsers    = lazy(() => import('./pages/admin/ManageUsers'));
const ManageCourses  = lazy(() => import('./pages/admin/ManageCourses'));

// ─── Protected Route ────────────────────────────────────────
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <Loader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />;
  return children;
};

// ─── Auth Route (redirect if logged in) ─────────────────────
const AuthRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loader />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
};

// ─── Layout Wrapper ──────────────────────────────────────────
const Layout = ({ children, noFooter }) => (
  <>
    <Navbar />
    <main style={{ minHeight: 'calc(100vh - 70px)', paddingTop: '70px' }}>
      {children}
    </main>
    {!noFooter && <Footer />}
  </>
);

export default function App() {
  return (
    <Router>
      <Suspense fallback={<Loader fullscreen />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/courses" element={<Layout><Courses /></Layout>} />
          <Route path="/courses/:id" element={<Layout><CourseDetail /></Layout>} />

          {/* Auth */}
          <Route path="/login"          element={<AuthRoute><Login /></AuthRoute>} />
          <Route path="/register"       element={<AuthRoute><Register /></AuthRoute>} />
          <Route path="/forgot-password" element={<AuthRoute><ForgotPassword /></AuthRoute>} />
          <Route path="/reset-password/:token" element={<AuthRoute><ResetPassword /></AuthRoute>} />
          <Route path="/verify-email/:token"   element={<VerifyEmail />} />

          {/* Student */}
          <Route path="/learn/:courseId" element={
            <ProtectedRoute roles={['student', 'instructor', 'admin']}>
              <Learn />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>
          } />
          <Route path="/my-courses" element={
            <ProtectedRoute roles={['student']}><Layout><MyCourses /></Layout></ProtectedRoute>
          } />
          <Route path="/wishlist" element={
            <ProtectedRoute roles={['student']}><Layout><Wishlist /></Layout></ProtectedRoute>
          } />

          {/* Instructor */}
          <Route path="/instructor/dashboard" element={
            <ProtectedRoute roles={['instructor', 'admin']}>
              <Layout><InstructorDashboard /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/instructor/courses/create" element={
            <ProtectedRoute roles={['instructor', 'admin']}>
              <Layout><CreateCourse /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/instructor/courses/:id/edit" element={
            <ProtectedRoute roles={['instructor', 'admin']}>
              <Layout><EditCourse /></Layout>
            </ProtectedRoute>
          } />
          <Route path="/instructor/revenue" element={
            <ProtectedRoute roles={['instructor', 'admin']}>
              <Layout><InstructorRevenue /></Layout>
            </ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}><Layout><AdminDashboard /></Layout></ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute roles={['admin']}><Layout><ManageUsers /></Layout></ProtectedRoute>
          } />
          <Route path="/admin/courses" element={
            <ProtectedRoute roles={['admin']}><Layout><ManageCourses /></Layout></ProtectedRoute>
          } />

          {/* 404 */}
          <Route path="*" element={
            <Layout>
              <div style={{ textAlign: 'center', padding: '8rem 2rem' }}>
                <h1 style={{ fontSize: '6rem', color: 'var(--primary)', fontWeight: 800 }}>404</h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>Page not found</p>
                <a href="/" className="btn btn-primary btn-lg">Go Home</a>
              </div>
            </Layout>
          } />
        </Routes>
      </Suspense>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="dark"
      />
    </Router>
  );
}
