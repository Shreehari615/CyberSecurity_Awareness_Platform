import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import AuthLayout from '../components/layout/AuthLayout';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [form, setForm] = useState({ new_password: '', confirm_password: '' });
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <AuthLayout title="Invalid Link" subtitle="This reset link is invalid or expired">
        <div className="empty-state !py-4">
          <Link to="/forgot-password" className="btn-primary text-sm !py-2 !px-5">Request New Link</Link>
        </div>
      </AuthLayout>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm_password) { toast.error('Passwords don\'t match'); return; }
    if (form.new_password.length < 8) { toast.error('Min. 8 characters'); return; }
    setLoading(true);
    try {
      await api.post('/reset-password/', { token, ...form });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reset failed');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout title="New Password" subtitle="Choose a strong password for your account">
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-field">
          <label htmlFor="rp-new" className="input-label">New Password</label>
          <input id="rp-new" type="password" className="input-field" placeholder="Min. 8 characters"
            value={form.new_password} onChange={(e) => setForm({ ...form, new_password: e.target.value })} />
        </div>
        <div className="auth-field">
          <label htmlFor="rp-confirm" className="input-label">Confirm Password</label>
          <input id="rp-confirm" type="password" className="input-field" placeholder="Re-enter password"
            value={form.confirm_password} onChange={(e) => setForm({ ...form, confirm_password: e.target.value })} />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full !py-2.5 text-sm">
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </AuthLayout>
  );
}
