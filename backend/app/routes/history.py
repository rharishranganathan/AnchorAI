from fastapi import APIRouter
from typing import List
from ..models.schemas import CrisisLogResponse
from ..services.database_service import get_crisis_history

router = APIRouter()

@router.get("/api/history/{user_id}", response_model=List[CrisisLogResponse])
async def get_history(user_id: str):
    """Retrieve crisis history for a user."""
    history = await get_crisis_history(user_id)
    # Ensure created_at is string for the response
    for item in history:
        if hasattr(item.get("created_at"), "isoformat"):
            item["created_at"] = item["created_at"].isoformat()
        elif item.get("created_at") is None:
             item["created_at"] = ""
    return history

@router.get("/api/health")
async def health_check():
    """Simple health check endpoint."""
    return {"status": "ok"}
