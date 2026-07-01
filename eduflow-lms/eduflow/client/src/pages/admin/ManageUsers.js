import React, { useState, useEffect, useCallback } from 'react';
import { adminAPI } from '../../services/api.service';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';
import { FiSearch, FiTrash2, FiShield, FiUser, FiBook } from 'react-icons/fi';

export default function ManageUsers() {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal]   = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage]     = useState(1);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (search)     params.search = search;
      if (roleFilter) params.role   = roleFilter;
      const { data } = await adminAPI.getUsers(params);
      setUsers(data.data);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleChange = async (userId, role) => {
    try {
      await adminAPI.updateUser(userId, { role });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role } : u));
      toast.success(`User role updated to ${role}`);
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handleToggleActive = async (userId, isActive) => {
    try {
      await adminAPI.updateUser(userId, { isActive: !isActive });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !isActive } : u));
      toast.success(`User ${!isActive ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    try {
      await adminAPI.deleteUser(userId);
      setUsers(prev => prev.filter(u => u._id !== userId));
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete user');
    }
  };

  const roleColors = { admin:'badge-danger', instructor:'badge-warning', student:'badge-primary' };

  return (
    <div style={{ padding:'2rem 0' }}>
      <div className="container">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem' }}>
          <div>
            <h1 style={{ fontSize:'2rem', fontWeight:700 }}>Manage Users</h1>
            <p style={{ color:'var(--text-muted)' }}>{total} total users</p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:'1rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
          <div style={{ flex:1, minWidth:240, position:'relative' }}>
            <FiSearch style={{ position:'absolute', left:'0.875rem', top:'50%', transform:'translateY(-50%)', color:'var(--text-muted)' }} />
            <input className="input" placeholder="Search by name or email..." style={{ paddingLeft:'2.5rem' }}
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="input" style={{ width:'auto' }} value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="instructor">Instructors</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        {/* Table */}
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
          {loading ? <Loader /> : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom:'1px solid var(--border)' }}>
                    {['User','Role','Status','Joined','Actions'].map(h => (
                      <th key={h} style={{ padding:'0.875rem 1.25rem', textAlign:'left', color:'var(--text-muted)', fontWeight:600, whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id} style={{ borderBottom:'1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding:'0.875rem 1.25rem' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                          <img src={user.avatar?.url} alt="" style={{ width:38, height:38, borderRadius:'50%', objectFit:'cover' }} />
                          <div>
                            <div style={{ fontWeight:600 }}>{user.name}</div>
                            <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:'0.875rem 1.25rem' }}>
                        <select
                          value={user.role}
                          onChange={e => handleRoleChange(user._id, e.target.value)}
                          style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)', borderRadius:6, padding:'0.25rem 0.5rem', color:'var(--text)', fontSize:'0.8rem', cursor:'pointer' }}
                        >
                          <option value="student">student</option>
                          <option value="instructor">instructor</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td style={{ padding:'0.875rem 1.25rem' }}>
                        <button
                          onClick={() => handleToggleActive(user._id, user.isActive)}
                          className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}
                          style={{ border:'none', cursor:'pointer', padding:'0.3rem 0.75rem' }}
                        >
                          {user.isActive ? '● Active' : '● Inactive'}
                        </button>
                      </td>
                      <td style={{ padding:'0.875rem 1.25rem', color:'var(--text-muted)' }}>
                        {new Date(user.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                      </td>
                      <td style={{ padding:'0.875rem 1.25rem' }}>
                        <div style={{ display:'flex', gap:'0.5rem' }}>
                          <button
                            onClick={() => handleDelete(user._id, user.name)}
                            title="Delete user"
                            style={{ width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(239,68,68,0.1)', border:'1px solid var(--danger)', borderRadius:6, cursor:'pointer', color:'var(--danger)' }}
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {users.length === 0 && (
                <div style={{ textAlign:'center', padding:'4rem', color:'var(--text-muted)' }}>
                  No users found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div style={{ display:'flex', justifyContent:'center', gap:'0.5rem', marginTop:'1.5rem' }}>
            {Array.from({ length: Math.ceil(total / 20) }, (_, i) => i + 1).map(p => (
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
