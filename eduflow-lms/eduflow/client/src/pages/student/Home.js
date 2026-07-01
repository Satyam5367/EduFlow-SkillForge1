import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { courseAPI } from '../../services/api.service';
import CourseCard from '../../components/student/CourseCard';
import Loader from '../../components/common/Loader';
import {
  FiSearch, FiArrowRight, FiAward, FiUsers, FiBook, FiStar,
  FiCode, FiDatabase, FiCloud, FiShield, FiCpu, FiLayout,
} from 'react-icons/fi';

const CATEGORIES = [
  { name: 'Web Development',    icon: <FiCode />,     color: '#6C63FF' },
  { name: 'Data Science',       icon: <FiDatabase />, color: '#10B981' },
  { name: 'DevOps',             icon: <FiCloud />,    color: '#F59E0B' },
  { name: 'Cybersecurity',      icon: <FiShield />,   color: '#EF4444' },
  { name: 'Machine Learning',   icon: <FiCpu />,      color: '#8B5CF6' },
  { name: 'UI/UX Design',       icon: <FiLayout />,   color: '#EC4899' },
];

const STATS = [
  { label: 'Students',    value: '50,000+', icon: <FiUsers /> },
  { label: 'Courses',     value: '1,200+',  icon: <FiBook /> },
  { label: 'Instructors', value: '300+',    icon: <FiAward /> },
  { label: 'Avg Rating',  value: '4.8★',   icon: <FiStar /> },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    courseAPI.getFeatured()
      .then(({ data }) => setFeatured(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/courses?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section style={{
        minHeight: '92vh', display: 'flex', alignItems: 'center',
        background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(108,99,255,0.25) 0%, transparent 70%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background blobs */}
        <div style={{ position: 'absolute', top: '10%', right: '5%', width: 400, height: 400, background: 'rgba(108,99,255,0.08)', borderRadius: '50%', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: 300, height: 300, background: 'rgba(16,185,129,0.06)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div className="container" style={{ textAlign: 'center', padding: '6rem 1.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: 999, padding: '0.4rem 1rem', fontSize: '0.85rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
            🎓 &nbsp;India's fastest-growing learning platform
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.25rem', maxWidth: 800, margin: '0 auto 1.25rem' }}>
            Build skills that{' '}
            <span className="gradient-text">define careers</span>
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Learn from expert instructors. Build real projects. Get job-ready with hands-on courses in development, data science, design, and more.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} style={{ maxWidth: 560, margin: '0 auto 2rem', display: 'flex', gap: '0.75rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search for a course or skill..."
                style={{
                  width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem',
                  background: 'var(--bg-elevated)', border: '1.5px solid var(--border)',
                  borderRadius: 12, color: 'var(--text)', fontSize: '0.95rem', outline: 'none',
                }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.875rem 1.5rem', borderRadius: 12, whiteSpace: 'nowrap' }}>
              Search
            </button>
          </form>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Popular: &nbsp;
            {['React', 'Python', 'Node.js', 'Machine Learning', 'Docker'].map(t => (
              <Link key={t} to={`/courses?search=${t}`} style={{ color: 'var(--primary)', marginRight: '0.75rem', textDecoration: 'underline' }}>{t}</Link>
            ))}
          </p>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <section style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '3rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
            {STATS.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>{s.icon}</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Space Grotesk' }}>{s.value}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
            <div>
              <h2 className="section-title">Browse by Category</h2>
              <p className="section-subtitle" style={{ marginBottom: 0 }}>Explore top domains in tech and design</p>
            </div>
            <Link to="/courses" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              All Categories <FiArrowRight />
            </Link>
          </div>
          <div className="grid-3">
            {CATEGORIES.map(cat => (
              <Link key={cat.name} to={`/courses?category=${encodeURIComponent(cat.name)}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '1.25rem 1.5rem', background: 'var(--bg-card)',
                  border: '1px solid var(--border)', borderRadius: 12,
                  transition: 'all 0.2s', textDecoration: 'none',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = cat.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${cat.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', color: cat.color, flexShrink: 0 }}>
                  {cat.icon}
                </div>
                <span style={{ fontWeight: 600 }}>{cat.name}</span>
                <FiArrowRight style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Courses ──────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
            <div>
              <h2 className="section-title">Featured Courses</h2>
              <p className="section-subtitle" style={{ marginBottom: 0 }}>Handpicked by our team for quality and impact</p>
            </div>
            <Link to="/courses?sort=-totalStudents" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              View All <FiArrowRight />
            </Link>
          </div>

          {loading ? <Loader /> : (
            <div className="grid-4">
              {featured.map(course => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, rgba(108,99,255,0.2) 0%, rgba(16,185,129,0.1) 100%)',
            border: '1px solid rgba(108,99,255,0.3)', borderRadius: 20,
            padding: '4rem', textAlign: 'center',
          }}>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: '1rem' }}>
              Ready to share your knowledge?
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem', maxWidth: 500, margin: '0 auto 2rem' }}>
              Join 300+ instructors already earning from their expertise. Create your first course today.
            </p>
            <Link to="/register" className="btn btn-primary btn-lg">
              Become an Instructor <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
