import { Link } from 'react-router-dom';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8 bg-hero-gradient">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 px-2">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyber-blue to-cyber-purple flex items-center justify-center text-white font-bold text-xs">
              CA
            </div>
            <span className="text-lg font-bold brand-gradient-text bg-gradient-to-r from-cyber-blue to-cyber-cyan bg-clip-text text-transparent">
              CyberAware
            </span>
          </Link>
          <h1 className="text-xl font-bold text-cyber-text">{title}</h1>
          {subtitle && <p className="text-sm text-cyber-text-dim mt-1.5">{subtitle}</p>}
        </div>

        <div className="glass-card auth-card">{children}</div>

        {footer && <div className="text-center mt-5 text-sm text-cyber-text-dim px-2">{footer}</div>}
      </div>
    </div>
  );
}
