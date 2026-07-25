from typing import List, Optional
import uuid
from pydantic import BaseModel, Field

class OrchestrateRequest(BaseModel):
    """Request model for crisis orchestration endpoint."""
    voice_transcript: str = Field(
        ..., 
        min_length=1, 
        max_length=5000, 
        description="The raw voice transcript or typed text from the user in crisis.",
        json_schema_extra={"example": "I feel overwhelmed and I'm having intense cravings right now."}
    )
    user_id: Optional[str] = Field(
        default_factory=lambda: str(uuid.uuid4()),
        description="Unique identifier for the user session.",
        json_schema_extra={"example": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"}
    )

class IntentDetection(BaseModel):
    """Analysis of user's emotional state and intent."""
    user_state: str = Field(..., description="Identified psychological state.", json_schema_extra={"example": "Acute craving with anxiety"})
    emotional_tone: str = Field(..., description="Primary emotional tone.", json_schema_extra={"example": "Distressed"})
    urgency_level: str = Field(..., description="Assessed urgency: low, medium, or high.", json_schema_extra={"example": "high"})

class RelapseRiskScore(BaseModel):
    """Quantitative relapse risk assessment."""
    level: str = Field(..., description="Risk category: LOW, MEDIUM, or HIGH.", json_schema_extra={"example": "HIGH"})
    percentage: int = Field(..., ge=0, le=100, description="Calculated relapse risk probability (0-100%).", json_schema_extra={"example": 85})
    contributing_factors: List[str] = Field(default_factory=list, description="Key factors contributing to the risk score.")

class GroundingScript(BaseModel):
    """Personalized grounding exercise instructions."""
    title: str = Field(..., description="Title of the sensory anchor exercise.")
    duration_minutes: int = Field(default=2, ge=1, le=10, description="Recommended exercise duration in minutes.")
    steps: List[str] = Field(..., description="Step-by-step calming instructions.")

class CaregiverAdvice(BaseModel):
    """Guidance for caregivers and family support."""
    summary: str = Field(..., description="Contextual situation overview for the caregiver.")
    dos: List[str] = Field(default_factory=list, description="Recommended supportive actions.")
    donts: List[str] = Field(default_factory=list, description="Actions to avoid.")
    conversation_starters: List[str] = Field(default_factory=list, description="Empathetic conversation prompts.")

class SafetyPlanItem(BaseModel):
    """Individual action item in a safety plan."""
    action: str = Field(..., description="Specific action to take.")
    priority: str = Field(..., description="Priority level: immediate, high, medium.")
    details: str = Field(..., description="Detailed execution instructions.")

class SafetyPlan(BaseModel):
    """Dynamic, crisis-specific safety plan."""
    plan_title: str = Field(..., description="Safety plan title.")
    immediate_actions: List[SafetyPlanItem] = Field(..., description="Immediate prioritized action items.")
    coping_strategies: List[str] = Field(default_factory=list, description="Coping strategies tailored to crisis.")
    warning_signs: List[str] = Field(default_factory=list, description="Personal warning signs identified.")

class FamilyNotification(BaseModel):
    """Caregiver alert trigger decision."""
    notify_family: bool = Field(..., description="Flag indicating if caregiver notification should be dispatched.")
    reason: str = Field(..., description="Justification for notification decision.")
    suggested_message: str = Field(..., description="Suggested message text for caregiver.")

class OrchestrateResponse(BaseModel):
    """Comprehensive response from the AI crisis orchestrator."""
    intent_detection: IntentDetection
    relapse_risk: RelapseRiskScore
    grounding_script: GroundingScript
    caregiver_advice: CaregiverAdvice
    safety_plan: SafetyPlan
    family_notification: FamilyNotification
    crisis_log_id: Optional[str] = Field(None, description="Database ID of recorded log, if persisted.")
    timestamp: str = Field(..., description="ISO 8601 UTC timestamp of execution.")

class CrisisLogResponse(BaseModel):
    """Historical crisis log entry for dashboard display."""
    id: str = Field(..., description="Unique crisis log ID.")
    voice_transcript: str = Field(..., description="Original transcript.")
    risk_level: str = Field(..., description="Recorded risk level.")
    risk_percentage: int = Field(..., ge=0, le=100, description="Recorded risk percentage.")
    created_at: str = Field(..., description="Timestamp of record creation.")
    notify_family: bool = Field(..., description="Whether family notification was triggered.")
