/**
 * Format a date string to a readable format.
 */
export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a date string with time.
 */
export function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format seconds to MM:SS.
 */
export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get a greeting based on the time of day.
 */
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

/**
 * Get initials from a full name.
 */
export function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

/**
 * Get the appropriate color for a percentage score.
 */
export function getScoreColor(percentage) {
  if (percentage >= 80) return '#39ff14';
  if (percentage >= 60) return '#fbbf24';
  if (percentage >= 40) return '#ff9f43';
  return '#ff3366';
}

/**
 * Get user type label.
 */
export function getUserTypeLabel(type) {
  const labels = {
    student: 'Student',
    professional: 'Professional',
    public: 'General Public',
    admin: 'Administrator',
  };
  return labels[type] || type;
}

/**
 * Calculate password strength (0-4).
 */
export function getPasswordStrength(password) {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  return Math.min(strength, 4);
}

export function getPasswordStrengthLabel(strength) {
  return PASSWORD_STRENGTH_LABELS[Math.min(strength, PASSWORD_STRENGTH_LABELS.length - 1)];
}

export const PASSWORD_STRENGTH_LABELS = ['Weak', 'Weak', 'Medium', 'Strong', 'Strong'];
export const PASSWORD_STRENGTH_COLORS = ['#ff3366', '#ff9f43', '#fbbf24', '#39ff14', '#00d4ff'];

/**
 * Format display name with proper capitalization.
 */
export function formatDisplayName(name) {
  if (!name) return '';
  return name.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}
