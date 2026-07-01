// ForgotPassword.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/api.service';
import { toast } from 'react-toastify';
import { FiMail, FiArrowLeft, FiBook } from 'react-icons/fi';

export function ForgotPassword() {
  const [email, setEmail]   = useState('');
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
      toast.success('Password reset email sent!');
    } catch (err) {
      toast.error(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 56, height: 56, background: 'var(--primary)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <FiBook color="white" size={28} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Forgot Password</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.375rem' }}>Enter your email to receive a reset link</p>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '2rem' }}>
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
              <h3 style={{ marginBottom: '0.5rem' }}>Check your email</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>We sent a reset link to <strong>{email}</strong>. It expires in 10 minutes.</p>
              <Link to="/login" className="btn btn-outline" style={{ marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                <FiArrowLeft /> Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <FiMail style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="input" type="email" placeholder="you@example.com" required style={{ paddingLeft: '2.5rem' }}
                    value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <FiArrowLeft /> Back to Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
