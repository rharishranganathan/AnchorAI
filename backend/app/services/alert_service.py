import logging
import smtplib
from email.message import EmailMessage
import os
from typing import Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

def send_caregiver_alert(crisis_data: Dict[str, Any], user_info: str, caregiver_email: Optional[str] = None) -> str:
    """
    Format and log a CRITICAL ALERT for caregivers, and send a real email if an address is provided.
    """
    timestamp = datetime.utcnow().isoformat()
    risk_level = crisis_data.get("relapse_risk", {}).get("level", "UNKNOWN")
    suggested_message = crisis_data.get("family_notification", {}).get("suggested_message", "")
    reason = crisis_data.get("family_notification", {}).get("reason", "")
    
    alert_border = "=" * 60
    alert_string = f"""
{alert_border}
🚨 CRITICAL CAREGIVER ALERT 🚨
{alert_border}
Timestamp: {timestamp}
User ID: {user_info}
Risk Level: {risk_level}

REASON FOR ALERT:
{reason}

SUGGESTED MESSAGE TO CAREGIVER:
"{suggested_message}"

{alert_border}
"""
    
    # Visually prominent in console
    logger.warning(alert_string)
    
    # Use provided email, or fallback to GMAIL_USER for testing
    target_email = caregiver_email or os.environ.get("GMAIL_USER")
    
    # Send actual email if address provided for hackathon demo
    if target_email:
        try:
            gmail_user = os.environ.get("GMAIL_USER")
            gmail_pass = os.environ.get("GMAIL_APP_PASSWORD")
            
            if gmail_user and gmail_pass:
                msg = EmailMessage()
                msg.set_content(f"CRITICAL ALERT: Your loved one has triggered an SOS and is at {risk_level} risk.\n\nReason: {reason}\n\nSuggested action:\n{suggested_message}")
                msg['Subject'] = '🚨 URGENT: AnchorAI Caregiver Alert 🚨'
                msg['From'] = gmail_user
                msg['To'] = target_email

                server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
                server.login(gmail_user, gmail_pass)
                server.send_message(msg)
                server.quit()
                logger.info(f"Caregiver email successfully sent to {target_email}!")
            else:
                logger.warning("GMAIL_USER or GMAIL_APP_PASSWORD missing. Email not sent.")
        except Exception as e:
            logger.error(f"Failed to send caregiver email: {e}")
            
    return alert_string
