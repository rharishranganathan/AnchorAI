"""Database Service - Async PostgreSQL operations using asyncpg.

This module handles all database interactions for AnchorAI,
including storing crisis logs, safety plans, and caregiver alerts.
All operations are async for optimal performance.
"""

import asyncpg
import json
import uuid
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from ..config import get_settings

logger = logging.getLogger(__name__)

# Global pool instance (singleton pattern)
_pool: Optional[asyncpg.Pool] = None


async def get_db_pool() -> Optional[asyncpg.Pool]:
    """Get or create the asyncpg database connection pool.
    
    Returns:
        asyncpg.Pool or None if connection fails (graceful degradation).
    """
    global _pool
    if _pool is None:
        try:
            settings = get_settings()
            _pool = await asyncpg.create_pool(
                settings.DATABASE_URL,
                min_size=1,
                max_size=5,
                command_timeout=10,
            )
            logger.info("Database connection pool created successfully.")
        except Exception as e:
            logger.warning(f"Failed to create database pool: {e}. DB operations will be skipped.")
    return _pool


async def close_db_pool():
    """Close the database connection pool during shutdown."""
    global _pool
    if _pool:
        await _pool.close()
        _pool = None
        logger.info("Database connection pool closed.")


async def save_crisis_log(
    user_id: str, transcript: str, gemini_response: Dict[str, Any]
) -> str:
    """Save a crisis log entry to the database.
    
    Args:
        user_id: UUID of the user.
        transcript: The voice transcript text.
        gemini_response: Full parsed Gemini API response.
        
    Returns:
        str: UUID of the newly created crisis log entry.
    """
    pool = await get_db_pool()
    log_id = str(uuid.uuid4())
    if not pool:
        logger.warning("No DB pool available, skipping save_crisis_log.")
        return log_id

    try:
        risk = gemini_response.get("relapse_risk", {})
        intent = gemini_response.get("intent_detection", {})
        grounding = gemini_response.get("grounding_script", {})
        caregiver = gemini_response.get("caregiver_advice", {})
        family = gemini_response.get("family_notification", {})

        async with pool.acquire() as conn:
            await conn.execute(
                """
                INSERT INTO crisis_logs (
                    id, user_id, voice_transcript, detected_intent,
                    risk_level, risk_percentage, grounding_script,
                    caregiver_advice, notify_family, gemini_raw_response,
                    created_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                """,
                uuid.UUID(log_id),
                uuid.UUID(user_id) if user_id != "anonymous" else None,
                transcript,
                intent.get("user_state", ""),
                risk.get("level", "MEDIUM"),
                risk.get("percentage", 50),
                json.dumps(grounding),
                json.dumps(caregiver),
                family.get("notify_family", False),
                json.dumps(gemini_response),
                datetime.now(timezone.utc),
            )
            logger.info(f"Crisis log saved: {log_id}")
    except Exception as e:
        logger.warning(f"Error saving crisis log: {e}")
    return log_id


async def save_safety_plan(
    crisis_log_id: str, user_id: str, safety_plan_data: Dict[str, Any]
):
    """Save a generated safety plan to the database.
    
    Args:
        crisis_log_id: UUID of the related crisis log.
        user_id: UUID of the user.
        safety_plan_data: Safety plan data from Gemini response.
    """
    pool = await get_db_pool()
    if not pool:
        return

    try:
        async with pool.acquire() as conn:
            await conn.execute(
                """
                INSERT INTO safety_plans (
                    id, crisis_log_id, user_id, plan_title,
                    immediate_actions, coping_strategies, warning_signs,
                    is_active, created_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                """,
                uuid.uuid4(),
                uuid.UUID(crisis_log_id),
                uuid.UUID(user_id) if user_id != "anonymous" else None,
                safety_plan_data.get("plan_title", "Safety Plan"),
                json.dumps(safety_plan_data.get("immediate_actions", [])),
                json.dumps(safety_plan_data.get("coping_strategies", [])),
                json.dumps(safety_plan_data.get("warning_signs", [])),
                True,
                datetime.now(timezone.utc),
            )
            logger.info(f"Safety plan saved for crisis log: {crisis_log_id}")
    except Exception as e:
        logger.warning(f"Error saving safety plan: {e}")


async def save_caregiver_alert(
    crisis_log_id: str, user_id: str, alert_data: Dict[str, Any]
):
    """Save a caregiver alert to the database.
    
    Args:
        crisis_log_id: UUID of the related crisis log.
        user_id: UUID of the user.
        alert_data: Family notification data from Gemini response.
    """
    pool = await get_db_pool()
    if not pool:
        return

    try:
        async with pool.acquire() as conn:
            await conn.execute(
                """
                INSERT INTO caregiver_alerts (
                    id, crisis_log_id, user_id, caregiver_name,
                    alert_level, alert_message, notification_method,
                    sent_at, acknowledged
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                """,
                uuid.uuid4(),
                uuid.UUID(crisis_log_id),
                uuid.UUID(user_id) if user_id != "anonymous" else None,
                "Emergency Contact",
                "CRITICAL",
                alert_data.get("suggested_message", "Crisis alert triggered."),
                "console",
                datetime.now(timezone.utc),
                False,
            )
            logger.info(f"Caregiver alert saved for crisis log: {crisis_log_id}")
    except Exception as e:
        logger.warning(f"Error saving caregiver alert: {e}")


async def get_crisis_history(user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
    """Retrieve crisis history for a user.
    
    Args:
        user_id: UUID of the user.
        limit: Maximum number of records to return (default: 20).
        
    Returns:
        List of crisis log entries as dictionaries.
    """
    pool = await get_db_pool()
    if not pool:
        return []

    try:
        async with pool.acquire() as conn:
            records = await conn.fetch(
                """
                SELECT 
                    id::text,
                    voice_transcript,
                    risk_level,
                    risk_percentage,
                    created_at::text,
                    notify_family
                FROM crisis_logs
                WHERE user_id = $1
                ORDER BY created_at DESC
                LIMIT $2
                """,
                uuid.UUID(user_id),
                limit,
            )
            return [dict(r) for r in records]
    except Exception as e:
        logger.warning(f"Error fetching crisis history: {e}")
        return []
