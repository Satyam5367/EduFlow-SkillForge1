import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseAPI, paymentAPI } from '../../services/api.service';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  FiPlusCircle, FiEdit2, FiTrash2, FiUsers, FiDollarSign,
  FiBook, FiStar, FiEye, FiSend, FiBarChart2,
} from 'react-icons/fi';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function InstructorDashboard() {
  const [courses, setCourses]   = useState([]);
  const [revenue, setRevenue]   = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([courseAPI.getMyCourses(), paymentAPI.getInstructorRevenue()])
      .then(([cRes, rRes]) => {
        setCourses(cRes.data.data);
        setRevenue(rRes.data.data);
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (courseId) => {
    if (!window.confirm('Delete this course? This cannot be undone.')) return;
    try {
      await courseAPI.delete(courseId);
      setCourses(prev => prev.filter(c => c._id !== courseId));
      toast.success('Course deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleSubmit = async (courseId) => {
    try {
      await courseAPI.submit(courseId);
      setCourses(prev => prev.map(c => c._id === courseId ? { ...c, status: 'pending' } : c));
      toast.success('Submitted for review!');
    } catch (err) {
      toast.error(err.message || 'Submit failed');
    }
  };

  if (loading) return <Loader />;

  const chartData = revenue?.monthlyRevenue?.map(m => ({
    month: MONTH_NAMES[m._id.month - 1],
    revenue: m.revenue,
    enrollments: m.count,
  })) || [];

  const stats = [
    { label: 'Total Revenue',  value: `₹${revenue?.totalRevenue?.toLocaleString() || 0}`, icon: <FiDollarSign />, color: '#10B981' },
    { label: 'Total Students', value: revenue?.totalStudents?.toLocaleString() || 0,        icon: <FiUsers />,      color: '#6C63FF' },
    { label: 'Courses',        value: courses.length,                                        icon: <FiBook />,       color: '#F59E0B' },
    { label: 'Avg Rating',     value: courses.length > 0 ? (courses.reduce((a,c) => a + (c.avgRating||0), 0)/courses.length).toFixed(1) : '—', icon: <FiStar />, color: '#EF4444' },
  ];

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>Instructor Dashboard</h1>
            <p style={{ color: 'var(--text-muted)' }}>Manage your courses and track performance</p>
          </div>
          <Link to="/instructor/courses/create" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <FiPlusCircle /> New Course
          </Link>
        </div>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 48, height: 48, background: `${s.color}20`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, fontSize: '1.25rem', flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{s.label}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Space Grotesk' }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue chart */}
        {chartData.length > 0 && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiBarChart2 /> Revenue (Last 6 Months)
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={v => `₹${v}`} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} formatter={v => [`₹${v}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2.5} dot={{ fill: 'var(--primary)', strokeWidth: 0, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Courses table */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h3>My Courses ({courses.length})</h3>
          </div>

          {courses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📝</div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No courses yet. Create your first one!</p>
              <Link to="/instructor/courses/create" className="btn btn-primary">Create Course</Link>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Course', 'Status', 'Students', 'Revenue', 'Rating', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '0.875rem 1.25rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {courses.map(course => (
                    <tr key={course._id} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img src={course.thumbnail?.url} alt="" style={{ width: 48, height: 32, objectFit: 'cover', borderRadius: 6 }} />
                          <div>
                            <div style={{ fontWeight: 600, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{course.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(course.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <span className={`badge ${course.status === 'published' ? 'badge-success' : course.status === 'pending' ? 'badge-warning' : 'badge-primary'}`}>
                          {course.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.875rem 1.25rem' }}>{course.totalStudents || 0}</td>
                      <td style={{ padding: '0.875rem 1.25rem' }}>₹{course.totalRevenue?.toLocaleString() || 0}</td>
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <FiStar size={12} color="var(--accent)" fill="var(--accent)" />
                          {course.avgRating?.toFixed(1) || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link to={`/courses/${course._id}`} title="View" style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-muted)' }}>
                            <FiEye size={14} />
                          </Link>
                          <Link to={`/instructor/courses/${course._id}/edit`} title="Edit" style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--primary)' }}>
                            <FiEdit2 size={14} />
                          </Link>
                          {course.status === 'draft' && (
                            <button onClick={() => handleSubmit(course._id)} title="Submit for review" style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(16,185,129,0.1)', border: '1px solid var(--secondary)', borderRadius: 6, color: 'var(--secondary)', cursor: 'pointer' }}>
                              <FiSend size={14} />
                            </button>
                          )}
                          <button onClick={() => handleDelete(course._id)} title="Delete" style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239,68,68,0.1)', border: '1px solid var(--danger)', borderRadius: 6, color: 'var(--danger)', cursor: 'pointer' }}>
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
