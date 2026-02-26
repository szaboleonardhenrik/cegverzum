import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.config import settings

logger = logging.getLogger(__name__)


def send_email(to: str, subject: str, body_html: str) -> bool:
    if not settings.smtp_enabled:
        logger.info("SMTP disabled, skipping email to %s: %s", to, subject)
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["From"] = settings.smtp_from
        msg["To"] = to
        msg["Subject"] = subject
        msg.attach(MIMEText(body_html, "html", "utf-8"))

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(settings.smtp_from, to, msg.as_string())
        logger.info("Email sent to %s: %s", to, subject)
        return True
    except Exception:
        logger.exception("Failed to send email to %s", to)
        return False


def notify_admins_new_registration(
    user_email: str, user_name: str | None, admin_emails: list[str]
) -> None:
    display_name = user_name or user_email
    subject = f"Új regisztráció: {display_name}"
    body = f"""\
<html><body style="font-family:sans-serif;color:#333">
<h2 style="color:#1E3A5F">Új felhasználó regisztrált</h2>
<table style="border-collapse:collapse">
  <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Név:</td><td>{display_name}</td></tr>
  <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Email:</td><td>{user_email}</td></tr>
</table>
<p style="margin-top:16px;color:#666;font-size:13px">
  Ezt az értesítést a Cégverzum rendszer küldte automatikusan.
</p>
</body></html>"""
    for email in admin_emails:
        send_email(email, subject, body)
