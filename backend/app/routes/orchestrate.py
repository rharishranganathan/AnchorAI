from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
import logging
from ..models.schemas import OrchestrateRequest, OrchestrateResponse
from ..services.gemini_service import orchestrate_crisis
from ..services.database_service import save_crisis_log, save_safety_plan, save_caregiver_alert
from ..services.alert_service import send_caregiver_alert

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/api/orchestrate", response_model=OrchestrateResponse)
async def orchestrate(request: OrchestrateRequest):
    """
    Process voice transcript, orchestrate response via Gemini,
    save to DB, and trigger caregiver alerts if necessary.
    """
    if not request.voice_transcript or not request.voice_transcript.strip():
        raise HTTPException(status_code=400, detail="Voice transcript cannot be empty.")
    
    if len(request.voice_transcript) > 5000:
        raise HTTPException(status_code=400, detail="Voice transcript exceeds maximum length of 5000 characters.")
        
    try:
        # Call Gemini AI
        gemini_response = await orchestrate_crisis(request.voice_transcript)
        
        crisis_log_id = None
        user_id = request.user_id or "anonymous"
        
        # Database operations
        try:
            crisis_log_id = await save_crisis_log(user_id, request.voice_transcript, gemini_response)
            
            await save_safety_plan(crisis_log_id, user_id, gemini_response["safety_plan"])
            
            if gemini_response["family_notification"]["notify_family"]:
                await save_caregiver_alert(crisis_log_id, user_id, gemini_response["family_notification"])
        except Exception as db_e:
            logger.warning(f"Database operation failed, continuing: {db_e}")
            
        # Trigger caregiver alert
        if gemini_response["family_notification"]["notify_family"]:
            send_caregiver_alert(gemini_response, user_id, request.caregiver_email)
            
        # Format response
        response_data = gemini_response.copy()
        response_data["crisis_log_id"] = crisis_log_id
        response_data["timestamp"] = datetime.now(timezone.utc).isoformat()
        
        return OrchestrateResponse(**response_data)
        
    except ValueError as ve:
        logger.error(f"Validation error during orchestration: {ve}")
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        logger.error(f"Error during orchestration: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during orchestration")
