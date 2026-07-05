import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import PageLayout from '../components/layout/PageLayout';

export default function ReviewPage() {
  const { id } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/quiz/review/${id}/`).then(r => { setAttempt(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (!loading && !attempt) {
    return (
      <PageLayout title="Review" subtitle="Quiz not found">
        <div className="empty-state glass-card">
          <Link to="/history" className="btn-secondary text-sm">Back to History</Link>
        </div>
      </PageLayout>
    );
  }

  const answers = attempt?.answers || [];
  const filtered = filter === 'all' ? answers : answers.filter(a => filter === 'correct' ? a.is_correct : !a.is_correct);
  const correct = answers.filter(a => a.is_correct).length;
  const opt = (a, k) => ({ A: a.option_a, B: a.option_b, C: a.option_c, D: a.option_d }[k] || k);

  return (
    <PageLayout
      loading={loading}
      title="Answer Review"
      subtitle={attempt ? `${attempt.score}/${attempt.total_questions} correct (${Math.round(parseFloat(attempt.percentage))}%)` : ''}
      action={
        <Link to={`/results/${id}`} className="btn-secondary text-sm !py-2 !px-4">View Results</Link>
      }
    >
      {attempt && (
        <>
          <div className="flex flex-wrap gap-3 mb-6">
            {[
              { key: 'all', label: `All (${answers.length})` },
              { key: 'correct', label: `Correct (${correct})` },
              { key: 'incorrect', label: `Incorrect (${answers.length - correct})` },
            ].map((f) => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === f.key ? 'bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/30' : 'text-cyber-text-dim hover:bg-white/5 border border-transparent'
                }`}>
                {f.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="glass-card empty-state">
              <p>No answers match this filter.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6 max-w-4xl">
              {filtered.map((a, idx) => (
                <div key={a.id} className="glass-card review-card" style={{ borderLeft: `4px solid ${a.is_correct ? '#39ff14' : '#ff3366'}` }}>
                  <div className="flex items-start gap-4 mb-5">
                    <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      a.is_correct ? 'bg-cyber-neon/20 text-cyber-neon' : 'bg-cyber-red/20 text-cyber-red'
                    }`}>
                      {a.is_correct ? '✓' : '✗'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="text-xs text-cyber-text-dim font-medium">Question {idx + 1}</span>
                        <span className="badge badge-blue">{a.category}</span>
                      </div>
                      <p className="review-question text-cyber-text">{a.question_text}</p>
                    </div>
                  </div>

                  <div className="review-options ml-12">
                    {['A', 'B', 'C', 'D'].map((k) => {
                      const isSel = a.selected_answer === k;
                      const isCor = a.correct_answer === k;
                      return (
                        <div key={k} className={`review-option ${
                          isCor ? 'border-cyber-neon/40 bg-cyber-neon/8 text-cyber-neon'
                          : isSel ? 'border-cyber-red/40 bg-cyber-red/8 text-cyber-red'
                          : 'border-cyber-border/20 text-cyber-text-dim'
                        }`}>
                          <span className="font-bold mr-2">{k}.</span>
                          {opt(a, k)}
                          {isCor && <span className="ml-2 text-xs opacity-80">(Correct)</span>}
                          {isSel && !isCor && <span className="ml-2 text-xs opacity-80">(Your answer)</span>}
                        </div>
                      );
                    })}
                  </div>

                  {a.explanation && (
                    <div className="review-explanation ml-12 text-cyber-text-dim">
                      <span className="font-semibold text-cyber-blue block mb-1">Explanation</span>
                      {a.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
}
