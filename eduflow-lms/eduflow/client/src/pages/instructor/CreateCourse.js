import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseAPI } from '../../services/api.service';
import { toast } from 'react-toastify';
import { FiUpload, FiPlus, FiX, FiArrowLeft } from 'react-icons/fi';

const CATEGORIES = [
  'Web Development','Mobile Development','Data Science','Machine Learning',
  'DevOps','Cybersecurity','Database','Cloud Computing',
  'UI/UX Design','Programming Languages','Game Development','Blockchain','Other',
];
const LEVELS = ['Beginner','Intermediate','Advanced','All Levels'];

export default function CreateCourse() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [form, setForm] = useState({
    title: '', subtitle: '', description: '', category: '', level: '', price: '',
    requirements: [''], learningOutcomes: [''], tags: '',
  });
  const fileRef = useRef();

  const handleThumbnail = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnail(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const updateListItem = (field, index, value) => {
    setForm(prev => {
      const arr = [...prev[field]];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  };

  const addListItem = (field) => setForm(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  const removeListItem = (field, index) => setForm(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category || !form.level) {
      toast.error('Please fill all required fields'); return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'requirements' || k === 'learningOutcomes') {
          fd.append(k, JSON.stringify(v.filter(Boolean)));
        } else if (k === 'tags') {
          fd.append(k, JSON.stringify(v.split(',').map(t => t.trim()).filter(Boolean)));
        } else {
          fd.append(k, v);
        }
      });
      if (thumbnail) fd.append('thumbnail', thumbnail);

      await courseAPI.create(fd);
      toast.success('Course created! Add sections and lectures.');
      navigate('/instructor/dashboard');
    } catch (err) {
      toast.error(err.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <button onClick={() => navigate('/instructor/dashboard')} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '1.5rem' }}>
          <FiArrowLeft /> Back to Dashboard
        </button>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Create New Course</h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Thumbnail */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Course Thumbnail</h3>
            <div
              onClick={() => fileRef.current?.click()}
              style={{ border: '2px dashed var(--border)', borderRadius: 10, padding: '2rem', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s', overflow: 'hidden' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              {thumbnailPreview ? (
                <img src={thumbnailPreview} alt="Preview" style={{ maxHeight: 200, borderRadius: 8, objectFit: 'cover' }} />
              ) : (
                <div style={{ color: 'var(--text-muted)' }}>
                  <FiUpload size={32} style={{ marginBottom: '0.5rem' }} />
                  <p style={{ fontWeight: 500 }}>Click to upload thumbnail</p>
                  <p style={{ fontSize: '0.8rem' }}>Recommended: 800×450px, JPG/PNG</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleThumbnail} />
          </div>

          {/* Basic info */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ marginBottom: '0.25rem' }}>Basic Information</h3>
            <div>
              <label className="label">Course Title *</label>
              <input className="input" placeholder="e.g. Complete React Development Bootcamp" required
                value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div>
              <label className="label">Subtitle</label>
              <input className="input" placeholder="Short description shown in search results"
                value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))} />
            </div>
            <div>
              <label className="label">Description *</label>
              <textarea className="input" rows={5} placeholder="Describe what students will learn..." required minLength={50}
                value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="label">Category *</label>
                <select className="input" required value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Level *</label>
                <select className="input" required value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))}>
                  <option value="">Select level</option>
                  {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Price (₹)</label>
                <input className="input" type="number" min="0" placeholder="0 for free"
                  value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label">Tags (comma separated)</label>
              <input className="input" placeholder="react, javascript, frontend"
                value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
            </div>
          </div>

          {/* Requirements */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Requirements</h3>
            {form.requirements.map((req, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input className="input" placeholder={`Requirement ${i + 1}`}
                  value={req} onChange={e => updateListItem('requirements', i, e.target.value)} />
                {form.requirements.length > 1 && (
                  <button type="button" onClick={() => removeListItem('requirements', i)} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '0 0.75rem', cursor: 'pointer', color: 'var(--danger)' }}>
                    <FiX />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addListItem('requirements')} className="btn btn-outline btn-sm" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <FiPlus /> Add Requirement
            </button>
          </div>

          {/* Learning Outcomes */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>What Students Will Learn</h3>
            {form.learningOutcomes.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input className="input" placeholder={`Learning outcome ${i + 1}`}
                  value={item} onChange={e => updateListItem('learningOutcomes', i, e.target.value)} />
                {form.learningOutcomes.length > 1 && (
                  <button type="button" onClick={() => removeListItem('learningOutcomes', i)} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '0 0.75rem', cursor: 'pointer', color: 'var(--danger)' }}>
                    <FiX />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addListItem('learningOutcomes')} className="btn btn-outline btn-sm" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <FiPlus /> Add Outcome
            </button>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => navigate('/instructor/dashboard')} className="btn btn-outline">Cancel</button>
            <button type="submit" disabled={loading} className="btn btn-primary btn-lg">
              {loading ? 'Creating...' : 'Create Course →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
