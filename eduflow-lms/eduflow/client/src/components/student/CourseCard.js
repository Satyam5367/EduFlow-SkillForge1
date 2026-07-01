import React from 'react';
import { Link } from 'react-router-dom';
import { FiStar, FiUsers, FiClock, FiHeart } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api.service';
import { toast } from 'react-toastify';

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function CourseCard({ course, onWishlistToggle }) {
  const { isAuthenticated, isWishlisted, user } = useAuth();
  const wishlisted = isWishlisted(course._id);

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.info('Please login to save courses'); return; }
    try {
      await userAPI.toggleWishlist(course._id);
      if (onWishlistToggle) onWishlistToggle(course._id);
      toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist ❤️');
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const effectivePrice = course.isFree ? 0 :
    (course.discountPrice && new Date(course.discountExpiry) > new Date())
      ? course.discountPrice : course.price;

  return (
    <Link to={`/courses/${course.slug || course._id}`} style={{ display: 'block', textDecoration: 'none' }}>
      <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Thumbnail */}
        <div style={{ position: 'relative', paddingTop: '56.25%', overflow: 'hidden' }}>
          <img
            src={course.thumbnail?.url}
            alt={course.title}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />
          {/* Badges */}
          <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', gap: '0.5rem' }}>
            {course.isFree && <span className="badge badge-success">FREE</span>}
            {course.featured && <span className="badge badge-primary">⭐ Featured</span>}
            {course.discountPrice && new Date(course.discountExpiry) > new Date() && (
              <span className="badge badge-warning">SALE</span>
            )}
          </div>
          {/* Wishlist button */}
          {isAuthenticated && user?.role === 'student' && (
            <button onClick={handleWishlist} style={{
              position: 'absolute', top: '0.75rem', right: '0.75rem',
              background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
              width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', backdropFilter: 'blur(4px)', transition: 'all 0.2s',
              color: wishlisted ? '#ef4444' : 'white',
            }}>
              <FiHeart fill={wishlisted ? '#ef4444' : 'none'} size={16} />
            </button>
          )}
          {/* Level badge */}
          <span style={{
            position: 'absolute', bottom: '0.75rem', right: '0.75rem',
            background: 'rgba(0,0,0,0.7)', color: 'white', padding: '0.2rem 0.5rem',
            borderRadius: 6, fontSize: '0.75rem', fontWeight: 500, backdropFilter: 'blur(4px)',
          }}>
            {course.level}
          </span>
        </div>

        {/* Content */}
        <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {course.category}
          </span>

          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.4,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {course.title}
          </h3>

          {course.instructor && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              by {course.instructor?.name || 'Instructor'}
            </p>
          )}

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--accent)' }}>
              {course.avgRating?.toFixed(1) || '0.0'}
            </span>
            <div className="stars">
              {[1, 2, 3, 4, 5].map(s => (
                <FiStar key={s} size={12}
                  fill={s <= Math.round(course.avgRating) ? 'var(--accent)' : 'none'}
                  color={s <= Math.round(course.avgRating) ? 'var(--accent)' : 'var(--text-muted)'}
                />
              ))}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              ({course.totalRatings?.toLocaleString() || 0})
            </span>
          </div>

          {/* Meta */}
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <FiUsers size={12} /> {course.totalStudents?.toLocaleString() || 0}
            </span>
            {course.totalDuration > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <FiClock size={12} /> {formatDuration(course.totalDuration)}
              </span>
            )}
            {course.totalLectures > 0 && (
              <span>{course.totalLectures} lectures</span>
            )}
          </div>

          {/* Price */}
          <div style={{ marginTop: 'auto', paddingTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {course.isFree ? (
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--secondary)' }}>Free</span>
            ) : (
              <>
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>₹{effectivePrice}</span>
                {effectivePrice < course.price && (
                  <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    ₹{course.price}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
