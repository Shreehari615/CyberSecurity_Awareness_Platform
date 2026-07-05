import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getInitials, formatDisplayName } from '../../utils/helpers';

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <button type="button" onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
      {isDark ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileOpen(false);
  };

  const navLinks = isAuthenticated
    ? isAdmin
      ? [
          { path: '/admin', label: 'Dashboard' },
          { path: '/history', label: 'Quiz History' },
          { path: '/leaderboard', label: 'Leaderboard' },
        ]
      : [
          { path: '/dashboard', label: 'Dashboard' },
          { path: '/quiz', label: 'Quiz' },
          { path: '/history', label: 'History' },
          { path: '/leaderboard', label: 'Leaderboard' },
        ]
    : [];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navLinkClass = (path) =>
    `nav-pill ${isActive(path) ? 'nav-pill-active' : ''}`;

  return (
    <nav className="glass sticky top-0 z-50 border-b border-cyber-border/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16 gap-4">
          <Link to={isAuthenticated ? (isAdmin ? '/admin' : '/dashboard') : '/'} className="flex items-center gap-2.5 shrink-0 z-10">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyber-blue to-cyber-purple flex items-center justify-center text-white font-bold text-xs">
              CA
            </div>
            <span className="text-base font-bold brand-gradient-text bg-gradient-to-r from-cyber-blue to-cyber-cyan bg-clip-text text-transparent hidden sm:block">
              CyberAware
            </span>
          </Link>

          {isAuthenticated && (
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="nav-pill-group">
                {navLinks.map((link) => (
                  <Link key={link.path} to={link.path} className={navLinkClass(link.path)}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 shrink-0 z-10">
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-all border border-transparent hover:border-cyber-border/30"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyber-blue to-cyber-purple flex items-center justify-center text-white text-xs font-bold">
                    {getInitials(user?.display_name || user?.full_name)}
                  </div>
                  <span className="hidden sm:block text-sm text-cyber-text-dim">{formatDisplayName(user?.display_name || user?.full_name)?.split(' ')[0]}</span>
                  <svg className={`w-4 h-4 text-cyber-text-dim transition-transform ${profileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 mt-2 w-52 glass-card p-1.5 z-50 animate-slide-down">
                      <div className="px-3 py-2.5 mb-1 border-b border-cyber-border/20">
                        <p className="text-sm font-medium text-cyber-text truncate">{user?.full_name}</p>
                        <p className="text-xs text-cyber-text-dim truncate">{user?.email}</p>
                      </div>
                      <Link to="/profile" onClick={() => setProfileOpen(false)} className="block px-3 py-2 text-sm text-cyber-text-dim hover:text-cyber-text hover:bg-white/5 rounded-md">
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm text-cyber-red hover:bg-cyber-red/10 rounded-md"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="px-3 py-1.5 text-sm font-medium text-cyber-text-dim hover:text-cyber-text transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary !text-sm !py-2 !px-4">
                  Get Started
                </Link>
              </div>
            )}

            {isAuthenticated && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-white/5"
              >
                <svg className="w-5 h-5 text-cyber-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>

        {mobileMenuOpen && isAuthenticated && (
          <div className="md:hidden py-3 border-t border-cyber-border/20 animate-slide-down">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium ${
                    isActive(link.path) ? 'nav-pill-active' : 'text-cyber-text-dim hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
