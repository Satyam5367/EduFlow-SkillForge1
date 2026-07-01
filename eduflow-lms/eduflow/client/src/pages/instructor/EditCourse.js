import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseAPI } from '../../services/api.service';
import { toast } from 'react-toastify';
import {
  FiPlus, FiTrash2, FiUpload, FiChevronDown, FiChevronUp,
  FiArrowLeft, FiSave, FiVideo, FiEye,
} from 'react-icons/fi';

const CATEGORIES = [
  'Web Development','Mobile Development','Data Science','Machine Learning',
  'DevOps','Cybersecurity','Database','Cloud Computing',
  'UI/UX Design','Programming Languages','Game Development','Blockchain','Other',
];
const LEVELS = ['Beginner','Intermediate','Advanced','All Levels'];

export default function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef();

  const [course, setCourse]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [expanded, setExpanded] = useState({});

  // New section/lecture forms
  const [newSection, setNewSection]   = useState('');
  const [addingSection, setAddingSection] = useState(false);
  const [newLecture, setNewLecture]   = useState({ title: '', description: '', isPreview: false, duration: '' });
  const [addingLectureTo, setAddingLectureTo] = useState(null); // sectionId
  const [lectureVideo, setLectureVideo] = useState(null);
  const [lectureLoading, setLectureLoading] = useState(false);

  useEffect(() => {
    courseAPI.getOne(id)
      .then(({ data }) => {
        setCourse(data.data);
        // expand all sections by default
        const exp = {};
        data.data.sections?.forEach(s => { exp[s._id] = true; });
        setExpanded(exp);
      })
      .catch(() => { toast.error('Course not found'); navigate('/instructor/dashboard'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleBasicSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      ['title','subtitle','description','category','level','price'].forEach(k => fd.append(k, course[k] || ''));
      fd.append('requirements',      JSON.stringify(course.requirements || []));
      fd.append('learningOutcomes',  JSON.stringify(course.learningOutcomes || []));
      fd.append('tags',              JSON.stringify(course.tags || []));
      await courseAPI.update(id, fd);
      toast.success('Course details saved!');
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSection = async () => {
    if (!newSection.trim()) return;
    try {
      const { data } = await courseAPI.addSection(id, { title: newSection.trim() });
      setCourse(data.data);
      setNewSection('');
      setAddingSection(false);
      toast.success('Section added!');
    } catch {
      toast.error('Failed to add section');
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm('Delete this section and all its lectures?')) return;
    try {
      const { data } = await courseAPI.deleteSection(id, sectionId);
      setCourse(data.data);
      toast.success('Section deleted');
    } catch {
      toast.error('Failed to delete section');
    }
  };

  const handleAddLecture = async (sectionId) => {
    if (!newLecture.title.trim()) { toast.error('Lecture title is required'); return; }
    setLectureLoading(true);
    try {
      const fd = new FormData();
      fd.append('title',       newLecture.title.trim());
      fd.append('description', newLecture.description);
      fd.append('isPreview',   newLecture.isPreview);
      fd.append('duration',    newLecture.duration || '0');
      if (lectureVideo) fd.append('video', lectureVideo);

      const { data } = await courseAPI.addLecture(id, sectionId, fd);
      setCourse(data.data);
      setNewLecture({ title: '', description: '', isPreview: false, duration: '' });
      setLectureVideo(null);
      setAddingLectureTo(null);
      toast.success('Lecture added!');
    } catch (err) {
      toast.error(err.message || 'Failed to add lecture');
    } finally {
      setLectureLoading(false);
    }
  };

  const handleDeleteLecture = async (sectionId, lectureId) => {
    if (!window.confirm('Delete this lecture?')) return;
    try {
      const { data } = await courseAPI.deleteLecture(id, sectionId, lectureId);
      setCourse(data.data);
      toast.success('Lecture deleted');
    } catch {
      toast.error('Failed to delete lecture');
    }
  };

  const updateCourseField = (field, value) => setCourse(prev => ({ ...prev, [field]: value }));
  const updateListItem = (field, index, value) => {
    setCourse(prev => {
      const arr = [...(prev[field] || [])];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  };
  const addListItem  = (field) => setCourse(prev => ({ ...prev, [field]: [...(prev[field] || []), ''] }));
  const removeListItem = (field, i) => setCourse(prev => ({ ...prev, [field]: prev[field].filter((_,idx) => idx !== i) }));

  if (loading || !course) return <div style={{ display:'flex', justifyContent:'center', padding:'4rem' }}><div className="spinner" /></div>;

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container" style={{ maxWidth: 900 }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
          <button onClick={() => navigate('/instructor/dashboard')} className="btn btn-outline btn-sm" style={{ display:'flex', alignItems:'center', gap:'0.375rem' }}>
            <FiArrowLeft /> Dashboard
          </button>
          <div style={{ display:'flex', gap:'0.75rem' }}>
            <a href={`/courses/${course.slug || course._id}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ display:'flex', alignItems:'center', gap:'0.375rem' }}>
              <FiEye /> Preview
            </a>
            <button onClick={handleBasicSave} disabled={saving} className="btn btn-primary btn-sm" style={{ display:'flex', alignItems:'center', gap:'0.375rem' }}>
              <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <h1 style={{ fontSize:'1.75rem', fontWeight:700, marginBottom:'0.375rem' }}>Edit Course</h1>
        <p style={{ color:'var(--text-muted)', marginBottom:'2rem', fontSize:'0.9rem' }}>
          Status: <span className={`badge ${course.status === 'published' ? 'badge-success' : course.status === 'pending' ? 'badge-warning' : 'badge-primary'}`}>{course.status}</span>
          {course.isApproved && <span className="badge badge-success" style={{ marginLeft:'0.5rem' }}>✓ Approved</span>}
        </p>

        {/* ── Basic Info ─────────────────────────────────── */}
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'1.5rem', marginBottom:'1.5rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
          <h2 style={{ fontSize:'1.1rem', fontWeight:700 }}>Basic Information</h2>

          <div>
            <label className="label">Course Title *</label>
            <input className="input" value={course.title || ''} onChange={e => updateCourseField('title', e.target.value)} />
          </div>
          <div>
            <label className="label">Subtitle</label>
            <input className="input" value={course.subtitle || ''} onChange={e => updateCourseField('subtitle', e.target.value)} />
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea className="input" rows={5} style={{ resize:'vertical' }}
              value={course.description || ''} onChange={e => updateCourseField('description', e.target.value)} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'1rem' }}>
            <div>
              <label className="label">Category</label>
              <select className="input" value={course.category || ''} onChange={e => updateCourseField('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Level</label>
              <select className="input" value={course.level || ''} onChange={e => updateCourseField('level', e.target.value)}>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Price (₹)</label>
              <input className="input" type="number" min="0"
                value={course.price || ''} onChange={e => updateCourseField('price', e.target.value)} />
            </div>
          </div>

          {/* Requirements */}
          <div>
            <label className="label">Requirements</label>
            {(course.requirements || []).map((r, i) => (
              <div key={i} style={{ display:'flex', gap:'0.5rem', marginBottom:'0.5rem' }}>
                <input className="input" value={r} onChange={e => updateListItem('requirements', i, e.target.value)} placeholder={`Requirement ${i+1}`} />
                <button type="button" onClick={() => removeListItem('requirements', i)} style={{ background:'rgba(239,68,68,0.1)', border:'1px solid var(--danger)', borderRadius:8, padding:'0 0.75rem', cursor:'pointer', color:'var(--danger)' }}>✕</button>
              </div>
            ))}
            <button type="button" onClick={() => addListItem('requirements')} className="btn btn-outline btn-sm" style={{ display:'flex', alignItems:'center', gap:'0.375rem' }}>
              <FiPlus /> Add Requirement
            </button>
          </div>

          {/* Learning Outcomes */}
          <div>
            <label className="label">Learning Outcomes</label>
            {(course.learningOutcomes || []).map((o, i) => (
              <div key={i} style={{ display:'flex', gap:'0.5rem', marginBottom:'0.5rem' }}>
                <input className="input" value={o} onChange={e => updateListItem('learningOutcomes', i, e.target.value)} placeholder={`Outcome ${i+1}`} />
                <button type="button" onClick={() => removeListItem('learningOutcomes', i)} style={{ background:'rgba(239,68,68,0.1)', border:'1px solid var(--danger)', borderRadius:8, padding:'0 0.75rem', cursor:'pointer', color:'var(--danger)' }}>✕</button>
              </div>
            ))}
            <button type="button" onClick={() => addListItem('learningOutcomes')} className="btn btn-outline btn-sm" style={{ display:'flex', alignItems:'center', gap:'0.375rem' }}>
              <FiPlus /> Add Outcome
            </button>
          </div>
        </div>

        {/* ── Curriculum Builder ─────────────────────────── */}
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'1.5rem', marginBottom:'1.5rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
            <h2 style={{ fontSize:'1.1rem', fontWeight:700 }}>Course Curriculum</h2>
            <button onClick={() => setAddingSection(true)} className="btn btn-outline btn-sm" style={{ display:'flex', alignItems:'center', gap:'0.375rem' }}>
              <FiPlus /> Add Section
            </button>
          </div>

          {/* Add section form */}
          {addingSection && (
            <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1rem', padding:'1rem', background:'var(--bg-elevated)', borderRadius:10 }}>
              <input className="input" placeholder="Section title..." value={newSection} onChange={e => setNewSection(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddSection()} autoFocus />
              <button onClick={handleAddSection} className="btn btn-primary btn-sm">Add</button>
              <button onClick={() => { setAddingSection(false); setNewSection(''); }} className="btn btn-outline btn-sm">Cancel</button>
            </div>
          )}

          {(course.sections || []).length === 0 ? (
            <div style={{ textAlign:'center', padding:'3rem', color:'var(--text-muted)' }}>
              <FiVideo size={32} style={{ marginBottom:'0.75rem' }} />
              <p>No sections yet. Add your first section to start building the curriculum.</p>
            </div>
          ) : (
            (course.sections || []).map((section, si) => (
              <div key={section._id} style={{ border:'1px solid var(--border)', borderRadius:10, marginBottom:'0.75rem', overflow:'hidden' }}>
                {/* Section header */}
                <div style={{ display:'flex', alignItems:'center', padding:'0.875rem 1.25rem', background:'var(--bg-elevated)', gap:'0.75rem' }}>
                  <button onClick={() => setExpanded(p => ({ ...p, [section._id]: !p[section._id] }))}
                    style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', display:'flex' }}>
                    {expanded[section._id] ? <FiChevronUp /> : <FiChevronDown />}
                  </button>
                  <span style={{ fontWeight:600, flex:1 }}>
                    Section {si+1}: {section.title}
                  </span>
                  <span style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{section.lectures?.length || 0} lectures</span>
                  <button onClick={() => handleDeleteSection(section._id)} style={{ background:'rgba(239,68,68,0.1)', border:'1px solid var(--danger)', borderRadius:6, padding:'0.25rem 0.5rem', cursor:'pointer', color:'var(--danger)', display:'flex', alignItems:'center' }}>
                    <FiTrash2 size={13} />
                  </button>
                </div>

                {/* Lectures list */}
                {expanded[section._id] && (
                  <div>
                    {(section.lectures || []).map((lecture, li) => (
                      <div key={lecture._id} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem 1.25rem', borderTop:'1px solid var(--border)', fontSize:'0.875rem' }}>
                        <span style={{ color:'var(--text-muted)', minWidth:24, textAlign:'center' }}>{li+1}</span>
                        <FiVideo size={14} color="var(--primary)" />
                        <span style={{ flex:1 }}>{lecture.title}</span>
                        {lecture.isPreview && <span className="badge badge-primary" style={{ fontSize:'0.7rem' }}>Preview</span>}
                        {lecture.video?.duration > 0 && (
                          <span style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>
                            {Math.floor(lecture.video.duration/60)}m
                          </span>
                        )}
                        <button onClick={() => handleDeleteLecture(section._id, lecture._id)}
                          style={{ background:'none', border:'none', cursor:'pointer', color:'var(--danger)', display:'flex', alignItems:'center', padding:'0.25rem' }}>
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    ))}

                    {/* Add lecture form */}
                    {addingLectureTo === section._id ? (
                      <div style={{ padding:'1rem 1.25rem', borderTop:'1px solid var(--border)', background:'rgba(108,99,255,0.05)' }}>
                        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                          <input className="input" placeholder="Lecture title *" value={newLecture.title}
                            onChange={e => setNewLecture(p => ({ ...p, title: e.target.value }))} autoFocus />
                          <textarea className="input" rows={2} placeholder="Description (optional)" style={{ resize:'vertical' }}
                            value={newLecture.description} onChange={e => setNewLecture(p => ({ ...p, description: e.target.value }))} />
                          <div style={{ display:'flex', gap:'1rem', alignItems:'center' }}>
                            <div style={{ flex:1 }}>
                              <label className="label">Video File (optional)</label>
                              <label style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.625rem 1rem', background:'var(--bg-elevated)', border:'1.5px dashed var(--border)', borderRadius:8, cursor:'pointer', fontSize:'0.875rem', color:'var(--text-muted)' }}>
                                <FiUpload size={15} />
                                {lectureVideo ? lectureVideo.name : 'Click to upload video'}
                                <input ref={videoRef} type="file" accept="video/*" style={{ display:'none' }}
                                  onChange={e => setLectureVideo(e.target.files[0])} />
                              </label>
                            </div>
                            <div>
                              <label className="label">Duration (seconds)</label>
                              <input className="input" type="number" placeholder="e.g. 600" style={{ width:120 }}
                                value={newLecture.duration} onChange={e => setNewLecture(p => ({ ...p, duration: e.target.value }))} />
                            </div>
                          </div>
                          <label style={{ display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer', fontSize:'0.875rem' }}>
                            <input type="checkbox" checked={newLecture.isPreview}
                              onChange={e => setNewLecture(p => ({ ...p, isPreview: e.target.checked }))} />
                            Mark as free preview (visible to non-enrolled users)
                          </label>
                          <div style={{ display:'flex', gap:'0.75rem' }}>
                            <button onClick={() => handleAddLecture(section._id)} disabled={lectureLoading}
                              className="btn btn-primary btn-sm">
                              {lectureLoading ? 'Adding...' : 'Add Lecture'}
                            </button>
                            <button onClick={() => { setAddingLectureTo(null); setNewLecture({ title:'', description:'', isPreview:false, duration:'' }); setLectureVideo(null); }}
                              className="btn btn-outline btn-sm">Cancel</button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setAddingLectureTo(section._id)}
                        style={{ width:'100%', display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.75rem 1.25rem', background:'none', border:'none', borderTop:'1px solid var(--border)', cursor:'pointer', color:'var(--primary)', fontSize:'0.875rem', fontWeight:500 }}>
                        <FiPlus size={15} /> Add Lecture
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Submit for review */}
        {course.status === 'draft' && course.sections?.length > 0 && (
          <div style={{ background:'rgba(16,185,129,0.1)', border:'1px solid var(--secondary)', borderRadius:12, padding:'1.25rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <h3 style={{ fontSize:'1rem', fontWeight:600, marginBottom:'0.25rem' }}>Ready to publish?</h3>
              <p style={{ color:'var(--text-muted)', fontSize:'0.875rem' }}>Submit your course for admin review.</p>
            </div>
            <button onClick={async () => {
              try {
                await courseAPI.submit(id);
                setCourse(p => ({ ...p, status:'pending' }));
                toast.success('Submitted for review!');
              } catch (err) { toast.error(err.message); }
            }} className="btn btn-success">Submit for Review</button>
          </div>
        )}
      </div>
    </div>
  );
}
