import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { courseAPI } from '../../services/api.service';
import CourseCard from '../../components/student/CourseCard';
import Loader from '../../components/common/Loader';
import { FiFilter, FiX, FiSearch } from 'react-icons/fi';

const CATEGORIES = [
  'Web Development', 'Mobile Development', 'Data Science', 'Machine Learning',
  'DevOps', 'Cybersecurity', 'Database', 'Cloud Computing',
  'UI/UX Design', 'Programming Languages', 'Game Development', 'Blockchain',
];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
const SORT_OPTIONS = [
  { value: '-createdAt',     label: 'Newest' },
  { value: '-totalStudents', label: 'Most Popular' },
  { value: '-avgRating',     label: 'Highest Rated' },
  { value: 'price',          label: 'Price: Low to High' },
  { value: '-price',         label: 'Price: High to Low' },
];

export default function Courses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [pages, setPages]     = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search:   searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    level:    '',
    sort:     '-createdAt',
    free:     false,
  });

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12, sort: filters.sort };
      if (filters.search)   params.search   = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.level)    params.level    = filters.level;
      if (filters.free)     params.free     = 'true';

      const { data } = await courseAPI.getAll(params);
      setCourses(data.data);
      setTotal(data.total);
      setPages(data.pages);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', level: '', sort: '-createdAt', free: false });
    setPage(1);
    setSearchParams({});
  };

  const hasFilters = filters.search || filters.category || filters.level || filters.free;

  return (
    <div style={{ padding: '2rem 0', minHeight: '100vh' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            {filters.category || 'All Courses'}
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>{total} courses found</p>
        </div>

        {/* Search + controls */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              className="input"
              placeholder="Search courses..."
              value={filters.search}
              onChange={e => updateFilter('search', e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          <select
            className="input"
            style={{ width: 'auto' }}
            value={filters.sort}
            onChange={e => updateFilter('sort', e.target.value)}
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button className="btn btn-outline" onClick={() => setShowFilters(!showFilters)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiFilter /> Filters {hasFilters && <span className="badge badge-primary" style={{ padding: '0.1rem 0.4rem' }}>•</span>}
          </button>
          {hasFilters && (
            <button className="btn btn-outline" onClick={clearFilters} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
              <FiX /> Clear
            </button>
          )}
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <label className="label">Category</label>
              <select className="input" value={filters.category} onChange={e => updateFilter('category', e.target.value)}>
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Level</label>
              <select className="input" value={filters.level} onChange={e => updateFilter('level', e.target.value)}>
                <option value="">All Levels</option>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '1.5rem' }}>
              <input
                type="checkbox"
                id="free"
                checked={filters.free}
                onChange={e => updateFilter('free', e.target.checked)}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
              <label htmlFor="free" style={{ cursor: 'pointer', fontWeight: 500 }}>Free Courses Only</label>
            </div>
          </div>
        )}

        {/* Active filter chips */}
        {hasFilters && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            {filters.category && (
              <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem' }}>
                {filters.category}
                <FiX style={{ cursor: 'pointer' }} onClick={() => updateFilter('category', '')} />
              </span>
            )}
            {filters.level && (
              <span className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem' }}>
                {filters.level}
                <FiX style={{ cursor: 'pointer' }} onClick={() => updateFilter('level', '')} />
              </span>
            )}
            {filters.free && (
              <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.75rem' }}>
                Free Only
                <FiX style={{ cursor: 'pointer' }} onClick={() => updateFilter('free', false)} />
              </span>
            )}
          </div>
        )}

        {/* Course grid */}
        {loading ? (
          <Loader />
        ) : courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ marginBottom: '0.5rem' }}>No courses found</h3>
            <p style={{ color: 'var(--text-muted)' }}>Try adjusting your filters or search term</p>
            <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={clearFilters}>Clear Filters</button>
          </div>
        ) : (
          <>
            <div className="grid-4">
              {courses.map(course => <CourseCard key={course._id} course={course} />)}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem' }}>
                {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={p === page ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
