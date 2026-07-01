import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api.service';
import Loader from '../../components/common/Loader';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  FiUsers, FiBook, FiDollarSign, FiTrendingUp,
  FiShield, FiAlertCircle, FiCheckCircle, FiClock,
} from 'react-icons/fi';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const PIE_COLORS  = ['#6C63FF','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#06B6D4','#84CC16'];

export default function AdminDashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getAnalytics()
      .then(({ data: res }) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (!data)   return <div style={{ textAlign:'center', padding:'4rem' }}>Failed to load analytics</div>;

  const { overview, monthlyStats, categoryStats, recentPayments, recentUsers } = data;

  const chartData = monthlyStats?.map(m => ({
    month:   MONTH_NAMES[m._id.month - 1],
    revenue: m.revenue,
    orders:  m.count,
  })) || [];

  const pieData = categoryStats?.map(c => ({ name: c._id, value: c.count })) || [];

  const stats = [
    { label:'Total Users',      value:overview.totalUsers,       icon:<FiUsers />,      color:'#6C63FF' },
    { label:'Total Courses',    value:overview.totalCourses,     icon:<FiBook />,       color:'#10B981' },
    { label:'Published',        value:overview.publishedCourses, icon:<FiCheckCircle />, color:'#F59E0B' },
    { label:'Total Revenue',    value:`₹${overview.totalRevenue?.toLocaleString()}`, icon:<FiDollarSign />, color:'#EF4444' },
    { label:'Instructors',      value:overview.totalInstructors, icon:<FiTrendingUp />, color:'#8B5CF6' },
    { label:'Students',         value:overview.totalStudents,    icon:<FiShield />,     color:'#EC4899' },
  ];

  return (
    <div style={{ padding:'2rem 0' }}>
      <div className="container">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2rem' }}>
          <div>
            <h1 style={{ fontSize:'2rem', fontWeight:700, marginBottom:'0.25rem' }}>Admin Dashboard</h1>
            <p style={{ color:'var(--text-muted)' }}>Platform overview and analytics</p>
          </div>
          <div style={{ display:'flex', gap:'0.75rem' }}>
            <Link to="/admin/users"   className="btn btn-outline btn-sm">Manage Users</Link>
            <Link to="/admin/courses" className="btn btn-primary btn-sm">Review Courses</Link>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'1rem', marginBottom:'2rem' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'1.25rem', display:'flex', alignItems:'center', gap:'1rem' }}>
              <div style={{ width:48, height:48, background:`${s.color}18`, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', color:s.color, fontSize:'1.2rem', flexShrink:0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{s.label}</div>
                <div style={{ fontSize:'1.75rem', fontWeight:800, fontFamily:'Space Grotesk' }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'1.5rem', marginBottom:'1.5rem' }}>
          {/* Revenue chart */}
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'1.5rem' }}>
            <h3 style={{ marginBottom:'1.25rem', fontWeight:600 }}>Monthly Revenue (Last 12 Months)</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="adminRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#6C63FF" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={v => `₹${v}`} />
                <Tooltip contentStyle={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8 }} formatter={v => [`₹${v}`,'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#6C63FF" strokeWidth={2.5} fill="url(#adminRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category pie */}
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'1.5rem' }}>
            <h3 style={{ marginBottom:'1.25rem', fontWeight:600 }}>Courses by Category</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  dataKey="value" nameKey="name" paddingAngle={3}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent activity */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
          {/* Recent payments */}
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
            <div style={{ padding:'1.25rem 1.5rem', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h3 style={{ fontWeight:600 }}>Recent Payments</h3>
              <span className="badge badge-success">{recentPayments?.length || 0} transactions</span>
            </div>
            <div style={{ maxHeight:300, overflowY:'auto' }} className="custom-scroll">
              {recentPayments?.map(p => (
                <div key={p._id} style={{ display:'flex', alignItems:'center', gap:'0.875rem', padding:'0.875rem 1.25rem', borderBottom:'1px solid var(--border)' }}>
                  <img src={p.user?.avatar?.url} alt="" style={{ width:36, height:36, borderRadius:'50%', objectFit:'cover', flexShrink:0 }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:500, fontSize:'0.875rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.user?.name}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.course?.title}</div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontWeight:700, color:'var(--secondary)', fontSize:'0.875rem' }}>₹{p.amount}</div>
                    <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{new Date(p.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent users */}
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
            <div style={{ padding:'1.25rem 1.5rem', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h3 style={{ fontWeight:600 }}>Recent Users</h3>
              <Link to="/admin/users" style={{ fontSize:'0.8rem', color:'var(--primary)' }}>View all →</Link>
            </div>
            <div style={{ maxHeight:300, overflowY:'auto' }} className="custom-scroll">
              {recentUsers?.map(u => (
                <div key={u._id} style={{ display:'flex', alignItems:'center', gap:'0.875rem', padding:'0.875rem 1.25rem', borderBottom:'1px solid var(--border)' }}>
                  <img src={u.avatar?.url} alt="" style={{ width:36, height:36, borderRadius:'50%', objectFit:'cover', flexShrink:0 }} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:500, fontSize:'0.875rem' }}>{u.name}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{u.email}</div>
                  </div>
                  <span className={`badge ${u.role === 'admin' ? 'badge-danger' : u.role === 'instructor' ? 'badge-warning' : 'badge-primary'}`} style={{ fontSize:'0.7rem' }}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
