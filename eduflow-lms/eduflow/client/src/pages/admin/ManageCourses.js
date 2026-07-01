import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api.service';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';
import { FiSearch, FiCheck, FiX, FiEye, FiFilter } from 'react-icons/fi';

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal]     = useState(0);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await adminAPI.getCourses(params);
      setCourses(data.data);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const handleReview = async (courseId, action) => {
    setActionLoading(courseId + action);
    try {
      await adminAPI.reviewCourse(courseId, { action });
      setCourses(prev => prev.map(c =>
        c._id === courseId
          ? { ...c, status: action === 'approve' ? 'published' : 'draft', isApproved: action === 'approve' }
          : c
      ));
      toast.success(`Course ${action === 'approve' ? 'approved and published! 🎉' : 'rejected'}`);
    } catch (err) {
      toast.error(err.message || `Failed to ${action} course`);
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = search
    ? courses.filter(c => c.title.toLowerCase().includes(search.toLowerCase()))
    : courses;

  const statusTabs = [
    { value:'pending',   label:'Pending Review' },
    { value:'published', label:'Published' },
    { value:'draft',     label:'Draft' },
    { value:'',          label:'All' },
  ];

  return (
    <div style={{ padding:'2rem 0' }}>
      <div className="container">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem' }}>
          <div>
            <h1 style={{ fontSize:'2rem', fontWeight:700 }}>Manage Courses</h1>
            <p style={{ color:'var(--text-muted)' }}>{total} courses found</p>
          </div>
        </div>

        {/* Status tabs */}
        <div style={{ display:'flex', gap:0, borderBottom:'1px solid var(--border)', marginBottom:'1.5rem' }}>
          {statusTabs.map(tab => (
            <button key={tab.value}
              onClick={() => { setStatusFilter(tab.value); setPage(1); }}
              style={{
                padding:'0.625rem 1.25rem', background:'none', border:'none',
                borderBottom: statusFilter === tab.value ? '2px solid var(--primary)' : '2px solid transparent',
                color: statusFilter === tab.value ? 'var(--primary)' : 'var(--text-muted)',
                cursor:'pointer', fontWeight:600, fontSize:'0.875rem', marginBottom:'-1px',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position:'relative', maxWidth:400, marginBottom:'1.5rem' }}>
          <FiSearch style={{ position:'absolute', left:'0.875rem', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
          <input className="input" placeholder="Search courses..." style={{ paddingLeft:'2.5rem' }}
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Courses list */}
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
          {loading ? <Loader /> : filtered.length === 0 ? (
            <div style={{ textAlign:'center', padding:'4rem', color:'var(--text-muted)' }}>
              No {statusFilter} courses found
            </div>
          ) : (
            filtered.map(course => (
              <div key={course._id} style={{ display:'flex', alignItems:'center', gap:'1.25rem', padding:'1.25rem 1.5rem', borderBottom:'1px solid var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                {/* Thumbnail */}
                <img src={course.thumbnail?.url} alt=""
                  style={{ width:80, height:52, objectFit:'cover', borderRadius:8, flexShrink:0 }} />

                {/* Info */}
                <div style={{ flex:1, minWidth:0 }}>
                  <h3 style={{ fontWeight:600, fontSize:'0.95rem', marginBottom:'0.25rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {course.title}
                  </h3>
                  <div style={{ display:'flex', gap:'1rem', fontSize:'0.8rem', color:'var(--text-muted)', flexWrap:'wrap' }}>
                    <span>By {course.instructor?.name}</span>
                    <span>{course.category}</span>
                    <span>{course.level}</span>
                    <span>{course.isFree ? 'Free' : `₹${course.price}`}</span>
                    <span>Submitted {new Date(course.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
                  </div>
                </div>

                {/* Status */}
                <span className={`badge ${course.status === 'published' ? 'badge-success' : course.status === 'pending' ? 'badge-warning' : 'badge-primary'}`} style={{ flexShrink:0 }}>
                  {course.status}
                </span>

                {/* Actions */}
                <div style={{ display:'flex', gap:'0.5rem', flexShrink:0 }}>
                  <Link to={`/courses/${course.slug || course._id}`} target="_blank"
                    title="Preview course"
                    style={{ width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-muted)', textDecoration:'none' }}>
                    <FiEye size={15} />
                  </Link>

                  {course.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleReview(course._id, 'approve')}
                        disabled={actionLoading === course._id + 'approve'}
                        title="Approve & Publish"
                        style={{ width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(16,185,129,0.15)', border:'1.5px solid var(--secondary)', borderRadius:8, cursor:'pointer', color:'var(--secondary)' }}>
                        {actionLoading === course._id + 'approve' ? '...' : <FiCheck size={15} />}
                      </button>
                      <button
                        onClick={() => handleReview(course._id, 'reject')}
                        disabled={actionLoading === course._id + 'reject'}
                        title="Reject"
                        style={{ width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(239,68,68,0.15)', border:'1.5px solid var(--danger)', borderRadius:8, cursor:'pointer', color:'var(--danger)' }}>
                        {actionLoading === course._id + 'reject' ? '...' : <FiX size={15} />}
                      </button>
                    </>
                  )}

                  {course.status === 'published' && (
                    <button
                      onClick={() => handleReview(course._id, 'reject')}
                      title="Unpublish"
                      style={{ width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(239,68,68,0.1)', border:'1px solid var(--danger)', borderRadius:8, cursor:'pointer', color:'var(--danger)' }}>
                      <FiX size={15} />
                    </button>
                  )}

                  {course.status === 'draft' && (
                    <button
                      onClick={() => handleReview(course._id, 'approve')}
                      title="Force Publish"
                      style={{ width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(16,185,129,0.1)', border:'1px solid var(--secondary)', borderRadius:8, cursor:'pointer', color:'var(--secondary)' }}>
                      <FiCheck size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {total > 15 && (
          <div style={{ display:'flex', justifyContent:'center', gap:'0.5rem', marginTop:'1.5rem' }}>
            {Array.from({ length: Math.ceil(total / 15) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={p === page ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
