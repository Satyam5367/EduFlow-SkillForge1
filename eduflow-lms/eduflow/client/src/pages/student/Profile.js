import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api.service';
import { toast } from 'react-toastify';
import { FiEdit2, FiSave, FiCamera, FiLock } from 'react-icons/fi';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile]       = useState(null);
  const [form, setForm] = useState({
    name:     user?.name || '',
    bio:      user?.bio || '',
    headline: user?.headline || '',
    website:  user?.website || '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (avatarFile) fd.append('avatar', avatarFile);
      const { data } = await userAPI.updateProfile(fd);
      updateUser(data.data);
      setEditing(false);
      setAvatarPreview(null);
      setAvatarFile(null);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setPwLoading(true);
    try {
      await userAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>My Profile</h1>
          <button
            onClick={() => editing ? handleSave() : setEditing(true)}
            disabled={loading}
            className={editing ? 'btn btn-primary' : 'btn btn-outline'}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
          >
            {editing ? <><FiSave /> {loading ? 'Saving...' : 'Save Changes'}</> : <><FiEdit2 /> Edit Profile</>}
          </button>
        </div>

        {/* Profile card */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '2rem', marginBottom: '1.5rem' }}>
          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img
                src={avatarPreview || user?.avatar?.url}
                alt={user?.name}
                style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }}
              />
              {editing && (
                <label style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <FiCamera size={14} color="white" />
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
                </label>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>{user?.role}</span>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user?.email}</div>
              {!user?.isVerified && (
                <div style={{ marginTop: '0.375rem', fontSize: '0.8rem', color: 'var(--accent)' }}>⚠️ Email not verified</div>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { label: 'Full Name', key: 'name', type: 'text' },
              { label: 'Headline', key: 'headline', type: 'text', placeholder: 'e.g. Full Stack Developer' },
              { label: 'Website', key: 'website', type: 'url', placeholder: 'https://yoursite.com' },
            ].map(field => (
              <div key={field.key} style={field.key === 'name' ? {} : {}}>
                <label className="label">{field.label}</label>
                {editing ? (
                  <input className="input" type={field.type} placeholder={field.placeholder}
                    value={form[field.key]} onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))} />
                ) : (
                  <div style={{ padding: '0.625rem 0', color: form[field.key] || 'var(--text-muted)', fontSize: '0.95rem' }}>
                    {form[field.key] || '—'}
                  </div>
                )}
              </div>
            ))}

            <div style={{ gridColumn: '1 / -1' }}>
              <label className="label">Bio</label>
              {editing ? (
                <textarea className="input" rows={3} placeholder="Tell us about yourself..."
                  value={form.bio} onChange={e => setForm(prev => ({ ...prev, bio: e.target.value }))}
                  style={{ resize: 'vertical' }} />
              ) : (
                <div style={{ color: form.bio ? 'var(--text)' : 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7 }}>
                  {form.bio || 'No bio added yet.'}
                </div>
              )}
            </div>
          </div>

          {editing && (
            <div style={{ marginTop: '1rem' }}>
              <button onClick={() => { setEditing(false); setAvatarPreview(null); setAvatarFile(null); }} className="btn btn-outline btn-sm">
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Change Password */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiLock /> Change Password
          </h2>
          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 400 }}>
            {[
              { key: 'currentPassword', label: 'Current Password' },
              { key: 'newPassword',     label: 'New Password' },
              { key: 'confirm',         label: 'Confirm New Password' },
            ].map(f => (
              <div key={f.key}>
                <label className="label">{f.label}</label>
                <input className="input" type="password" required
                  value={pwForm[f.key]}
                  onChange={e => setPwForm(prev => ({ ...prev, [f.key]: e.target.value }))} />
              </div>
            ))}
            <button type="submit" disabled={pwLoading} className="btn btn-primary" style={{ width: 'fit-content' }}>
              {pwLoading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
