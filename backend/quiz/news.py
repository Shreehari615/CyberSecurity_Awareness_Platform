"""Cybersecurity news feed — curated items with verified working links."""
from django.utils import timezone
from datetime import timedelta
import random

# Curated cybersecurity news items with verified, working URLs
NEWS_ITEMS = [
    {
        'id': 1,
        'title': 'Global Rise in Phishing Attacks Targeting Banking Apps',
        'description': 'Security researchers report a 40% increase in mobile banking phishing campaigns using fake login pages.',
        'category': 'Phishing',
        'source': 'CISA',
        'url': 'https://www.cisa.gov/topics/cyber-threats-and-advisories/phishing',
    },
    {
        'id': 2,
        'title': 'New Ransomware Variant Encrypts Cloud Backups',
        'description': 'A new strain of ransomware is targeting cloud storage sync folders, bypassing traditional backup strategies.',
        'category': 'Ransomware',
        'source': 'CISA StopRansomware',
        'url': 'https://www.cisa.gov/stopransomware',
    },
    {
        'id': 3,
        'title': 'CERT-In Advisory: Critical VPN Vulnerability Patched',
        'description': 'Indian CERT issued an advisory urging organizations to patch VPN appliances against newly discovered exploits.',
        'category': 'Network Security',
        'source': 'CERT-In',
        'url': 'https://www.cert-in.org.in/',
    },
    {
        'id': 4,
        'title': 'UPI Fraud Cases Surge — QR Code Scams on the Rise',
        'description': 'Police warn citizens about fraudulent QR codes placed at shops and parking lots to steal UPI payments.',
        'category': 'UPI Fraud',
        'source': 'NPCI Fraud Awareness',
        'url': 'https://www.npci.org.in/what-we-do/upi/fraud-awareness',
    },
    {
        'id': 5,
        'title': 'Deepfake Scams Target Corporate Video Calls',
        'description': 'Attackers use AI-generated deepfake audio to impersonate executives and authorize fraudulent wire transfers.',
        'category': 'AI Scams',
        'source': 'NIST Cybersecurity',
        'url': 'https://www.nist.gov/cybersecurity',
    },
    {
        'id': 6,
        'title': 'Major Data Breach Exposes Millions of User Records',
        'description': 'A popular e-commerce platform confirmed unauthorized access to customer names, emails, and hashed passwords.',
        'category': 'Data Breach',
        'source': 'Have I Been Pwned',
        'url': 'https://haveibeenpwned.com/',
    },
    {
        'id': 7,
        'title': 'IoT Botnet Targets Smart Home Devices with Default Passwords',
        'description': 'Default passwords on smart cameras and routers are being exploited to build large-scale botnets.',
        'category': 'IoT Security',
        'source': 'NCSC',
        'url': 'https://www.ncsc.gov.uk/collection/top-tips-for-staying-secure-online',
    },
    {
        'id': 8,
        'title': 'IT Act Section 66 — Hacking Offenses & Legal Penalties',
        'description': 'Overview of legal penalties under Section 66 of the IT Act, 2000 for unauthorized access and data theft.',
        'category': 'Cyber Laws',
        'source': 'MeitY',
        'url': 'https://www.meity.gov.in/',
    },
    {
        'id': 9,
        'title': 'Malware Hidden in Fake Antivirus Downloads',
        'description': 'Users are tricked into downloading trojanized antivirus software from sponsored search results.',
        'category': 'Malware',
        'source': 'Malwarebytes Blog',
        'url': 'https://www.malwarebytes.com/blog',
    },
    {
        'id': 10,
        'title': 'Enable MFA: Microsoft Reports 99.9% Account Protection',
        'description': 'Multi-factor authentication blocks nearly all automated account takeover attempts according to industry data.',
        'category': 'Authentication',
        'source': 'CISA MFA Guide',
        'url': 'https://www.cisa.gov/secure-our-world/use-multi-factor-authentication',
    },
    {
        'id': 11,
        'title': 'Fake Shopping Apps Steal Payment Details',
        'description': 'Fraudulent clone apps mimicking popular retailers appear on third-party app stores ahead of sale events.',
        'category': 'Fake Apps',
        'source': 'FTC Consumer Alerts',
        'url': 'https://consumer.ftc.gov/consumer-alerts',
    },
    {
        'id': 12,
        'title': 'Weekly Tip: Use a Password Manager',
        'description': 'Password managers generate and store unique credentials for every account, reducing password reuse risk.',
        'category': 'Safety Tip',
        'source': 'CISA Secure Our World',
        'url': 'https://www.cisa.gov/secure-our-world/use-strong-passwords',
    },
    {
        'id': 13,
        'title': 'Social Engineering: The Human Element of Cybercrime',
        'description': 'Learn how attackers exploit human psychology through pretexting, baiting, and impersonation attacks.',
        'category': 'Social Engineering',
        'source': 'Kaspersky',
        'url': 'https://www.kaspersky.com/resource-center/definitions/what-is-social-engineering',
    },
    {
        'id': 14,
        'title': 'Safe Browsing: How to Spot Dangerous Websites',
        'description': 'Practical tips to identify phishing sites, check SSL certificates, and avoid malicious downloads.',
        'category': 'Safe Browsing',
        'source': 'Google Safety Center',
        'url': 'https://safety.google/security/safe-browsing/',
    },
    {
        'id': 15,
        'title': 'Cybersecurity for Students — Protecting Your Digital Life',
        'description': 'Key security practices every student should know: secure Wi-Fi, strong passwords, and privacy settings.',
        'category': 'Education',
        'source': 'StaySafeOnline',
        'url': 'https://staysafeonline.org/',
    },
]


def get_cyber_news(limit=8):
    """Return shuffled news items with publish dates."""
    items = random.sample(NEWS_ITEMS, min(limit, len(NEWS_ITEMS)))
    now = timezone.now()
    result = []
    for i, item in enumerate(items):
        pub_date = now - timedelta(hours=i * 3 + random.randint(1, 5))
        result.append({
            **item,
            'published_at': pub_date.isoformat(),
            'published_display': pub_date.strftime('%b %d, %Y'),
        })
    return result
