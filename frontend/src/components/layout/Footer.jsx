export default function Footer() {
  return (
    <footer className="mt-auto border-t border-cyber-border/30 bg-cyber-darkest/80">
      <div className="page-container py-4 flex items-center justify-between gap-4">
        <span className="text-sm font-semibold text-cyber-text-dim">CyberAware</span>
        <p className="text-xs text-cyber-text-dim">© {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
