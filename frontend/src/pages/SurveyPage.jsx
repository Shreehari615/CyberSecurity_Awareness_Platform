import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import PageLayout from '../components/layout/PageLayout';
import CenterModal from '../components/common/CenterModal';
import { getSurveyQuestions } from '../utils/constants';

/**
 * One-time cyber awareness survey shown before the first quiz.
 * Survey questions are randomly selected from a larger pool, so each user
 * sees different questions (one per backend field).
 */
export default function SurveyPage() {
  const { user, refreshProfile } = useAuth();
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const navigate = useNavigate();

  // Randomly select 5 survey questions once per component mount (stable across renders)
  const questionsRef = useRef(null);
  if (!questionsRef.current) {
    questionsRef.current = getSurveyQuestions();
  }
  const questions = questionsRef.current;

  // Redirect if survey is already completed
  useEffect(() => {
    if (user?.survey_completed) {
      navigate('/quiz', { replace: true });
    }
  }, [user, navigate]);

  const setAnswer = (key, value) => setAnswers(a => ({ ...a, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const missing = questions.find(q => !answers[q.key]);
    if (missing) {
      setModal({ type: 'warning', title: 'Incomplete Survey', message: 'Please answer all questions before continuing.' });
      return;
    }
    setLoading(true);
    try {
      await api.post('/survey/', answers);
      // Refresh profile so survey_completed becomes true in local state
      await refreshProfile();
      setModal({
        type: 'success',
        title: '🎉 Survey Complete!',
        message: 'Your answers will personalize your quiz questions. Redirecting to quiz...',
        onClose: () => navigate('/quiz', { replace: true }),
      });
      // Navigate after a short delay so user sees success message
      setTimeout(() => navigate('/quiz', { replace: true }), 1800);
    } catch (err) {
      setModal({ type: 'error', title: 'Error', message: err.response?.data?.error || 'Failed to submit survey. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout title="Cyber Awareness Survey" subtitle="Help us personalize your learning experience (one-time only)" centered>
      <form onSubmit={handleSubmit} className="glass-card profile-section-card w-full max-w-2xl mx-auto">
        <div className="space-y-8">
          {questions.map((q, idx) => (
            <div key={`${q.key}-${idx}`} className="survey-question">
              <p className="text-sm font-semibold text-cyber-text mb-3">
                {idx + 1}. {q.question}
              </p>
              <div className="flex flex-wrap gap-2">
                {q.options.map(opt => (
                  <button key={opt.value} type="button" onClick={() => setAnswer(q.key, opt.value)}
                    className={`survey-option ${answers[q.key] === opt.value ? 'selected' : ''}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full !py-3 text-sm mt-8">
          {loading ? 'Submitting...' : 'Submit & Start Learning →'}
        </button>
      </form>

      <CenterModal
        open={!!modal}
        type={modal?.type}
        title={modal?.title}
        message={modal?.message}
        onClose={() => {
          if (modal?.onClose) modal.onClose();
          setModal(null);
        }}
      />
    </PageLayout>
  );
}
