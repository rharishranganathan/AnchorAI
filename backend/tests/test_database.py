import pytest
from pydantic import ValidationError
from app.models.schemas import CrisisLogResponse, SafetyPlan, OrchestrateResponse

def test_crisis_log_schema_validation():
    # Valid data
    data = {
        "id": "123",
        "voice_transcript": "Test",
        "risk_level": "LOW",
        "risk_percentage": 10,
        "created_at": "2026-07-25T00:00:00Z",
        "notify_family": False
    }
    log = CrisisLogResponse(**data)
    assert log.id == "123"
    
    # Missing required field
    with pytest.raises(ValidationError):
        invalid_data = data.copy()
        del invalid_data["risk_level"]
        CrisisLogResponse(**invalid_data)

def test_safety_plan_schema_validation():
    data = {
        "plan_title": "My Plan",
        "immediate_actions": [
            {"action": "Stop", "priority": "immediate", "details": "Just stop"}
        ],
        "coping_strategies": ["Run"],
        "warning_signs": ["Anger"]
    }
    plan = SafetyPlan(**data)
    assert plan.plan_title == "My Plan"
    assert len(plan.immediate_actions) == 1
    
def test_orchestrate_response_model():
    data = {
        "intent_detection": {
            "user_state": "calm",
            "emotional_tone": "neutral",
            "urgency_level": "low"
        },
        "relapse_risk": {
            "level": "LOW",
            "percentage": 5,
            "contributing_factors": []
        },
        "grounding_script": {
            "title": "Rest",
            "duration_minutes": 5,
            "steps": []
        },
        "caregiver_advice": {
            "summary": "All good",
            "dos": [],
            "donts": [],
            "conversation_starters": []
        },
        "safety_plan": {
            "plan_title": "Plan",
            "immediate_actions": [],
            "coping_strategies": [],
            "warning_signs": []
        },
        "family_notification": {
            "notify_family": False,
            "reason": "",
            "suggested_message": ""
        },
        "crisis_log_id": "test-id",
        "timestamp": "2026-07-25T00:00:00Z"
    }
    
    response = OrchestrateResponse(**data)
    assert response.crisis_log_id == "test-id"
    assert response.relapse_risk.level == "LOW"
