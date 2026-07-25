import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import AsyncMock
from app.main import app

@pytest.mark.asyncio
async def test_get_history_empty(monkeypatch):
    """Test retrieving history when user has no recorded crises."""
    monkeypatch.setattr("app.routes.history.get_crisis_history", AsyncMock(return_value=[]))
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/history/user_empty")
        
    assert response.status_code == 200
    assert response.json() == []

@pytest.mark.asyncio
async def test_get_history_populated(monkeypatch):
    """Test retrieving history when user has logs."""
    mock_logs = [
        {
            "id": "log-1",
            "voice_transcript": "Need help",
            "risk_level": "HIGH",
            "risk_percentage": 90,
            "created_at": "2026-07-25T12:00:00Z",
            "notify_family": True
        }
    ]
    monkeypatch.setattr("app.routes.history.get_crisis_history", AsyncMock(return_value=mock_logs))
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/history/user_123")
        
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == "log-1"
    assert data[0]["risk_level"] == "HIGH"
