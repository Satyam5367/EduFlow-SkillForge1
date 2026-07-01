import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { courseAPI, paymentAPI } from '../../services/api.service';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';
import {
  FiStar, FiUsers, FiClock, FiBook, FiCheck, FiPlay,
  FiLock, FiChevronDown, FiChevronUp,
  FiAward, FiGlobe,
} from 'react-icons/fi';

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function initRazorpay(orderData, onSuccess) {
  const options = {
    key:          orderData.key,
    amount:       orderData.amount,
    currency:     orderData.currency,
    name:         'EduFlow',
    description:  orderData.courseName,
    order_id:     orderData.orderId,
    prefill:      { name: orderData.userName, email: orderData.userEmail },
    theme:        { color: '#6C63FF' },
    handler:      (response) => onSuccess(response),
  };
  const rzp = new window.Razorpay(options);
  rzp.open();
}

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isEnrolled } = useAuth();

  const [course, setCourse]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [expanded, setExpanded]   = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const [coupon, setCoupon]       = useState('');
  const [isEnrolledState, setIsEnrolledState] = useState(false);

  useEffect(() => {
    courseAPI.getOne(id)
      .then(({ data }) => {
        setCourse(data.data);
        setIsEnrolledState(data.isEnrolled);
      })
      .catch(() => toast.error('Course not found'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (course && isAuthenticated) setIsEnrolledState(isEnrolled(course._id));
  }, [course, isAuthenticated, isEnrolled]);

  const handleFreeEnroll = async () => {
    if (!isAuthenticated) return navigate('/login');
    setEnrolling(true);
    try {
      await courseAPI.enroll(course._id);
      setIsEnrolledState(true);
      toast.success('Enrolled successfully! 🎉');
    } catch (err) {
      toast.error(err.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const handlePaidEnroll = async () => {
    if (!isAuthenticated) return navigate('/login');
    setEnrolling(true);
    try {
      const { data } = await paymentAPI.createOrder({ courseId: course._id, couponCode: coupon });
      initRazorpay(data.data, async (response) => {
        try {
          await paymentAPI.verifyPayment({
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
            courseId: course._id,
          });
          setIsEnrolledState(true);
          toast.success('Payment successful! You are now enrolled 🎉');
        } catch {
          toast.error('Payment verification failed');
        }
      });
    } catch (err) {
      toast.error(err.message || 'Payment initiation failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <Loader fullscreen />;
  if (!course) return <div style={{ textAlign: 'center', padding: '4rem' }}>Course not found</div>;

  const effectivePrice = course.isFree ? 0 :
    (course.discountPrice && new Date(course.discountExpiry) > new Date())
      ? course.discountPrice : course.price;
  const discount = course.price > 0 ? Math.round(((course.price - effectivePrice) / course.price) * 100) : 0;

  return (
    <div>
      {/* Hero banner */}
      <div style={{ background: 'linear-gradient(135deg, #0F0E17 0%, #1A1929 100%)', borderBottom: '1px solid var(--border)', padding: '3rem 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '3rem', alignItems: 'start' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <span className="badge badge-primary">{course.category}</span>
              <span className="badge badge-warning">{course.level}</span>
              {course.isFree && <span className="badge badge-success">FREE</span>}
            </div>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>{course.title}</h1>
            <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: 1.6 }}>{course.subtitle}</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <FiStar color="var(--accent)" fill="var(--accent)" />
                <strong style={{ color: 'var(--text)' }}>{course.avgRating?.toFixed(1)}</strong>
                <span>({course.totalRatings?.toLocaleString()} ratings)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <FiUsers /> <span>{course.totalStudents?.toLocaleString()} students</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <FiGlobe /> <span>{course.language}</span>
              </div>
            </div>

            {course.instructor && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1.25rem' }}>
                <img src={course.instructor.avatar?.url} alt={course.instructor.name}
                  style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Created by</div>
                  <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{course.instructor.name}</div>
                </div>
              </div>
            )}
          </div>

          {/* Sticky purchase card */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', position: 'sticky', top: '90px' }}>
            <div style={{ position: 'relative', paddingTop: '56.25%' }}>
              <img src={course.thumbnail?.url} alt={course.title}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              {course.previewVideo?.url && (
                <button style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 56, height: 56, background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiPlay color="white" size={22} />
                  </div>
                </button>
              )}
            </div>

            <div style={{ padding: '1.5rem' }}>
              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                {course.isFree ? (
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)' }}>Free</span>
                ) : (
                  <>
                    <span style={{ fontSize: '2rem', fontWeight: 800 }}>₹{effectivePrice}</span>
                    {discount > 0 && (
                      <>
                        <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '1.1rem' }}>₹{course.price}</span>
                        <span className="badge badge-warning">{discount}% OFF</span>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Coupon */}
              {!course.isFree && !isEnrolledState && (
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                  <input className="input" style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
                    placeholder="Coupon code" value={coupon} onChange={e => setCoupon(e.target.value.toUpperCase())} />
                  <button className="btn btn-outline btn-sm" style={{ whiteSpace: 'nowrap' }}>Apply</button>
                </div>
              )}

              {/* CTA */}
              {isEnrolledState ? (
                <Link to={`/learn/${course._id}`} className="btn btn-success btn-lg" style={{ width: '100%', justifyContent: 'center' }}>
                  Continue Learning →
                </Link>
              ) : (
                <button
                  onClick={course.isFree ? handleFreeEnroll : handlePaidEnroll}
                  disabled={enrolling}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%', justifyContent: 'center', marginBottom: '0.75rem' }}
                >
                  {enrolling ? 'Processing...' : course.isFree ? 'Enroll for Free' : `Buy Now — ₹${effectivePrice}`}
                </button>
              )}

              <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                30-day money-back guarantee
              </p>

              {/* Course meta */}
              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                {[
                  { icon: <FiBook />,  label: `${course.totalLectures} lectures` },
                  { icon: <FiClock />, label: `${formatDuration(course.totalDuration || 0)} total` },
                  { icon: <FiAward />, label: 'Certificate of completion' },
                ].map((m, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                    {m.icon} <span>{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content tabs */}
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--border)', marginBottom: '2rem' }}>
          {['overview', 'curriculum', 'reviews'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.75rem 1.5rem', background: 'none', border: 'none',
                borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer', fontWeight: 600, textTransform: 'capitalize', fontSize: '0.95rem',
                marginBottom: '-1px',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview tab */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', maxWidth: 800 }}>
            {course.learningOutcomes?.length > 0 && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>What you'll learn</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.625rem' }}>
                  {course.learningOutcomes.map((o, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start', fontSize: '0.9rem' }}>
                      <FiCheck color="var(--secondary)" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                      <span>{o}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {course.requirements?.length > 0 && (
              <div>
                <h3 style={{ marginBottom: '0.75rem' }}>Requirements</h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {course.requirements.map((r, i) => (
                    <li key={i} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      <span style={{ color: 'var(--primary)' }}>•</span> {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h3 style={{ marginBottom: '0.75rem' }}>Description</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '0.95rem' }}>{course.description}</p>
            </div>
          </div>
        )}

        {/* Curriculum tab */}
        {activeTab === 'curriculum' && (
          <div style={{ maxWidth: 800 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <span>{course.sections?.length} sections • {course.totalLectures} lectures • {formatDuration(course.totalDuration || 0)} total</span>
            </div>
            {course.sections?.map((section, si) => (
              <div key={section._id} style={{ border: '1px solid var(--border)', borderRadius: 10, marginBottom: '0.75rem', overflow: 'hidden' }}>
                <button
                  onClick={() => setExpanded(prev => ({ ...prev, [section._id]: !prev[section._id] }))}
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', background: 'var(--bg-elevated)', border: 'none', cursor: 'pointer', color: 'var(--text)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600 }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Section {si + 1}</span>
                    {section.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>{section.lectures?.length} lectures</span>
                    {expanded[section._id] ? <FiChevronUp /> : <FiChevronDown />}
                  </div>
                </button>

                {expanded[section._id] && (
                  <div>
                    {section.lectures?.map((lecture, li) => (
                      <div key={lecture._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1.25rem', borderTop: '1px solid var(--border)', fontSize: '0.875rem' }}>
                        <span style={{ color: lecture.isPreview ? 'var(--primary)' : 'var(--text-muted)' }}>
                          {isEnrolledState || lecture.isPreview ? <FiPlay size={14} /> : <FiLock size={14} />}
                        </span>
                        <span style={{ flex: 1 }}>{lecture.title}</span>
                        {lecture.isPreview && (
                          <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>Preview</span>
                        )}
                        {lecture.video?.duration > 0 && (
                          <span style={{ color: 'var(--text-muted)' }}>{formatDuration(lecture.video.duration)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Reviews tab */}
        {activeTab === 'reviews' && (
          <div style={{ maxWidth: 800 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>{course.avgRating?.toFixed(1)}</div>
                <div className="stars" style={{ justifyContent: 'center', margin: '0.375rem 0' }}>
                  {[1,2,3,4,5].map(s => <FiStar key={s} fill={s <= Math.round(course.avgRating) ? 'var(--accent)' : 'none'} color="var(--accent)" />)}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Course Rating</div>
              </div>
              <div style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {course.totalRatings?.toLocaleString()} ratings
              </div>
            </div>

            {course.reviews?.slice(0, 6).map(review => (
              <div key={review._id} style={{ display: 'flex', gap: '1rem', padding: '1.25rem 0', borderBottom: '1px solid var(--border)' }}>
                <img src={review.user?.avatar?.url} alt={review.user?.name}
                  style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.375rem' }}>
                    <strong style={{ fontSize: '0.9rem' }}>{review.user?.name}</strong>
                    <div className="stars">
                      {[1,2,3,4,5].map(s => <FiStar key={s} size={12} fill={s <= review.rating ? 'var(--accent)' : 'none'} color="var(--accent)" />)}
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>{review.comment}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
