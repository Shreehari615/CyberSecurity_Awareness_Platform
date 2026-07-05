export const USER_TYPES = [
  { value: 'student', label: 'Student', icon: '🎓', description: 'Currently enrolled in an educational institution' },
  { value: 'professional', label: 'Working Professional', icon: '💼', description: 'Working in any industry or organization' },
  { value: 'public', label: 'General Public', icon: '🌐', description: 'Anyone interested in cybersecurity awareness' },
];

export const QUIZ_TYPES = [
  { value: '20', label: '20 Questions', time: '30 minutes', icon: '⚡', description: 'Quick assessment' },
  { value: '30', label: '30 Questions', time: '40 minutes', icon: '🎯', description: 'Balanced challenge' },
  { value: '50', label: '50 Questions', time: '50 minutes', icon: '🔥', description: 'Comprehensive evaluation' },
];

/**
 * Full pool of survey questions. A random subset of 5 is selected per user
 * via getSurveyQuestions(). All questions must map to model fields on CyberSurvey.
 */
export const ALL_SURVEY_QUESTIONS = [
  // === cyber_attack_experienced ===
  {
    key: 'cyber_attack_experienced',
    question: 'Have you ever experienced a cyber attack (hacking, phishing, data breach)?',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }],
  },
  {
    key: 'cyber_attack_experienced',
    question: 'Has any of your online account ever been compromised or hacked?',
    options: [{ value: 'yes', label: 'Yes, it has' }, { value: 'no', label: 'No, never' }],
  },

  // === internet_always_on ===
  {
    key: 'internet_always_on',
    question: 'Do you keep your internet connection active all the time?',
    options: [{ value: 'always', label: 'Always on' }, { value: 'needed', label: 'Only when needed' }],
  },
  {
    key: 'internet_always_on',
    question: 'How do you typically use your internet connection?',
    options: [{ value: 'always', label: 'Keep it always on' }, { value: 'needed', label: 'Turn it off when not in use' }],
  },

  // === password_change_frequency ===
  {
    key: 'password_change_frequency',
    question: 'How often do you change your account passwords?',
    options: [
      { value: 'monthly', label: 'Monthly' },
      { value: '3months', label: 'Every 3 months' },
      { value: '6months', label: 'Every 6 months' },
      { value: 'never', label: 'Never' },
    ],
  },
  {
    key: 'password_change_frequency',
    question: 'When did you last change your most important account password?',
    options: [
      { value: 'monthly', label: 'Within last month' },
      { value: '3months', label: '1–3 months ago' },
      { value: '6months', label: '3–6 months ago' },
      { value: 'never', label: 'I rarely/never change it' },
    ],
  },

  // === uses_2fa ===
  {
    key: 'uses_2fa',
    question: 'Do you use Two-Factor Authentication (2FA) on your accounts?',
    options: [{ value: 'yes', label: 'Yes, I use 2FA' }, { value: 'no', label: 'No, I don\'t' }],
  },
  {
    key: 'uses_2fa',
    question: 'Do you have an extra verification step (like a code to your phone) when you log in?',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }],
  },

  // === clicked_suspicious ===
  {
    key: 'clicked_suspicious',
    question: 'Have you ever clicked on a suspicious link in an email or message?',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'not_sure', label: 'Not Sure' },
    ],
  },
  {
    key: 'clicked_suspicious',
    question: 'Have you received and opened links from unknown senders?',
    options: [
      { value: 'yes', label: 'Yes, I have' },
      { value: 'no', label: 'No, I avoid those' },
      { value: 'not_sure', label: 'I\'m not sure' },
    ],
  },
  {
    key: 'clicked_suspicious',
    question: 'Has a suspicious pop-up or message ever prompted you to click a link?',
    options: [
      { value: 'yes', label: 'Yes, and I clicked it' },
      { value: 'no', label: 'No, I close them' },
      { value: 'not_sure', label: 'I might have' },
    ],
  },
];

/**
 * Pick one question per model field key, randomly. Always returns exactly 5
 * questions — one for each of the 5 CyberSurvey fields.
 *
 * @returns {Array} 5 survey questions, randomized per session
 */
