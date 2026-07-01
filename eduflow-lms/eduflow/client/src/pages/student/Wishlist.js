// Wishlist.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../../services/api.service';
import CourseCard from '../../components/student/CourseCard';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../context/AuthContext';

export default function Wishlist() {
  const { user, updateUser } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    userAPI.getProfile().then(({ data }) => {
      setWishlist(data.data.wishlist || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleToggle = async (courseId) => {
    setWishlist(prev => prev.filter(c => (c._id || c) !== courseId));
  };

  if (loading) return <Loader />;

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container">
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Wishlist</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{wishlist.length} courses saved</p>

        {wishlist.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❤️</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Your wishlist is empty</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Save courses you're interested in</p>
            <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
          </div>
        ) : (
          <div className="grid-4">
            {wishlist.map(course => (
              course?._id && <CourseCard key={course._id} course={course} onWishlistToggle={handleToggle} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
