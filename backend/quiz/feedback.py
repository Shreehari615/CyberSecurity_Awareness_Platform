"""
Smart Feedback Engine — Generates personalized feedback based on quiz performance.
"""


def generate_feedback(phishing_score, phishing_total, malware_score, malware_total):
    """
    Generate personalized feedback based on category-wise performance.

    Returns a dict with:
      - summary: main feedback message
      - recommendations: list of specific improvement tips
      - level: overall awareness level
    """
    # Calculate percentages
    phishing_pct = (phishing_score / phishing_total * 100) if phishing_total > 0 else 0
    malware_pct = (malware_score / malware_total * 100) if malware_total > 0 else 0
    overall_pct = 0
    total = phishing_total + malware_total
    if total > 0:
        overall_pct = ((phishing_score + malware_score) / total) * 100

    summary = ""
    recommendations = []
    level = "beginner"

    # Determine overall level
    if overall_pct >= 90:
        level = "expert"
    elif overall_pct >= 70:
        level = "advanced"
    elif overall_pct >= 50:
        level = "intermediate"
    else:
        level = "beginner"

    # Generate summary based on rules
    if phishing_pct >= 80 and malware_pct >= 80:
        summary = (
            "🛡️ Excellent cybersecurity awareness! You demonstrate strong knowledge "
            "in both phishing detection and malware prevention. Keep staying updated "
            "with the latest cyber threats."
        )
        recommendations = [
            "Stay updated with the latest cybersecurity news and threat reports.",
            "Consider mentoring others in cybersecurity best practices.",
            "Explore advanced topics like zero-day vulnerabilities and APTs.",
            "Practice with real-world phishing simulation exercises.",
        ]
    elif phishing_pct < 40 and malware_pct < 40:
        summary = (
            "⚠️ Your awareness level needs significant improvement in both phishing "
            "detection and malware prevention. We strongly recommend reviewing the "
            "learning materials and retaking the quiz."
        )
        recommendations = [
            "Learn to identify common phishing email indicators (suspicious sender, urgency, grammar errors).",
            "Understand different types of malware (virus, trojan, ransomware) and how they spread.",
            "Never click on links from unknown senders or download attachments from untrusted sources.",
            "Install and keep antivirus software updated on all your devices.",
            "Enable two-factor authentication (2FA) on all important accounts.",
            "Regularly review cybersecurity awareness resources and training materials.",
        ]
    elif phishing_pct > malware_pct:
        summary = (
            "✅ Strong phishing awareness! You can effectively identify phishing "
            "attempts. However, your malware prevention knowledge needs improvement. "
            "Focus on understanding different malware types and protection strategies."
        )
        recommendations = [
            "Study different types of malware: viruses, worms, trojans, spyware, and ransomware.",
            "Learn how malware spreads through downloads, USB drives, and email attachments.",
            "Keep your operating system and software up to date with security patches.",
            "Use reliable antivirus software and perform regular scans.",
            "Be cautious when downloading files from the internet — verify sources.",
        ]
    elif malware_pct > phishing_pct:
        summary = (
            "✅ Strong malware awareness! You understand malware threats well. "
            "However, your phishing detection skills need improvement. Focus on "
            "recognizing social engineering tactics and suspicious communications."
        )
        recommendations = [
            "Learn to verify sender email addresses — look for subtle misspellings.",
            "Be wary of emails creating urgency (e.g., 'Your account will be locked').",
            "Always hover over links before clicking to check the actual URL destination.",
            "Understand spear phishing, smishing (SMS), and vishing (voice) attack methods.",
            "When in doubt, contact the organization directly through official channels.",
        ]
    else:
        summary = (
            "📊 Your phishing and malware awareness are at similar levels. "
            "Continue building your knowledge in both areas to strengthen your "
            "overall cybersecurity posture."
        )
        recommendations = [
            "Review phishing indicators: suspicious URLs, unexpected attachments, urgency tactics.",
            "Study malware prevention: keep software updated, use antivirus, avoid untrusted downloads.",
            "Practice identifying social engineering attempts in daily communications.",
            "Enable multi-factor authentication on all your accounts.",
        ]

    # Add score-specific recommendations
    if phishing_pct < 60:
        recommendations.append(
            "📧 Phishing Focus: Practice identifying fake emails. Look for misspelled domains, "
            "generic greetings, and requests for sensitive information."
        )
    if malware_pct < 60:
        recommendations.append(
            "🦠 Malware Focus: Learn about common infection vectors. Avoid downloading software "
            "from unofficial sources and be cautious with USB drives."
        )

    return {
        'summary': summary,
        'recommendations': recommendations,
        'level': level,
        'phishing_percentage': round(phishing_pct, 2),
        'malware_percentage': round(malware_pct, 2),
        'overall_percentage': round(overall_pct, 2),
    }
