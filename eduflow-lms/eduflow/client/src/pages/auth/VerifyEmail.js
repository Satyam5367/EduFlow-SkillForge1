import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authAPI } from '../../services/api.service';

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // loading | success | error

  useEffect(() => {
    authAPI.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', maxWidth: 400, padding: '2rem' }}>
        {status === 'loading' && <><div className="spinner" /><p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Verifying your email...</p></>}
        {status === 'success' && (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h2 style={{ marginBottom: '0.5rem' }}>Email Verified!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Your account is now fully activated.</p>
            <Link to="/login" className="btn btn-primary">Continue to Login</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
            <h2 style={{ marginBottom: '0.5rem' }}>Verification Failed</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>This link is invalid or has expired. Please request a new one.</p>
            <Link to="/login" className="btn btn-outline">Back to Login</Link>
          </>
        )}
      </div>
    </div>
  );
}
