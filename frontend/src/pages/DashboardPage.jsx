import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import PageLayout from '../components/layout/PageLayout';
import { formatDate, getScoreColor, getUserTypeLabel, formatDisplayName, getInitials, getGreeting } from '../utils/helpers';

export default function DashboardPage() {
  const { user, refreshProfile } = useAuth();
  const [history, setHistory] = useState([]);
  const [badges, setBadges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [tip, setTip] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await refreshProfile();
        const [h, b, l, t, n] = await Promise.all([
          api.get('/quiz/history/?page_size=5'),
          api.get('/badges/'),
          api.get('/leaderboard/'),
          api.get('/tips/'),
          api.get('/news/?limit=6'),
        ]);
        setHistory(h.data.results || h.data || []);
        setBadges(b.data.earned_badges || []);
        setLeaderboard((l.data.leaderboard || []).slice(0, 5));
        setTip(t.data.daily_tip);
        setNews(n.data.news || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(async () => {
      try {
        const n = await api.get('/news/?limit=6');
        setNews(n.data.news || []);
      } catch { /* ignore */ }
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshProfile]);

  const displayName = formatDisplayName(user?.display_name || user?.full_name);
  const stats = [
    { v: user?.total_attempts ?? 0, l: 'Attempts', c: '#00d4ff' },
    { v: `${Math.round(user?.best_score ?? 0)}%`, l: 'Best Score', c: '#39ff14' },
    { v: user?.xp_points ?? 0, l: 'XP Points', c: '#7c3aed' },
    { v: user?.daily_streak ?? 0, l: 'Day Streak', c: '#fbbf24' },
  ];

  return (
    <PageLayout
      loading={loading}
      title={
        <span className="flex items-center gap-3 flex-wrap">
          <span className="dashboard-avatar">{getInitials(displayName)}</span>
          <span>{getGreeting()}, {displayName || 'there'}</span>
        </span>
      }
      subtitle={`Level ${user?.achievement_level ?? 1} · ${getUserTypeLabel(user?.user_type)}${user?.rank ? ` · Rank #${user.rank}` : ''}`}
      action={<Link to="/quiz" className="btn-primary !py-2 !px-5 text-sm">Start Quiz</Link>}
    >
      <div className="grid lg:grid-cols-4 gap-5">
        {/* Live Cyber News Panel — left side */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <div className="glass-card news-panel">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Cyber News</h2>
              <span className="news-live-dot" title="Auto-refreshes">Live</span>
            </div>
            <div className="news-panel-scroll">
              {news.length === 0 ? (
                <p className="text-sm text-cyber-text-dim text-center py-4">Loading news...</p>
              ) : (
                news.map(item => (
                  <div key={item.id} className="news-card">
                    <span className="news-category">{item.category}</span>
                    <p className="news-title">{item.title}</p>
                    <p className="news-desc">{item.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-cyber-text-dim">{item.published_display}</span>
                      <a href={item.url} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-cyber-blue hover:text-cyber-cyan">Read More →</a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3 order-1 lg:order-2 space-y-5">
          <div className="stat-grid">
            {stats.map(s => (
              <div key={s.l} className="stat-card">
                <p className="stat-value" style={{ color: s.c }}>{s.v}</p>
                <p className="stat-label">{s.l}</p>
              </div>
            ))}
          </div>

          {user?.xp_points > 0 && (
            <div className="glass-card p-4">
              <div className="flex justify-between text-xs text-cyber-text-dim mb-2">
                <span>Level {user.achievement_level}</span>
                <span>{user.xp_points % 200}/200 XP to next level</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${(user.xp_points % 200) / 2}%` }} />
              </div>
            </div>
          )}

          {tip && (
            <div className="glass-card p-5 border-l-2 border-cyber-blue">
              <p className="text-sm font-semibold text-cyber-blue mb-2">Tip of the Day</p>
              <p className="text-sm text-cyber-text-dim leading-relaxed">{tip.content}</p>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 glass-card p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="section-title">Recent Quizzes</h2>
                <Link to="/history" className="text-xs text-cyber-blue">View all</Link>
              </div>
              {history.length === 0 ? (
                <div className="empty-state">
                  <p>No quizzes yet. Take your first quiz!</p>
                  <Link to="/quiz" className="btn-primary text-sm !py-2 !px-4">Take First Quiz</Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="cyber-table w-full">
                    <thead><tr><th>Date</th><th>Type</th><th>Score</th><th>Result</th><th></th></tr></thead>
                    <tbody>
                      {history.slice(0, 5).map(a => (
                        <tr key={a.id}>
                          <td className="text-sm py-3">{formatDate(a.created_at)}</td>
                          <td className="py-3"><span className="badge badge-blue">{a.quiz_type}Q</span></td>
                          <td className="text-sm py-3">{a.score}/{a.total_questions}</td>
                          <td className="py-3">
                            <span className="text-sm font-bold" style={{ color: getScoreColor(a.percentage) }}>
                              {Math.round(a.percentage)}%
                            </span>
                          </td>
                          <td className="py-3">
                            <Link to={`/review/${a.id}`} className="text-xs text-cyber-blue">Review</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="space-y-5">
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="section-title">Top Players</h2>
                  <Link to="/leaderboard" className="text-xs text-cyber-blue">View all</Link>
                </div>
                {leaderboard.length === 0 ? (
                  <p className="text-sm text-cyber-text-dim text-center py-4">No rankings yet</p>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.map((e, i) => (
                      <div key={i} className="flex items-center gap-3 py-1">
                        <span className="text-sm w-6 text-center">{i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</span>
                        <span className="text-sm text-cyber-text truncate flex-1">{e.user_name}</span>
                        <span className="text-sm font-semibold text-cyber-blue">{Math.round(e.percentage)}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="glass-card p-5">
                <h2 className="section-title mb-4">Your Badges</h2>
                {badges.length === 0 ? (
                  <p className="text-sm text-cyber-text-dim text-center py-4">Complete quizzes to earn badges</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {badges.map(ub => (
                      <span key={ub.badge.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyber-gold/10 border border-cyber-gold/20 text-xs text-cyber-gold">
                        {ub.badge.icon} {ub.badge.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
