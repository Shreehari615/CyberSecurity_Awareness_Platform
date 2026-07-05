import { Link } from 'react-router-dom';

const features = [
  { icon: '🎯', title: 'Interactive Quizzes', desc: 'Test phishing and malware awareness' },
  { icon: '📊', title: 'Track Progress', desc: 'View scores and improvement over time' },
  { icon: '🏆', title: 'Earn Badges', desc: 'Compete on the leaderboard' },
  { icon: '🛡️', title: 'Learn & Review', desc: 'Detailed explanations after each quiz' },
];

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col bg-hero-gradient cyber-grid">
      <section className="flex-1 flex items-center page-container py-12 lg:py-16">
        <div className="relative z-10 w-full grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <p className="text-sm font-medium text-cyber-blue mb-3">Cybersecurity Training</p>
            <h1 className="text-3xl lg:text-4xl font-bold leading-tight mb-4 text-cyber-text">
              Learn to spot{' '}
              <span className="bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent">
                cyber threats
              </span>
            </h1>
            <p className="text-base text-cyber-text-dim max-w-md mb-8 leading-relaxed">
              Practice identifying phishing emails and malware through short, focused quizzes tailored to your role.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary !py-2.5 !px-6 text-sm">Get Started</Link>
              <Link to="/login" className="btn-secondary !py-2.5 !px-6 text-sm">Sign In</Link>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {features.map((f) => (
              <div key={f.title} className="glass-card p-4">
                <div className="text-2xl mb-2">{f.icon}</div>
                <p className="text-sm font-semibold text-cyber-text mb-1">{f.title}</p>
                <p className="text-xs text-cyber-text-dim leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
