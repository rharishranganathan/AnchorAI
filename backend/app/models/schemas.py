from typing import List, Optional
import uuid
from pydantic import BaseModel, Field

class OrchestrateRequest(BaseModel):
    voice_transcript: str
    user_id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))

class IntentDetection(BaseModel):
    user_state: str
    emotional_tone: str
    urgency_level: str

class RelapseRiskScore(BaseModel):
    level: str
    percentage: int
    contributing_factors: List[str]

class GroundingScript(BaseModel):
    title: str
    duration_minutes: int
    steps: List[str]

class CaregiverAdvice(BaseModel):
    summary: str
    dos: List[str]
    donts: List[str]
    conversation_starters: List[str]

class SafetyPlanItem(BaseModel):
    action: str
    priority: str
    details: str

class SafetyPlan(BaseModel):
    plan_title: str
    immediate_actions: List[SafetyPlanItem]
    coping_strategies: List[str]
    warning_signs: List[str]

class FamilyNotification(BaseModel):
    notify_family: bool
    reason: str
    suggested_message: str

class OrchestrateResponse(BaseModel):
    intent_detection: IntentDetection
    relapse_risk: RelapseRiskScore
    grounding_script: GroundingScript
    caregiver_advice: CaregiverAdvice
    safety_plan: SafetyPlan
    family_notification: FamilyNotification
    crisis_log_id: Optional[str] = None
    timestamp: str

class CrisisLogResponse(BaseModel):
    id: str
    voice_transcript: str
    risk_level: str
    risk_percentage: int
    created_at: str
    notify_family: bool
