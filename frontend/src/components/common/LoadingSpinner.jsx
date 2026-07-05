export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} relative`}>
        <div className="absolute inset-0 rounded-full border-2 border-cyber-slate" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyber-blue animate-spin" />
      </div>
      {text && <p className="text-sm text-cyber-text-dim animate-pulse">{text}</p>}
    </div>
  );
}
