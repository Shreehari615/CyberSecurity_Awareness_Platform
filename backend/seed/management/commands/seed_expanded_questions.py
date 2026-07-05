"""
Generate 300+ cybersecurity quiz questions across all categories.
Run: python manage.py seed_expanded_questions
"""
from django.core.management.base import BaseCommand
from quiz.models import Question, QUESTION_CATEGORIES

USER_TYPES = ['student', 'professional', 'public']
DIFFICULTIES = ['easy', 'medium', 'hard']

# Question templates per category — each generates multiple variants
TEMPLATES = {
    'password_security': [
        ('Which of the following passwords is the strongest?', 'password123', 'John1990', 'P@$$w0rd', 'Tr4in!Bicycle#Moon9', 'D', 'Strong passwords use length, mixed case, numbers, and symbols.'),
        ('What is the recommended minimum password length?', '4 characters', '6 characters', '8 characters', '12+ characters', 'D', 'Security experts recommend at least 12 characters for strong passwords.'),
        ('Why should you avoid reusing passwords across sites?', 'It slows login', 'A breach on one site exposes all accounts', 'Sites require unique passwords', 'It uses more memory', 'B', 'Password reuse means one breach compromises multiple accounts.'),
        ('What is a password manager primarily used for?', 'Deleting passwords', 'Storing and generating unique passwords', 'Sharing passwords publicly', 'Bypassing login screens', 'B', 'Password managers securely store unique credentials for every account.'),
    ],
    'phishing': [
        ('What is a common sign of a phishing email?', 'Personalized greeting with your full name', 'Urgent action required with a suspicious link', 'Sent from a known colleague\'s exact address', 'No links or attachments', 'B', 'Phishing emails often create urgency and include malicious links.'),
        ('You receive an email claiming your account will be closed. What should you do?', 'Click the link immediately', 'Reply with your password', 'Verify by visiting the official website directly', 'Forward to all contacts', 'C', 'Always verify through official channels, never via email links.'),
        ('What does "spear phishing" target?', 'Random internet users', 'Specific individuals or organizations', 'Only government agencies', 'Automated systems', 'B', 'Spear phishing targets specific people with tailored messages.'),
        ('A URL shows "paypa1.com" instead of "paypal.com". This is called:', 'Encryption', 'Typosquatting/Homograph attack', 'Two-factor authentication', 'Firewall protection', 'B', 'Attackers use look-alike domains to trick users.'),
    ],
    'malware': [
        ('What is malware?', 'A type of hardware', 'Malicious software designed to harm systems', 'A security update', 'An antivirus program', 'B', 'Malware is any software intentionally designed to cause damage.'),
        ('Which is NOT a type of malware?', 'Virus', 'Trojan', 'Firewall', 'Ransomware', 'C', 'Firewalls are security tools, not malware.'),
        ('How does a trojan typically spread?', 'Self-replicating via network', 'Disguised as legitimate software', 'Through power surges', 'Via screen brightness', 'B', 'Trojans masquerade as legitimate programs to trick users into installing them.'),
        ('What should you do if you suspect malware on your device?', 'Ignore it', 'Run a trusted antivirus scan and disconnect from network', 'Click all pop-ups', 'Share the device with others', 'B', 'Isolate the device and scan with updated antivirus software.'),
    ],
    'ransomware': [
        ('What does ransomware do?', 'Speeds up your computer', 'Encrypts files and demands payment', 'Improves battery life', 'Updates your software', 'B', 'Ransomware encrypts data and demands a ransom for decryption keys.'),
        ('Should you pay the ransom if infected?', 'Always pay immediately', 'No — paying does not guarantee recovery and funds criminals', 'Only pay with cryptocurrency', 'Pay and report later', 'B', 'Paying encourages attackers and rarely guarantees file recovery.'),
        ('Best defense against ransomware?', 'Disable antivirus', 'Regular backups stored offline/separate from network', 'Open all email attachments', 'Use public Wi-Fi', 'B', 'Offline backups allow recovery without paying ransom.'),
        ('WannaCry ransomware exploited which Windows vulnerability?', 'EternalBlue (MS17-010)', 'Heartbleed', 'Shellshock', 'Meltdown', 'A', 'WannaCry used the EternalBlue exploit to spread rapidly in 2017.'),
    ],
    'multi_factor_authentication': [
        ('What is Multi-Factor Authentication (MFA)?', 'Using one strong password', 'Verifying identity with two or more independent factors', 'Logging in from multiple devices', 'Sharing credentials with IT', 'B', 'MFA requires multiple verification methods like password + phone code.'),
        ('Which is an example of a "something you have" factor?', 'Password', 'Fingerprint', 'Security token or phone', 'PIN number', 'C', 'Physical tokens and phones are "something you have" factors.'),
        ('MFA can block what percentage of automated attacks?', 'About 10%', 'About 50%', 'Up to 99.9%', 'None', 'C', 'Microsoft reports MFA blocks 99.9% of automated account compromise attacks.'),
        ('Is SMS-based 2FA better than no 2FA?', 'No, never use it', 'Yes, but app-based authenticators are more secure', 'SMS is the most secure method', '2FA is unnecessary', 'B', 'Any 2FA is better than none; authenticator apps are preferred over SMS.'),
    ],
    'public_wifi': [
        ('Is it safe to do online banking on public Wi-Fi?', 'Yes, always', 'No — use VPN or wait for a secure connection', 'Only on weekends', 'Yes if the website has a logo', 'B', 'Public Wi-Fi can be intercepted; use VPN or cellular data for sensitive tasks.'),
        ('What is an "evil twin" Wi-Fi attack?', 'A legitimate network upgrade', 'A fake hotspot mimicking a real network name', 'A router firmware update', 'A Bluetooth connection', 'B', 'Attackers create fake hotspots with names similar to legitimate ones.'),
        ('Before connecting to public Wi-Fi, you should:', 'Disable your firewall', 'Verify the network name with the venue', 'Share the password publicly', 'Turn off your screen lock', 'B', 'Confirm the exact network name with staff to avoid evil twin attacks.'),
        ('VPN on public Wi-Fi helps by:', 'Making Wi-Fi free', 'Encrypting your internet traffic', 'Increasing Wi-Fi speed', 'Sharing your location', 'B', 'VPNs encrypt traffic between your device and the VPN server.'),
    ],
    'cyber_laws': [
        ('Which section of the IT Act, 2000 penalizes hacking?', 'Section 43', 'Section 66', 'Section 72', 'Section 80', 'B', 'Section 66 covers computer-related offenses including hacking.'),
        ('Unauthorized access to a computer system in India is punishable under:', 'Copyright Act', 'IT Act, 2000', 'Consumer Protection Act', 'Companies Act', 'B', 'The IT Act, 2000 governs cybercrime in India.'),
        ('Section 66C of IT Act deals with:', 'Identity theft using electronic means', 'Software piracy only', 'Physical theft', 'Tax evasion', 'A', 'Section 66C specifically addresses identity theft via electronic communication.'),
        ('Reporting cybercrime in India can be done via:', 'cybercrime.gov.in portal', 'Social media only', 'No official channel exists', 'Only by visiting police in person', 'A', 'The National Cyber Crime Reporting Portal is cybercrime.gov.in.'),
    ],
    'upi_fraud': [
        ('When receiving a UPI payment request, you should:', 'Approve all requests immediately', 'Verify the sender before approving', 'Share your UPI PIN', 'Approve to get rewards', 'B', 'Only approve payment requests from verified, expected senders.'),
        ('A stranger asks you to scan a QR code to receive money. This is:', 'Safe — QR codes always send money to you', 'A scam — scanning may authorize a payment FROM you', 'Required by law', 'A bank verification process', 'B', 'Scanning a QR code can initiate a payment from your account.'),
        ('Your UPI PIN should be:', 'Shared with customer support', 'Written on your phone case', 'Never shared with anyone', 'Posted on social media for backup', 'C', 'UPI PIN is confidential and must never be shared.'),
        ('"Collect request" in UPI means:', 'Someone is sending you money', 'Someone is requesting money FROM you', 'Your account is being verified', 'A system update', 'B', 'Collect requests ask you to pay the requester — verify before approving.'),
    ],
}

