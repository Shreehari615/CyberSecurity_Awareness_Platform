import { useState } from 'react';
import { getPasswordStrength, getPasswordStrengthLabel, PASSWORD_STRENGTH_COLORS } from '../../utils/helpers';

/** SVG eye icons — stable visibility, no native browser reveal conflict */
function EyeOpen() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeClosed() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858 3.03a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

/**
 * Password input with persistent eye toggle.
 * Hides native browser password reveal buttons to prevent double-icon flash.
 */
export default function PasswordField({
  label = 'Password',
  value,
  onChange,
  placeholder = 'Enter password',
  showStrength = false,
  onSuggest,
  id,
}) {
  const [visible, setVisible] = useState(false);
  const inputId = id || `pw-${label.replace(/\s/g, '-').toLowerCase()}`;

  return (
    <div className="auth-field">
      <div className="flex items-center justify-between gap-2">
        <label className="input-label" htmlFor={inputId}>{label}</label>
        {onSuggest && (
          <button type="button" onClick={onSuggest}
            className="text-xs text-cyber-blue hover:text-cyber-cyan font-medium">
            Suggest Strong Password
          </button>
        )}
      </div>
      <div className="password-field-wrap">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          className="input-field password-field-input"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete="new-password"
        />
        <button
          type="button"
          className="password-toggle-btn"
          onClick={() => setVisible(v => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {visible ? <EyeClosed /> : <EyeOpen />}
        </button>
      </div>
      {showStrength && value && (
        <PasswordStrengthMeter password={value} />
      )}
    </div>
  );
}

export function PasswordStrengthMeter({ password }) {
  const strength = getPasswordStrength(password);
  const label = getPasswordStrengthLabel(strength);
  const color = PASSWORD_STRENGTH_COLORS[strength];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="h-1.5 flex-1 rounded-full transition-all duration-300"
            style={{ backgroundColor: i < strength ? color : 'var(--color-cyber-slate)' }} />
        ))}
      </div>
      <p className="text-xs font-medium" style={{ color }}>{label}</p>
    </div>
  );
}
