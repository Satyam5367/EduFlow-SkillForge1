// MyCourses.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../../services/api.service';
import Loader from '../../components/common/Loader';
import { FiPlay } from 'react-icons/fi';

export default function MyCourses() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI.getEnrolledCourses()
      .then(({ data }) => setEnrollments(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container">
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>My Learning</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{enrollments.length} courses enrolled</p>

        {enrollments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📚</div>
            <h3 style={{ marginBottom: '0.5rem' }}>No courses yet</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Start learning by enrolling in your first course</p>
            <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
          </div>
        ) : (
          <div className="grid-3">
            {enrollments.map(({ course, progress, enrolledAt }) => (
              course && (
                <div key={course._id} className="card">
                  <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                    <img src={course.thumbnail?.url} alt={course.title}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '1rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', lineHeight: 1.4 }}>{course.title}</h3>
                    <div style={{ marginBottom: '0.875rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                        <span>Progress</span>
                        <span style={{ fontWeight: 600, color: 'var(--secondary)' }}>{progress || 0}%</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${progress || 0}%`, height: '100%', background: 'var(--secondary)', borderRadius: 3, transition: 'width 0.5s' }} />
                      </div>
                    </div>
                    <Link to={`/learn/${course._id}`} className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center', display: 'flex', gap: '0.375rem' }}>
                      <FiPlay size={14} /> {(progress || 0) > 0 ? 'Continue' : 'Start'} Learning
                    </Link>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