# Generic fallback templates for categories without specific templates
GENERIC_TEMPLATES = [
    ('What is the best practice regarding {topic}?', 'Ignore all warnings', 'Follow established security guidelines', 'Disable all security features', 'Share credentials freely', 'B', 'Always follow established security best practices for {topic}.'),
    ('Which action increases risk related to {topic}?', 'Keeping software updated', 'Using default passwords', 'Enabling security features', 'Regular security training', 'B', 'Default passwords are a major security vulnerability.'),
    ('How often should you review your {topic} settings?', 'Never', 'Only when hacked', 'Regularly as part of security hygiene', 'Every 10 years', 'C', 'Regular review of security settings helps maintain protection.'),
    ('What should you do if you suspect a {topic} incident?', 'Ignore it', 'Report to appropriate authorities and IT security', 'Post about it publicly with details', 'Pay any demanded ransom immediately', 'B', 'Report security incidents to IT and relevant authorities promptly.'),
    ('Which tool helps protect against {topic} threats?', 'Antivirus/security software', 'Disabling updates', 'Using public computers for banking', 'Sharing passwords', 'A', 'Security software is essential for protection against cyber threats.'),
]


def _topic_label(category):
    return category.replace('_', ' ').title()


class Command(BaseCommand):
    help = 'Seed 300+ cybersecurity questions across all categories'

    def handle(self, *args, **options):
        existing = Question.objects.count()
        if existing >= 300:
            self.stdout.write(self.style.WARNING(f'Already have {existing} questions. Skipping.'))
            return

        created = 0
        categories = [c[0] for c in QUESTION_CATEGORIES]

        for cat in categories:
            templates = TEMPLATES.get(cat, [])
            topic = _topic_label(cat)

            # Use specific templates
            for tpl in templates:
                if Question.objects.filter(question_text=tpl[0]).exists():
                    continue
                for ut in USER_TYPES:
                    for diff in DIFFICULTIES:
                        Question.objects.create(
                            question_text=tpl[0],
                            option_a=tpl[1], option_b=tpl[2],
                            option_c=tpl[3], option_d=tpl[4],
                            correct_answer=tpl[5],
                            explanation=tpl[6],
                            category=cat,
                            difficulty=diff,
                            target_user_type=ut,
                        )
                        created += 1

            # Fill with generic templates to reach ~8 per category
            for i, gtpl in enumerate(GENERIC_TEMPLATES):
                q_text = gtpl[0].format(topic=topic)
                if Question.objects.filter(question_text=q_text, category=cat).exists():
                    continue
                for ut in USER_TYPES:
                    diff = DIFFICULTIES[i % len(DIFFICULTIES)]
                    Question.objects.create(
                        question_text=q_text,
                        option_a=gtpl[1], option_b=gtpl[2],
                        option_c=gtpl[3], option_d=gtpl[4],
                        correct_answer=gtpl[5],
                        explanation=gtpl[6].format(topic=topic),
                        category=cat,
                        difficulty=diff,
                        target_user_type=ut,
                    )
                    created += 1

        total = Question.objects.count()
        self.stdout.write(self.style.SUCCESS(f'Created {created} questions. Total in DB: {total}'))