export function getSurveyQuestions() {
  const keys = [
    'cyber_attack_experienced',
    'internet_always_on',
    'password_change_frequency',
    'uses_2fa',
    'clicked_suspicious',
  ];

  return keys.map(key => {
    const pool = ALL_SURVEY_QUESTIONS.filter(q => q.key === key);
    // Pick a random question from the pool for this key
    return pool[Math.floor(Math.random() * pool.length)];
  });
}

// For backward compat — static set (used nowhere new)
export const SURVEY_QUESTIONS = [
  {
    key: 'cyber_attack_experienced',
    question: 'Have you ever experienced a cyber attack?',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }],
  },
  {
    key: 'internet_always_on',
    question: 'Do you keep your internet connection ON all the time?',
    options: [{ value: 'always', label: 'Always' }, { value: 'needed', label: 'Only when needed' }],
  },
  {
    key: 'password_change_frequency',
    question: 'How often do you change your password?',
    options: [
      { value: 'monthly', label: 'Monthly' },
      { value: '3months', label: 'Every 3 months' },
      { value: '6months', label: 'Every 6 months' },
      { value: 'never', label: 'Never' },
    ],
  },
  {
    key: 'uses_2fa',
    question: 'Do you use Two-Factor Authentication?',
    options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }],
  },
  {
    key: 'clicked_suspicious',
    question: 'Have you ever clicked on suspicious links?',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'not_sure', label: 'Not Sure' },
    ],
  },
];

export const DIFFICULTY_COLORS = {
  easy: { bg: 'rgba(57, 255, 20, 0.1)', text: '#39ff14', border: 'rgba(57, 255, 20, 0.2)' },
  medium: { bg: 'rgba(251, 191, 36, 0.1)', text: '#fbbf24', border: 'rgba(251, 191, 36, 0.2)' },
  hard: { bg: 'rgba(255, 51, 102, 0.1)', text: '#ff3366', border: 'rgba(255, 51, 102, 0.2)' },
};

export const CATEGORY_COLORS = {
  phishing: { bg: 'rgba(0, 212, 255, 0.1)', text: '#00d4ff', border: 'rgba(0, 212, 255, 0.2)' },
  malware: { bg: 'rgba(124, 58, 237, 0.1)', text: '#7c3aed', border: 'rgba(124, 58, 237, 0.2)' },
};

export const RANK_MEDALS = ['🥇', '🥈', '🥉'];

export const CYBER_TIPS = [
  { title: "Think Before You Click", content: "Always hover over links to verify the URL before clicking. Phishing links often look similar to legitimate ones but have subtle differences." },
  { title: "Use Strong Passwords", content: "Create passwords with at least 12 characters, mixing uppercase, lowercase, numbers, and symbols. Never reuse passwords across accounts." },
  { title: "Enable 2FA", content: "Two-factor authentication adds an extra layer of security. Even if your password is stolen, attackers can't access your account without the second factor." },
  { title: "Update Regularly", content: "Keep your operating system, browser, and applications updated. Security patches fix vulnerabilities that attackers exploit." },
  { title: "Verify Email Senders", content: "Check the full email address, not just the display name. Attackers often spoof display names to impersonate trusted contacts." },
  { title: "Secure Your Wi-Fi", content: "Use WPA3 encryption and a strong password for your Wi-Fi network. Avoid conducting sensitive transactions on public Wi-Fi." },
  { title: "Backup Your Data", content: "Follow the 3-2-1 rule: 3 copies of your data, on 2 different types of media, with 1 stored offsite." },
  { title: "Be Wary of USB Drives", content: "Never plug in unknown USB drives. Malware can auto-execute when a USB drive is connected to your computer." },
  { title: "Check for HTTPS", content: "Before entering personal information on a website, verify that the URL starts with 'https://' and shows a padlock icon." },
  { title: "Report Suspicious Activity", content: "If you receive a suspicious email or notice unusual account activity, report it immediately." },
  { title: "Use a Password Manager", content: "Password managers generate and store unique, strong passwords for each account." },
  { title: "Recognize Phishing Red Flags", content: "Watch for generic greetings, spelling errors, urgent deadlines, and requests for personal information." },
  { title: "Secure Your Mobile Device", content: "Use biometric locks, enable remote wipe, and only install apps from official stores." },
  { title: "Monitor Your Accounts", content: "Regularly check bank statements and credit reports for unauthorized transactions." },
  { title: "Beware of Social Engineering", content: "Attackers often manipulate emotions like fear, urgency, or curiosity. Think critically before responding." },
];
