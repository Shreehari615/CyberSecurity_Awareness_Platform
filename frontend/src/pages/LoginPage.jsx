import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/layout/AuthLayout';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Fill all fields'); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success('Welcome!');
      navigate(user?.user_type === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.non_field_errors?.[0] || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Access your training dashboard"
      footer={<>No account? <Link to="/register" className="text-link text-cyber-blue font-medium hover:text-cyber-cyan">Register</Link></>}
    >
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="auth-field">
          <label className="input-label">Email</label>
          <input type="email" className="input-field" placeholder="you@example.com"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="auth-field">
          <label className="input-label">Password</label>
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} className="input-field pr-14" placeholder="Enter password"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-cyber-text-dim hover:text-cyber-text">
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
        <div className="flex justify-end -mt-1">
          <Link to="/forgot-password" className="text-link text-xs text-cyber-blue hover:text-cyber-cyan">Forgot password?</Link>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full !py-2.5 text-sm">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </AuthLayout>
  );
}
