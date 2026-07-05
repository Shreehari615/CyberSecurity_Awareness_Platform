import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import PageLayout from '../components/layout/PageLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import CenterModal from '../components/common/CenterModal';
import { QUIZ_TYPES } from '../utils/constants';
import { formatTime } from '../utils/helpers';

export default function QuizPage() {
  const [phase, setPhase] = useState('setup');
  const [quizType, setQuizType] = useState('20');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [justSelected, setJustSelected] = useState(null);
  const [confirmModal, setConfirmModal] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef(null);
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();

  const navCols = questions.length > 30 ? 10 : 5;

  // Timer countdown
  useEffect(() => {
    if (phase !== 'quiz' || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((p) => {
        if (p <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // Keyboard shortcuts: A/B/C/D to select, arrow keys to navigate
  useEffect(() => {
    if (phase !== 'quiz') return;
    const handleKey = (e) => {
      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key)) {
        e.preventDefault();
        const q = questions[currentIndex];
        if (q) selectAnswer(q.id, key);
      }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setCurrentIndex(i => Math.min(questions.length - 1, i + 1));
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setCurrentIndex(i => Math.max(0, i - 1));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase, currentIndex, questions]);

  const startQuiz = async () => {
    setPhase('loading');
    try {
      const res = await api.get(`/quiz/start/?type=${quizType}`);
      setQuestions(res.data.questions);
      setTimeLeft(res.data.timer_minutes * 60);
      setStartTime(Date.now());
      setAnswers({});
      setCurrentIndex(0);
      setPhase('quiz');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to start quiz. Please try again.');
      setPhase('setup');
    }
  };

  const selectAnswer = (qId, ans) => {
    setAnswers((p) => ({ ...p, [qId]: ans }));
    setJustSelected(ans);
    setTimeout(() => setJustSelected(null), 320);
  };

  const goToQuestion = (index) => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setTransitioning(false);
    }, 80);
  };

  const handleSubmit = useCallback(async (auto = false) => {
    if (phase === 'submitting') return;
    clearInterval(timerRef.current);
    setPhase('submitting');
    const timeTaken = Math.floor((Date.now() - (startTime || Date.now())) / 1000);
    const arr = questions.map((q) => ({ question_id: q.id, selected_answer: answers[q.id] || 'A' }));
    try {
      const res = await api.post('/quiz/submit/', { answers: arr, quiz_type: quizType, time_taken: timeTaken });
      await refreshProfile();
      toast.success(auto ? '⏰ Time up — quiz submitted!' : '✅ Quiz submitted!');
      navigate(`/results/${res.data.attempt_id}`, { state: { resultData: res.data } });
    } catch {
      toast.error('Submit failed. Please try again.');
      setPhase('quiz');
    }
  }, [phase, questions, answers, quizType, startTime, navigate, refreshProfile]);

  // ── SETUP SCREEN ──────────────────────────────────────────────────────────
  if (phase === 'setup') {
    return (
      <PageLayout title="Start a Quiz" subtitle="Choose your quiz length to begin" centered>
        <div className="quiz-setup-center w-full">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
            {QUIZ_TYPES.map((t) => (
              <button key={t.value} type="button" onClick={() => setQuizType(t.value)}
                className={`glass-card quiz-type-card p-7 text-center w-full transition-all duration-300 ${
                  quizType === t.value ? 'selected border-cyber-blue shadow-[0_0_30px_rgba(0,212,255,0.2)]' : ''
                }`}>
                <div className={`text-4xl mb-3 transition-transform duration-300 ${quizType === t.value ? 'scale-125' : ''}`}>
                  {t.icon}
                </div>
                <h3 className="text-lg font-bold text-cyber-text mb-1">{t.label}</h3>
                <p className="text-xs text-cyber-text-dim leading-relaxed mb-2">{t.description}</p>
                <p className="text-xs font-semibold text-cyber-blue">⏱ {t.time}</p>
                {quizType === t.value && (
                  <div className="mt-3 text-xs text-cyber-neon font-semibold">✓ Selected</div>
                )}
              </button>
            ))}
          </div>

          <div className="glass-card quiz-setup-card w-full">
            <div className="quiz-setup-info">
              <div className="flex flex-wrap gap-4 text-xs text-cyber-text-dim justify-center">
                <span>💡 Questions personalized from your survey</span>
                <span>⌨️ Use A/B/C/D keys to answer quickly</span>
                <span>⏰ Quiz auto-submits when time runs out</span>
              </div>
            </div>
            <div className="quiz-setup-button-wrap">
              <button type="button" onClick={startQuiz} className="btn-primary !py-3.5 !px-12 text-sm">
                Start {quizType}-Question Quiz →
              </button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // ── LOADING / SUBMITTING ──────────────────────────────────────────────────
  if (phase === 'loading' || phase === 'submitting') {
    return (
      <div className="page-container flex-1 flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" text={phase === 'loading' ? 'Preparing your personalized quiz...' : 'Submitting your answers...'} />
      </div>
    );
  }

  // ── QUIZ SCREEN ───────────────────────────────────────────────────────────
  const q = questions[currentIndex];
  const answered = Object.keys(answers).length;
  const progress = (answered / questions.length) * 100;
  const opts = [
    { k: 'A', t: q.option_a },
    { k: 'B', t: q.option_b },
    { k: 'C', t: q.option_c },
    { k: 'D', t: q.option_d },
  ];

  const unansweredCount = questions.length - answered;

  return (
    <div className="page-container flex-1 py-5 sm:py-7">
      <div className="quiz-centered">

        {/* ── Header bar ── */}
        <div className="glass-card p-4 mb-5">
          <div className="quiz-header-bar">
            <div className="flex items-center gap-4">
              <span className={`quiz-timer font-mono ${
                timeLeft <= 60 ? 'text-cyber-red animate-pulse' :
                timeLeft <= 180 ? 'text-cyber-gold' : 'text-cyber-blue'
              }`}>
                ⏱ {formatTime(timeLeft)}
              </span>
              <div className="text-sm">
                <span className="text-cyber-neon font-bold">{answered}</span>
                <span className="text-cyber-text-dim">/{questions.length} answered</span>
              </div>
            </div>
            <button
              onClick={() => unansweredCount > 0 ? setConfirmModal(true) : handleSubmit(false)}
              className="btn-primary !py-2.5 !px-6 text-sm"
            >
              Submit Quiz
            </button>
          </div>
          {/* Animated progress bar */}
          <div className="progress-bar mt-3">
            <div className="progress-bar-fill" style={{ width: `${progress}%`, transition: 'width 0.4s ease' }} />
          </div>
          <div className="flex justify-between text-xs text-cyber-text-dim mt-1.5">
            <span>Progress: {Math.round(progress)}%</span>
            {unansweredCount > 0
              ? <span className="text-cyber-gold">{unansweredCount} remaining</span>
              : <span className="text-cyber-neon font-semibold">✓ All answered!</span>
            }
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5 items-start">

          {/* ── Question card ── */}
          <div
            className="lg:col-span-2 glass-card quiz-question-card p-6 sm:p-8"
            style={{ opacity: transitioning ? 0 : 1, transition: 'opacity 0.08s ease' }}
          >
            <div className="quiz-question-meta">
              <span className="text-sm font-bold text-cyber-blue">
                Question {currentIndex + 1}
                <span className="text-cyber-text-dim font-normal"> of {questions.length}</span>
              </span>
              <span className="badge badge-blue capitalize">{q.category?.replace(/_/g, ' ')}</span>
              <span className="badge badge-purple capitalize">{q.difficulty}</span>
            </div>

            <p className="quiz-question-text">{q.question_text}</p>

            {/* Keyboard hint */}
            <p className="text-xs text-cyber-text-dim mb-3 opacity-60">
              Tip: Press{' '}
              {['A','B','C','D'].map(k => (
                <kbd key={k} className="mx-0.5 px-1.5 py-0.5 rounded border border-cyber-border text-cyber-text-dim text-xs">{k}</kbd>
              ))}{' '}to select · Arrow keys to navigate
            </p>

            <div className="quiz-options">
              {opts.map((o) => {
                const isSelected = answers[q.id] === o.k;
                const isJust = isSelected && justSelected === o.k;
                return (
                  <button
                    key={o.k}
                    type="button"
                    onClick={() => selectAnswer(q.id, o.k)}
                    className={`quiz-option ${isSelected ? 'selected' : ''} ${isJust ? 'just-selected' : ''}`}
                    aria-pressed={isSelected}
                  >
                    <span className="quiz-option-letter">{o.k}</span>
                    <span className="quiz-option-text">{o.t}</span>
                    <span className="quiz-option-check" aria-hidden="true">✓</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-7 pt-5 border-t border-cyber-border/20">
              <button
                type="button"
                onClick={() => goToQuestion(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="btn-secondary !py-2.5 !px-5 text-sm disabled:opacity-30"
              >
                ← Previous
              </button>
              <span className="text-xs text-cyber-text-dim">{currentIndex + 1} / {questions.length}</span>
              <button
                type="button"
                onClick={() => goToQuestion(Math.min(questions.length - 1, currentIndex + 1))}
                disabled={currentIndex === questions.length - 1}
                className="btn-primary !py-2.5 !px-5 text-sm disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          </div>

          {/* ── Question navigator ── */}
          <div className="glass-card p-5 lg:sticky lg:top-20 flex flex-col">
            <p className="section-title mb-3">Question Navigator</p>
            <div className="quiz-nav-legend mb-3">
              <span><span className="quiz-nav-dot bg-cyber-blue" /> Current</span>
              <span><span className="quiz-nav-dot bg-cyber-neon/40 border border-cyber-neon/30" /> Answered</span>
              <span><span className="quiz-nav-dot bg-cyber-slate/80" /> Unanswered</span>
            </div>
            <div className="quiz-nav-scroll">
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${navCols}, minmax(0, 1fr))` }}>
                {questions.map((qi, i) => (
                  <button
                    key={qi.id}
                    type="button"
                    onClick={() => goToQuestion(i)}
                    title={`Q${i + 1}${answers[qi.id] ? ` — ${answers[qi.id]}` : ' — unanswered'}`}
                    className={`h-9 rounded-lg text-xs font-bold flex items-center justify-center transition-all duration-200 ${
                      i === currentIndex
                        ? 'bg-cyber-blue text-white shadow-[0_0_12px_rgba(0,212,255,0.4)] scale-110'
                        : answers[qi.id]
                        ? 'bg-cyber-neon/15 text-cyber-neon border border-cyber-neon/25 hover:bg-cyber-neon/25'
                        : 'bg-cyber-slate/50 text-cyber-text-dim hover:bg-cyber-slate hover:text-cyber-text'
                    }`}
                  >
                    {answers[qi.id] && i !== currentIndex ? '✓' : i + 1}
                  </button>
                ))}
              </div>
            </div>
            {/* Mini stats */}
            <div className="mt-4 pt-4 border-t border-cyber-border/20 grid grid-cols-2 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-cyber-neon">{answered}</p>
                <p className="text-xs text-cyber-text-dim">Answered</p>
              </div>
              <div>
                <p className="text-lg font-bold text-cyber-gold">{unansweredCount}</p>
                <p className="text-xs text-cyber-text-dim">Remaining</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit confirmation when unanswered questions remain */}
      <CenterModal
        open={confirmModal}
        type="warning"
        title="Submit with unanswered questions?"
        message={`You have ${unansweredCount} unanswered question${unansweredCount !== 1 ? 's' : ''}. These will be marked incorrect. Are you sure you want to submit?`}
        actions={
          <div className="flex gap-3">
            <button type="button" onClick={() => setConfirmModal(false)} className="btn-secondary text-sm !py-2.5 !px-5">
              Continue Quiz
            </button>
            <button type="button" onClick={() => { setConfirmModal(false); handleSubmit(false); }} className="btn-primary text-sm !py-2.5 !px-5">
              Submit Anyway
            </button>
          </div>
        }
        onClose={() => setConfirmModal(false)}
      />
    </div>
  );
}
