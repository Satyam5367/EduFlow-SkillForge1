import React, { useState, useEffect } from 'react';
import { paymentAPI } from '../../services/api.service';
import Loader from '../../components/common/Loader';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';
import { FiDollarSign, FiUsers, FiTrendingUp, FiCalendar } from 'react-icons/fi';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Revenue() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentAPI.getInstructorRevenue()
      .then(({ data: res }) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (!data)   return <div style={{ textAlign:'center', padding:'4rem' }}>Failed to load revenue data</div>;

  const chartData = data.monthlyRevenue?.map(m => ({
    month:       MONTH_NAMES[m._id.month - 1],
    revenue:     m.revenue,
    enrollments: m.count,
  })) || [];

  const stats = [
    { label:'Total Revenue',   value:`₹${data.totalRevenue?.toLocaleString() || 0}`, icon:<FiDollarSign />, color:'#10B981', bg:'rgba(16,185,129,0.1)' },
    { label:'Total Students',  value:data.totalStudents || 0,                          icon:<FiUsers />,      color:'#6C63FF', bg:'rgba(108,99,255,0.1)' },
    { label:'Total Courses',   value:data.courses?.length || 0,                        icon:<FiTrendingUp />, color:'#F59E0B', bg:'rgba(245,158,11,0.1)' },
    { label:'This Month',      value:`₹${chartData[chartData.length-1]?.revenue || 0}`, icon:<FiCalendar />, color:'#EF4444', bg:'rgba(239,68,68,0.1)' },
  ];

  return (
    <div style={{ padding:'2rem 0' }}>
      <div className="container">
        <h1 style={{ fontSize:'2rem', fontWeight:700, marginBottom:'0.375rem' }}>Revenue Analytics</h1>
        <p style={{ color:'var(--text-muted)', marginBottom:'2rem' }}>Track your earnings and student growth</p>

        {/* Stats */}
        <div className="grid-4" style={{ marginBottom:'2rem' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'1.5rem', display:'flex', alignItems:'center', gap:'1rem' }}>
              <div style={{ width:50, height:50, background:s.bg, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', color:s.color, fontSize:'1.3rem', flexShrink:0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:'0.25rem' }}>{s.label}</div>
                <div style={{ fontSize:'1.75rem', fontWeight:800, fontFamily:'Space Grotesk', color:s.color }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue chart */}
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'1.5rem', marginBottom:'1.5rem' }}>
          <h3 style={{ marginBottom:'1.25rem', fontWeight:600 }}>Revenue Over Time</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={v => `₹${v}`} />
              <Tooltip
                contentStyle={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8 }}
                formatter={v => [`₹${v}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2.5}
                fill="url(#revGradient)" dot={{ fill:'var(--primary)', r:4, strokeWidth:0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Enrollments chart */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', marginBottom:'1.5rem' }}>
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'1.5rem' }}>
            <h3 style={{ marginBottom:'1.25rem', fontWeight:600 }}>New Enrollments</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <Tooltip contentStyle={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8 }} />
                <Bar dataKey="enrollments" fill="var(--secondary)" radius={[4,4,0,0]} name="Enrollments" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Course performance */}
          <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:'1.5rem' }}>
            <h3 style={{ marginBottom:'1.25rem', fontWeight:600 }}>Course Performance</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              {data.courses?.slice(0,5).map(course => {
                const maxStudents = Math.max(...(data.courses.map(c => c.totalStudents || 0)), 1);
                const pct = Math.round(((course.totalStudents || 0) / maxStudents) * 100);
                return (
                  <div key={course._id}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', marginBottom:'0.25rem' }}>
                      <span style={{ maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{course.title}</span>
                      <span style={{ color:'var(--text-muted)' }}>{course.totalStudents || 0} students</span>
                    </div>
                    <div style={{ height:6, background:'var(--bg-elevated)', borderRadius:3, overflow:'hidden' }}>
                      <div style={{ width:`${pct}%`, height:'100%', background:'var(--primary)', borderRadius:3, transition:'width 0.5s' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent transactions */}
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, overflow:'hidden' }}>
          <div style={{ padding:'1.25rem 1.5rem', borderBottom:'1px solid var(--border)' }}>
            <h3 style={{ fontWeight:600 }}>Recent Transactions</h3>
          </div>
          {data.payments?.length === 0 ? (
            <div style={{ textAlign:'center', padding:'3rem', color:'var(--text-muted)' }}>No transactions yet</div>
          ) : (
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.875rem' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--border)' }}>
                  {['Student','Course','Amount','Date'].map(h => (
                    <th key={h} style={{ padding:'0.875rem 1.25rem', textAlign:'left', color:'var(--text-muted)', fontWeight:600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.payments?.map(payment => (
                  <tr key={payment._id} style={{ borderBottom:'1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding:'0.875rem 1.25rem' }}>
                      <div style={{ fontWeight:500 }}>{payment.user?.name}</div>
                      <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{payment.user?.email}</div>
                    </td>
                    <td style={{ padding:'0.875rem 1.25rem', color:'var(--text-muted)', maxWidth:200 }}>
                      <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'block' }}>
                        {payment.course?.title}
                      </span>
                    </td>
                    <td style={{ padding:'0.875rem 1.25rem', fontWeight:600, color:'var(--secondary)' }}>
                      ₹{payment.amount?.toLocaleString()}
                    </td>
                    <td style={{ padding:'0.875rem 1.25rem', color:'var(--text-muted)' }}>
                      {new Date(payment.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
