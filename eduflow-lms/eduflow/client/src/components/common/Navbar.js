import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiSearch, FiMenu, FiX, FiBell, FiBook,
  FiUser, FiSettings, FiLogOut, FiBarChart2,
  FiPlusCircle, FiHome, FiShield,
} from 'react-icons/fi';

export default function Navbar() {
  const { user, isAuthenticated, logout, isInstructor, isAdmin } = useAuth();
  const [open, setOpen]       = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [search, setSearch]   = useState('');
  const [scrolled, setScrolled] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const dropRef   = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setOpen(false); setDropdown(false); }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/courses?search=${encodeURIComponent(search.trim())}`);
  };

  const navStyle = {
    position:  'fixed',
    top: 0, left: 0, right: 0,
    zIndex: 1000,
    background: scrolled ? 'rgba(15,14,23,0.95)' : 'rgba(15,14,23,0.8)',
    backdropFilter: 'blur(20px)',
    borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
    transition: 'all 0.3s ease',
    height: '70px',
  };

  return (
    <nav style={navStyle}>
      <div className="container" style={{ height: '100%', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, background: 'var(--primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiBook color="white" size={20} />
          </div>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.25rem' }}>
            Edu<span className="gradient-text">Flow</span>
          </span>
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 400, display: 'flex', position: 'relative' }}>
          <FiSearch style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search courses..."
            style={{
              width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem',
              background: 'var(--bg-elevated)', border: '1.5px solid var(--border)',
              borderRadius: 999, color: 'var(--text)', fontSize: '0.875rem', outline: 'none',
            }}
          />
        </form>

        {/* Nav links */}
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }}>
          <Link to="/courses" className="btn btn-outline" style={{ padding: '0.4rem 0.875rem', fontSize: '0.875rem' }}>Courses</Link>

          {!isAuthenticated ? (
            <>
              <Link to="/login"    className="btn btn-outline btn-sm">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign up</Link>
            </>
          ) : (
            <div ref={dropRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdown(!dropdown)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: 'var(--bg-elevated)', border: '1.5px solid var(--border)',
                  borderRadius: 999, padding: '0.3rem 0.75rem 0.3rem 0.3rem',
                  cursor: 'pointer', color: 'var(--text)',
                }}
              >
                <img
                  src={user?.avatar?.url}
                  alt={user?.name}
                  style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }}
                />
                <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{user?.name?.split(' ')[0]}</span>
              </button>

              {dropdown && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '0.5rem', minWidth: 220,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.4)', zIndex: 100,
                }}>
                  <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border)', marginBottom: '0.25rem' }}>
                    <div style={{ fontWeight: 600 }}>{user?.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.email}</div>
                    <span className="badge badge-primary" style={{ marginTop: '0.25rem' }}>{user?.role}</span>
                  </div>

                  {[
                    { to: '/profile',            icon: <FiUser />,      label: 'Profile' },
                    { to: '/my-courses',         icon: <FiBook />,      label: 'My Courses', show: !isInstructor && !isAdmin },
                    { to: '/instructor/dashboard', icon: <FiBarChart2 />, label: 'Instructor Dashboard', show: isInstructor || isAdmin },
                    { to: '/instructor/courses/create', icon: <FiPlusCircle />, label: 'Create Course', show: isInstructor || isAdmin },
                    { to: '/admin',              icon: <FiShield />,    label: 'Admin Panel', show: isAdmin },
                  ].filter(item => item.show !== false).map(item => (
                    <Link key={item.to} to={item.to} style={{
                      display: 'flex', alignItems: 'center', gap: '0.625rem',
                      padding: '0.5rem 0.75rem', borderRadius: 8, color: 'var(--text)',
                      fontSize: '0.875rem', transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {item.icon} {item.label}
                    </Link>
                  ))}

                  <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0.25rem 0' }} />
                  <button onClick={logout} style={{
                    display: 'flex', alignItems: 'center', gap: '0.625rem',
                    padding: '0.5rem 0.75rem', borderRadius: 8, color: 'var(--danger)',
                    background: 'none', border: 'none', cursor: 'pointer', width: '100%',
                    fontSize: '0.875rem',
                  }}>
                    <FiLogOut /> Log out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
