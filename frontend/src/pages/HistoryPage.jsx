import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import PageLayout from '../components/layout/PageLayout';
import { formatDate, getScoreColor } from '../utils/helpers';

export default function HistoryPage() {
  const { isAdmin } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    api.get(`/quiz/history/?page=${page}`).then(r => {
      setAttempts(r.data.results || r.data || []);
      if (r.data.count) setTotalPages(Math.ceil(r.data.count / 10));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [page]);

  return (
    <PageLayout
      loading={loading}
      title={isAdmin ? 'Quiz History' : 'My Quiz History'}
      subtitle={isAdmin ? 'All user quiz attempts across the platform' : 'Your past quiz attempts'}
    >
      {attempts.length === 0 ? (
        <div className="glass-card empty-state">
          <p>{isAdmin ? 'No quiz attempts recorded yet.' : 'No quizzes taken yet.'}</p>
          {!isAdmin && <Link to="/quiz" className="btn-primary text-sm">Take a Quiz</Link>}
        </div>
      ) : (
        <>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="cyber-table w-full">
                <thead>
                  <tr>
                    {isAdmin && <th>User</th>}
                    <th>Date</th>
                    <th>Type</th>
                    <th>Score</th>
                    <th>Result</th>
                    <th>Time</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((a) => (
                    <tr key={a.id}>
                      {isAdmin && <td className="text-sm font-medium">{a.user_name}</td>}
                      <td className="text-sm py-3">{formatDate(a.created_at)}</td>
                      <td className="py-3"><span className="badge badge-blue">{a.quiz_type}Q</span></td>
                      <td className="text-sm py-3">{a.score}/{a.total_questions}</td>
                      <td className="py-3">
                        <span className="text-sm font-bold" style={{ color: getScoreColor(parseFloat(a.percentage)) }}>
                          {Math.round(parseFloat(a.percentage))}%
                        </span>
                      </td>
                      <td className="text-sm text-cyber-text-dim py-3">
                        {Math.floor(a.time_taken / 60)}:{String(a.time_taken % 60).padStart(2, '0')}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-3">
                          <Link to={`/results/${a.id}`} className="text-link text-xs text-cyber-blue hover:text-cyber-cyan">Results</Link>
                          <Link to={`/review/${a.id}`} className="text-link text-xs text-cyber-purple hover:text-cyber-pink">Review</Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-4">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                className="btn-secondary !py-1.5 !px-4 text-sm disabled:opacity-30">Previous</button>
              <span className="text-sm text-cyber-text-dim">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}
                className="btn-secondary !py-1.5 !px-4 text-sm disabled:opacity-30">Next</button>
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
}
