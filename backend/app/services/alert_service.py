import logging
from typing import Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)

def send_caregiver_alert(crisis_data: Dict[str, Any], user_info: str) -> str:
    """
    Format and log a CRITICAL ALERT for caregivers.
    
    This function generates a visually prominent console alert and returns the formatted string.
    Ready for SMTP/SMS integration in a production environment.
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
    
    # TODO: Add SMTP/Twilio integration here
    
    return alert_string
