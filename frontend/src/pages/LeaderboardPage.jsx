import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import PageLayout from '../components/layout/PageLayout';
import { getUserTypeLabel } from '../utils/helpers';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/leaderboard/').then(r => { setData(r.data.leaderboard || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const medals = ['🥇', '🥈', '🥉'];

  return (
    <PageLayout loading={loading} title="Leaderboard" subtitle="Top performers by best quiz score">
      {data.length === 0 ? (
        <div className="glass-card empty-state">
          <p>No rankings yet. Be the first to take a quiz!</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="cyber-table w-full">
              <thead>
                <tr><th>Rank</th><th>Player</th><th>Role</th><th>Score</th><th>Best %</th></tr>
              </thead>
              <tbody>
                {data.map((e) => {
                  const isMe = e.user_id === user?.id;
                  return (
                    <tr key={e.rank} className={isMe ? 'bg-cyber-blue/5' : ''}>
                      <td className="text-sm">{e.rank <= 3 ? medals[e.rank - 1] : e.rank}</td>
                      <td>
                        <span className={`text-sm font-medium ${isMe ? 'text-cyber-blue' : 'text-cyber-text'}`}>
                          {e.user_name}{isMe && <span className="text-cyber-cyan ml-1.5 text-xs">(You)</span>}
                        </span>
                      </td>
                      <td><span className="badge badge-purple">{getUserTypeLabel(e.user_type)}</span></td>
                      <td className="text-sm">{e.score}/{e.total_questions}</td>
                      <td className="text-sm font-bold text-cyber-cyan">{Math.round(e.percentage)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
