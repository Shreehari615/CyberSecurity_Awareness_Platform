import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import PageLayout from '../components/layout/PageLayout';
import CenterModal from '../components/common/CenterModal';
import { getScoreColor } from '../utils/helpers';

export default function ResultsPage() {
  const { id } = useParams();
  const location = useLocation();
  const { refreshProfile, isAdmin } = useAuth();
  const [result, setResult] = useState(location.state?.resultData || null);
  const [loading, setLoading] = useState(!result);
  const [showCongrats, setShowCongrats] = useState(!!location.state?.resultData);

  useEffect(() => { refreshProfile(); }, [refreshProfile]);

  useEffect(() => {
    if (!result) {
      api.get(`/quiz/review/${id}/`).then((res) => {
        const d = res.data;
        setResult({
          attempt_id: d.id, score: d.score, total_questions: d.total_questions,
          percentage: parseFloat(d.percentage), phishing_score: d.phishing_score,
          phishing_total: d.phishing_total, malware_score: d.malware_score,
          malware_total: d.malware_total, time_taken: d.time_taken, new_badges: [],
          feedback: { summary: d.feedback },
        });
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [id, result]);

  if (!loading && !result) {
    return (
      <PageLayout title="Results" subtitle="Could not load quiz results">
        <div className="empty-state glass-card">
          <Link to={isAdmin ? '/history' : '/dashboard'} className="btn-primary text-sm">
            {isAdmin ? 'Back to History' : 'Back to Dashboard'}
          </Link>
        </div>
      </PageLayout>
    );
  }

  const sc = result ? getScoreColor(result.percentage) : '#94a3b8';
  const cats = result ? [
    { name: 'Phishing', score: result.phishing_score, total: result.phishing_total, color: '#00d4ff' },
    { name: 'Malware', score: result.malware_score, total: result.malware_total, color: '#7c3aed' },
  ] : [];

  const handleCert = async () => {
    const { default: html2canvas } = await import('html2canvas');
    const { default: jsPDF } = await import('jspdf');
    const el = document.getElementById('cert'); if (!el) return;
    el.style.display = 'block';
    const c = await html2canvas(el, { scale: 2, backgroundColor: '#0a0e1a' });
    el.style.display = 'none';
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    pdf.addImage(c.toDataURL('image/png'), 'PNG', 0, 0, 297, 210);
    pdf.save('CyberAware_Certificate.pdf');
  };

  const motivationMsg = result?.motivation_message || (result?.rank && result?.total_learners
    ? result.rank <= 20
      ? `You're in the Top 20! Keep it up!`
      : `You're ranked #${result.rank} of ${result.total_learners} learners. Keep practicing!`
    : null);

  return (
    <PageLayout
      loading={loading}
      title={result?.percentage >= 80 ? 'Congratulations!' : 'Quiz Results'}
      subtitle={isAdmin ? 'User attempt summary' : "Here's how you performed"}
    >
      {result && (
        <>
          {/* Gamification rank card */}
          {!isAdmin && (result.rank || result.xp_earned) && (
            <div className="glass-card p-5 mb-4 border-l-4 border-cyber-gold">
              <div className="flex flex-wrap items-center gap-6">
                {result.rank && (
                  <div className="text-center">
                    <p className="text-3xl">🏆</p>
                    <p className="text-lg font-bold text-cyber-gold">#{result.rank}</p>
                    <p className="text-xs text-cyber-text-dim">of {result.total_learners} learners</p>
                  </div>
                )}
                {result.xp_earned != null && (
                  <div>
                    <p className="text-sm text-cyber-text-dim">XP Earned</p>
                    <p className="text-xl font-bold text-cyber-purple">+{result.xp_earned} XP</p>
                    <p className="text-xs text-cyber-text-dim">Total: {result.total_xp} XP</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-cyber-text-dim">Accuracy</p>
                  <p className="text-xl font-bold" style={{ color: sc }}>{Math.round(result.percentage)}%</p>
                  <p className="text-xs text-cyber-text-dim">{result.score}/{result.total_questions} correct</p>
                </div>
                {result.improvement != null && (
                  <div>
                    <p className="text-sm text-cyber-text-dim">vs Last Quiz</p>
                    <p className={`text-xl font-bold ${result.improvement >= 0 ? 'text-cyber-neon' : 'text-cyber-red'}`}>
                      {result.improvement >= 0 ? '+' : ''}{result.improvement}%
                    </p>
                  </div>
                )}
              </div>
              {motivationMsg && <p className="text-sm text-cyber-text-dim mt-3">{motivationMsg}</p>}
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-4">
            <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
              <div className="w-28 h-28 mb-3 relative">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="7" />
                  <circle cx="50" cy="50" r="42" fill="none" stroke={sc} strokeWidth="7" strokeLinecap="round"
                    strokeDasharray={`${result.percentage * 2.64} 264`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold" style={{ color: sc }}>{Math.round(result.percentage)}%</span>
                </div>
              </div>
              <p className="text-base font-medium text-cyber-text">{result.score} of {result.total_questions} correct</p>
              <p className="text-sm text-cyber-text-dim mt-1">
                Time: {Math.floor(result.time_taken / 60)}m {result.time_taken % 60}s
              </p>
            </div>

            <div className="lg:col-span-2 glass-card p-5">
              <h2 className="section-title mb-4">Score by Category</h2>
              <div className="space-y-5">
                {cats.map((c) => {
                  const pct = c.total > 0 ? (c.score / c.total * 100) : 0;
                  return (
                    <div key={c.name}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: c.color }}>{c.name}</span>
                        <span className="text-sm text-cyber-text-dim">{c.score}/{c.total} ({Math.round(pct)}%)</span>
                      </div>
                      <div className="progress-bar">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: c.color, transition: 'width 1s' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              {result.new_badges?.length > 0 && (
                <div className="mt-5 pt-4 border-t border-cyber-border/20">
                  <p className="text-sm font-semibold text-cyber-gold mb-2">New Badges Earned</p>
                  <div className="flex flex-wrap gap-2">
                    {result.new_badges.map((b) => (
                      <span key={b.name} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyber-gold/10 border border-cyber-gold/20 text-xs text-cyber-gold">
                        {b.icon} {b.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-4 mt-4">
            <div className="lg:col-span-2 glass-card p-5 border-l-2 border-cyber-cyan">
              <h2 className="section-title mb-2">Feedback</h2>
              <p className="text-sm text-cyber-text-dim leading-relaxed">{result.feedback?.summary || result.feedback}</p>
            </div>
            <div className="flex flex-col gap-2 justify-center">
              <Link to={`/review/${result.attempt_id || id}`} className="btn-secondary text-sm justify-center !py-2.5">Review Answers</Link>
              {!isAdmin && result.percentage >= 80 && (
                <button onClick={handleCert} className="btn-primary text-sm !py-2.5">Download Certificate</button>
              )}
              {isAdmin ? (
                <Link to="/history" className="btn-primary text-sm justify-center !py-2.5">Back to History</Link>
              ) : (
                <Link to="/quiz" className="btn-primary text-sm justify-center !py-2.5">Take Another Quiz</Link>
              )}
            </div>
          </div>

          {/* Explore More section */}
          {!isAdmin && (
            <div className="glass-card p-6 mt-4 explore-section">
              <h2 className="section-title mb-1">Explore More</h2>
              <p className="text-sm text-cyber-text-dim mb-5">Resources based on your quiz results — all links open in a new tab.</p>
              {result.recommendations?.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-3 mb-5">
                  {result.recommendations.map((rec, i) => (
                    <a key={i} href={rec.url} target="_blank" rel="noopener noreferrer"
                      className="explore-card group">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{rec.type === 'video' ? '▶️' : '📄'}</span>
                        <span className="text-xs text-cyber-blue uppercase font-semibold tracking-wide">{rec.type}</span>
                      </div>
                      <p className="text-sm font-semibold text-cyber-text group-hover:text-cyber-blue transition-colors">{rec.title}</p>
                      <p className="text-xs text-cyber-text-dim mt-1">↗ Open resource</p>
                    </a>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-3">
                <a href="https://www.cisa.gov/topics/cybersecurity-best-practices" target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm !py-2 !px-4">📚 Learn More</a>
                <a href="https://www.cisa.gov/news-events/cybersecurity-advisories" target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm !py-2 !px-4">📰 Read Articles</a>
                <a href="https://www.youtube.com/results?search_query=cybersecurity+awareness+training" target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm !py-2 !px-4">▶️ Watch Videos</a>
                <Link to="/quiz" className="btn-primary text-sm !py-2 !px-4">🔄 Take Another Quiz</Link>
                <Link to="/dashboard" className="btn-secondary text-sm !py-2 !px-4">🏠 Dashboard</Link>
              </div>
            </div>
          )}

          <div id="cert" style={{ display: 'none', width: '1120px', height: '790px', padding: '60px', background: 'linear-gradient(135deg,#0a0e1a,#0f172a)', color: '#e2e8f0', fontFamily: 'Inter,sans-serif' }}>
            <div style={{ border: '2px solid rgba(0,212,255,0.3)', borderRadius: '20px', padding: '50px', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', color: '#00d4ff', fontWeight: '700', letterSpacing: '4px' }}>CYBERAWARE</div>
              <div style={{ fontSize: '40px', fontWeight: '800', margin: '12px 0' }}>Certificate of Achievement</div>
              <div style={{ fontSize: '48px', fontWeight: '800', color: '#39ff14', marginTop: '20px' }}>{Math.round(result.percentage)}%</div>
              <div style={{ fontSize: '14px', color: '#64748b', marginTop: '20px' }}>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
          </div>

          <CenterModal
            open={showCongrats && !isAdmin}
            type="success"
            title="Quiz Submitted Successfully!"
            message={`You scored ${Math.round(result.percentage)}%. ${result.xp_earned ? `+${result.xp_earned} XP earned!` : ''}`}
            onClose={() => setShowCongrats(false)}
          />
        </>
      )}
    </PageLayout>
  );
}
