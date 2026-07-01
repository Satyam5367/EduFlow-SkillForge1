import React from 'react';

export default function Loader({ fullscreen = false, size = 40 }) {
  const style = fullscreen ? {
    position: 'fixed', inset: 0, background: 'var(--bg)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', zIndex: 9999, gap: '1rem',
  } : {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '4rem', gap: '1rem',
  };

  return (
    <div style={style}>
      <div style={{
        width: size, height: size,
        border: `3px solid var(--border)`,
        borderTopColor: 'var(--primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      {fullscreen && (
        <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading EduFlow...</span>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
