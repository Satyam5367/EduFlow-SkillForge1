import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { courseAPI, quizAPI } from '../../services/api.service';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';
import {
  FiCheckCircle, FiCircle, FiChevronDown, FiChevronUp,
  FiZap, FiX, FiArrowLeft, FiMenu,
} from 'react-icons/fi';

export default function Learn() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const playerRef = useRef(null);

  const [course, setCourse]             = useState(null);
  const [progress, setProgress]         = useState(null);
  const [loading, setLoading]           = useState(true);
  const [activeLecture, setActiveLecture] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [expanded, setExpanded]         = useState({});
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [quiz, setQuiz]                 = useState(null);
  const [quizLoading, setQuizLoading]   = useState(false);
  const [quizAnswers, setQuizAnswers]   = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore]       = useState(0);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    courseAPI.getOne(courseId).then(({ data }) => {
      if (!data.isEnrolled) { navigate(`/courses/${courseId}`); return; }
      setCourse(data.data);
      setProgress(data.progress);
      // Auto-open first section and set first lecture
      if (data.data.sections?.[0]) {
        const firstSection = data.data.sections[0];
        setExpanded({ [firstSection._id]: true });
        // Resume last watched or start from first lecture
        if (data.progress?.lastWatched?.lecture) {
          for (const section of data.data.sections) {
            const lec = section.lectures.find(l => l._id === data.progress.lastWatched.lecture);
            if (lec) { setActiveLecture(lec); setActiveSection(section); break; }
          }
        } else if (firstSection.lectures?.[0]) {
          setActiveLecture(firstSection.lectures[0]);
          setActiveSection(firstSection);
        }
      }
    }).catch(() => navigate('/')).finally(() => setLoading(false));
  }, [courseId, isAuthenticated, navigate]);

  const isCompleted = (lectureId) =>
    progress?.completedLectures?.some(l => l.lecture === lectureId || l.lecture?._id === lectureId);

  const handleVideoEnd = async () => {
    if (!activeLecture || !activeSection) return;
    try {
      const { data } = await courseAPI.updateProgress(courseId, activeSection._id, activeLecture._id, {
        completed: true, watchTime: activeLecture.video?.duration || 0,
      });
      setProgress(data.data);
      toast.success('Lecture completed! ✅');
    } catch {}
  };

  const handleLectureSelect = async (section, lecture) => {
    setActiveLecture(lecture);
    setActiveSection(section);
    setQuiz(null);
    setQuizAnswers({});
    setQuizSubmitted(false);
    // Update last watched
    try {
      await courseAPI.updateProgress(courseId, section._id, lecture._id, { completed: false });
    } catch {}
  };

  const generateQuiz = async () => {
    if (!activeLecture) return;
    setQuizLoading(true);
    setQuiz(null);
    setQuizAnswers({});
    setQuizSubmitted(false);
    try {
      const { data } = await quizAPI.generate({
        courseId,
        lectureTitle:       activeLecture.title,
        lectureDescription: activeLecture.description,
        numQuestions: 5,
      });
      setQuiz(data.data);
    } catch {
      toast.error('Failed to generate quiz. Try again.');
    } finally {
      setQuizLoading(false);
    }
  };

  const submitQuiz = () => {
    if (!quiz) return;
    let correct = 0;
    quiz.questions.forEach(q => {
      if (quizAnswers[q.id] === q.correct) correct++;
    });
    const score = Math.round((correct / quiz.questions.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);
    toast[score >= 60 ? 'success' : 'info'](`Quiz score: ${score}% (${correct}/${quiz.questions.length})`);
  };

  if (loading) return <Loader fullscreen />;
  if (!course)  return null;

  const overallProgress = progress?.overallProgress || 0;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 70px)', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <div style={{
        width: sidebarOpen ? 360 : 0, minWidth: sidebarOpen ? 360 : 0,
        background: 'var(--bg-card)', borderRight: '1px solid var(--border)',
        overflow: 'hidden', transition: 'all 0.3s ease', flexShrink: 0,
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Sidebar header */}
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <button onClick={() => navigate('/my-courses')} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            <FiArrowLeft /> Back to My Courses
          </button>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.3, marginBottom: '0.75rem' }}>{course.title}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ flex: 1, height: 6, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${overallProgress}%`, height: '100%', background: 'var(--secondary)', borderRadius: 3, transition: 'width 0.5s' }} />
            </div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--secondary)', flexShrink: 0 }}>{overallProgress}%</span>
          </div>
        </div>

        {/* Sections list */}
        <div style={{ overflowY: 'auto', flex: 1 }} className="custom-scroll">
          {course.sections?.map((section, si) => (
            <div key={section._id}>
              <button
                onClick={() => setExpanded(prev => ({ ...prev, [section._id]: !prev[section._id] }))}
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1.25rem', background: 'var(--bg-elevated)', border: 'none', cursor: 'pointer', color: 'var(--text)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}
              >
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Section {si + 1}</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{section.title}</div>
                </div>
                {expanded[section._id] ? <FiChevronUp size={16} color="var(--text-muted)" /> : <FiChevronDown size={16} color="var(--text-muted)" />}
              </button>

              {expanded[section._id] && section.lectures?.map(lecture => {
                const completed = isCompleted(lecture._id);
                const active = activeLecture?._id === lecture._id;
                return (
                  <button key={lecture._id}
                    onClick={() => handleLectureSelect(section, lecture)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                      padding: '0.75rem 1.25rem', background: active ? 'rgba(108,99,255,0.15)' : 'none',
                      border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer',
                      color: 'var(--text)', textAlign: 'left',
                    }}
                  >
                    {completed
                      ? <FiCheckCircle color="var(--secondary)" size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                      : <FiCircle color={active ? 'var(--primary)' : 'var(--text-muted)'} size={16} style={{ flexShrink: 0, marginTop: 2 }} />}
                    <span style={{ fontSize: '0.825rem', lineHeight: 1.4, color: active ? 'var(--primary)' : 'var(--text)' }}>
                      {lecture.title}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Video player */}
        <div style={{ background: '#000', position: 'relative' }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
            position: 'absolute', top: '1rem', left: '1rem', zIndex: 10,
            background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: 8,
            width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'white', backdropFilter: 'blur(4px)',
          }}>
            <FiMenu />
          </button>

          {activeLecture?.video?.url ? (
            <ReactPlayer
              ref={playerRef}
              url={activeLecture.video.url}
              width="100%"
              height="auto"
              style={{ aspectRatio: '16/9', maxHeight: '60vh' }}
              controls
              onEnded={handleVideoEnd}
            />
          ) : (
            <div style={{ aspectRatio: '16/9', maxHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-elevated)' }}>
              <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎬</div>
                <p>Select a lecture to start learning</p>
              </div>
            </div>
          )}
        </div>

        {/* Lecture info */}
        {activeLecture && (
          <div style={{ padding: '1.5rem 2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.375rem' }}>{activeLecture.title}</h2>
                {activeLecture.description && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{activeLecture.description}</p>
                )}
              </div>
              <button
                onClick={generateQuiz}
                disabled={quizLoading}
                className="btn btn-primary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', whiteSpace: 'nowrap', marginLeft: '1rem', flexShrink: 0 }}
              >
                <FiZap size={14} />
                {quizLoading ? 'Generating...' : '⚡ AI Quiz'}
              </button>
            </div>

            {/* Quiz section */}
            {quiz && (
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.5rem', marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>⚡ AI-Generated Quiz</h3>
                  <button onClick={() => setQuiz(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <FiX />
                  </button>
                </div>

                {quiz.questions?.map((q, qi) => (
                  <div key={q.id} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 10 }}>
                    <p style={{ fontWeight: 600, marginBottom: '0.875rem', fontSize: '0.95rem' }}>
                      {qi + 1}. {q.question}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {q.options?.map((opt, oi) => {
                        let bg = 'var(--bg-card)';
                        let border = 'var(--border)';
                        if (quizSubmitted) {
                          if (oi === q.correct) { bg = 'rgba(16,185,129,0.2)'; border = 'var(--secondary)'; }
                          else if (oi === quizAnswers[q.id] && oi !== q.correct) { bg = 'rgba(239,68,68,0.2)'; border = 'var(--danger)'; }
                        } else if (quizAnswers[q.id] === oi) { bg = 'rgba(108,99,255,0.2)'; border = 'var(--primary)'; }

                        return (
                          <button key={oi}
                            onClick={() => !quizSubmitted && setQuizAnswers(prev => ({ ...prev, [q.id]: oi }))}
                            style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 8, padding: '0.625rem 1rem', cursor: quizSubmitted ? 'default' : 'pointer', color: 'var(--text)', textAlign: 'left', fontSize: '0.875rem', transition: 'all 0.15s' }}
                          >
                            <span style={{ fontWeight: 600, marginRight: '0.5rem' }}>{String.fromCharCode(65 + oi)}.</span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {quizSubmitted && q.explanation && (
                      <p style={{ marginTop: '0.75rem', fontSize: '0.825rem', color: 'var(--secondary)', background: 'rgba(16,185,129,0.1)', padding: '0.625rem', borderRadius: 6 }}>
                        💡 {q.explanation}
                      </p>
                    )}
                  </div>
                ))}

                {!quizSubmitted ? (
                  <button
                    onClick={submitQuiz}
                    disabled={Object.keys(quizAnswers).length < quiz.questions?.length}
                    className="btn btn-primary"
                  >
                    Submit Quiz ({Object.keys(quizAnswers).length}/{quiz.questions?.length} answered)
                  </button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: quizScore >= 60 ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${quizScore >= 60 ? 'var(--secondary)' : 'var(--accent)'}`, borderRadius: 10 }}>
                    <span style={{ fontSize: '2rem' }}>{quizScore >= 80 ? '🏆' : quizScore >= 60 ? '✅' : '📚'}</span>
                    <div>
                      <div style={{ fontWeight: 700 }}>Score: {quizScore}%</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {quizScore >= 80 ? 'Excellent! You mastered this topic.' : quizScore >= 60 ? 'Good job! Review the explanations above.' : 'Keep studying and try again!'}
                      </div>
                    </div>
                    <button onClick={() => { setQuiz(null); setQuizAnswers({}); setQuizSubmitted(false); generateQuiz(); }}
                      className="btn btn-outline btn-sm" style={{ marginLeft: 'auto' }}>
                      Retake
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
