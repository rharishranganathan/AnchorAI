import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock
from app.main import app

@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

@pytest.mark.asyncio
async def test_empty_transcript_rejected():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/orchestrate", json={"voice_transcript": ""})
    assert response.status_code == 400
    assert "Voice transcript cannot be empty" in response.json()["detail"]

@pytest.mark.asyncio
async def test_orchestrate_response_schema(monkeypatch):
    mock_response = {
        "intent_detection": {
            "user_state": "anxious",
            "emotional_tone": "fearful",
            "urgency_level": "high"
        },
        "relapse_risk": {
            "level": "HIGH",
            "percentage": 85,
            "contributing_factors": ["stress"]
        },
        "grounding_script": {
            "title": "Breathe",
            "duration_minutes": 2,
            "steps": ["Breathe in", "Breathe out"]
        },
        "caregiver_advice": {
            "summary": "User is anxious",
            "dos": ["Listen"],
            "donts": ["Judge"],
            "conversation_starters": ["How can I help?"]
        },
        "safety_plan": {
            "plan_title": "Safety Plan",
            "immediate_actions": [
                {"action": "Call someone", "priority": "immediate", "details": "Call sponsor"}
            ],
            "coping_strategies": ["Read"],
            "warning_signs": ["Isolation"]
        },
        "family_notification": {
            "notify_family": False,
            "reason": "Not critical enough",
            "suggested_message": ""
        }
    }
    
    # Mock the Gemini service
    mock_orchestrate = AsyncMock(return_value=mock_response)
    monkeypatch.setattr("app.routes.orchestrate.orchestrate_crisis", mock_orchestrate)
    
    # Mock DB functions
    monkeypatch.setattr("app.routes.orchestrate.save_crisis_log", AsyncMock(return_value="mock-id"))
    monkeypatch.setattr("app.routes.orchestrate.save_safety_plan", AsyncMock())
    monkeypatch.setattr("app.routes.orchestrate.save_caregiver_alert", AsyncMock())
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post("/api/orchestrate", json={"voice_transcript": "I am stressed", "user_id": "user1"})
        
    assert response.status_code == 200
    data = response.json()
    assert "crisis_log_id" in data
    assert "timestamp" in data
    assert data["intent_detection"]["user_state"] == "anxious"
