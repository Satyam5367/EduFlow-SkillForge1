import React from 'react';
import { Link } from 'react-router-dom';
import { FiBook, FiGithub, FiLinkedin, FiTwitter, FiMail } from 'react-icons/fi';

export default function Footer() {
  const year = new Date().getFullYear();

  const links = {
    Platform: [
      { label: 'Browse Courses', to: '/courses' },
      { label: 'Become Instructor', to: '/profile' },
      { label: 'My Learning', to: '/my-courses' },
      { label: 'Wishlist', to: '/wishlist' },
    ],
    Company: [
      { label: 'About Us', to: '/' },
      { label: 'Careers', to: '/' },
      { label: 'Blog', to: '/' },
      { label: 'Press', to: '/' },
    ],
    Support: [
      { label: 'Help Center', to: '/' },
      { label: 'Contact Us', to: '/' },
      { label: 'Privacy Policy', to: '/' },
      { label: 'Terms of Service', to: '/' },
    ],
  };

  return (
    <footer style={{
      background: 'var(--bg-card)',
      borderTop: '1px solid var(--border)',
      padding: '4rem 0 2rem',
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '3rem', marginBottom: '3rem' }}>
          {/* Brand */}
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ width: 36, height: 36, background: 'var(--primary)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiBook color="white" size={20} />
              </div>
              <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.25rem' }}>EduFlow</span>
            </Link>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: 280 }}>
              The modern learning platform where students grow and instructors thrive. 10,000+ courses across every domain.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              {[
                { icon: <FiGithub />, href: 'https://github.com' },
                { icon: <FiLinkedin />, href: 'https://linkedin.com' },
                { icon: <FiTwitter />, href: 'https://twitter.com' },
                { icon: <FiMail />, href: 'mailto:hello@eduflow.com' },
              ].map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noreferrer" style={{
                  width: 36, height: 36, background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)', borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-muted)', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.95rem' }}>{title}</h4>
              <ul style={{ listStyle: 'none' }}>
                {items.map(item => (
                  <li key={item.label} style={{ marginBottom: '0.6rem' }}>
                    <Link to={item.to} style={{ color: 'var(--text-muted)', fontSize: '0.875rem', transition: 'color 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            © {year} EduFlow. All rights reserved. Built with ❤️ using MERN Stack.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {['Privacy', 'Terms', 'Cookies'].map(item => (
              <Link key={item} to="/" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{item}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
