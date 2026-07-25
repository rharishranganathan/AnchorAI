"""Gemini AI Service - Real Google Gemini 1.5 Flash API Integration.

This module handles all GenAI calls for the AnchorAI Recovery Orchestrator.
Every response is generated live by the Gemini API - no mock, cached, or 
simulated data is used.

GenAI Usage: Google Gemini 1.5 Flash via google-generativeai SDK
API Source: Google AI Studio (https://aistudio.google.com)
"""

import json
import logging
import google.generativeai as genai
from ..config import get_settings

logger = logging.getLogger(__name__)

# Master Orchestrator Prompt
MASTER_PROMPT = """You are the AI Recovery Orchestrator for AnchorAI, a platform supporting individuals navigating Substance Use Disorders (SUD). Process this user voice transcript with empathy, clinical awareness, and urgency.

User Voice Transcript: "{user_input}"

Execute ALL of the following orchestrated steps and return a single JSON response:

Step 1 (Agent: Intent Detection): Analyze the user's immediate emotional and psychological state. Define their urgency level.

Step 2 (Agent: Relapse Risk Score): Calculate a dynamic relapse probability based on the transcript content, emotional indicators, and language patterns. Provide a level (LOW, MEDIUM, or HIGH) and a percentage (0-100).

Step 3 (Agent: SOS Grounding Script): Generate a personalized, zero-friction, 2-minute empathetic grounding exercise. This should be immediately actionable, calming, and trauma-informed. Include step-by-step breathing or sensory grounding instructions.

Step 4 (Agent: Caregiver Copilot Advice): Generate actionable, empathetic advice for the user's caregiver. Include specific dos and don'ts, and conversation starters that are non-judgmental.

Step 5 (Agent: Safety Plan Planner): Generate a dynamic, personalized safety plan with immediate actions to take right now, coping strategies, and warning signs to watch for. This must NOT be generic/static.

Step 6 (Agent: Family Notification): Determine if this distress level requires immediate caregiver notification. Set notify_family to true ONLY if the risk is HIGH or there are indicators of immediate danger.

Return ONLY valid JSON in this EXACT format (no markdown, no code blocks, no extra text):
{
  "intent_detection": {
    "user_state": "brief description of user's current state",
    "emotional_tone": "primary emotional tone detected",
    "urgency_level": "low/moderate/high/critical"
  },
  "relapse_risk": {
    "level": "LOW or MEDIUM or HIGH",
    "percentage": 0-100,
    "contributing_factors": ["factor1", "factor2", "factor3"]
  },
  "grounding_script": {
    "title": "name of the grounding exercise",
    "duration_minutes": 2,
    "steps": ["step 1 instruction", "step 2 instruction", ...]
  },
  "caregiver_advice": {
    "summary": "brief situation summary for the caregiver",
    "dos": ["do this", "do that"],
    "donts": ["don't do this", "don't do that"],
    "conversation_starters": ["starter 1", "starter 2"]
  },
  "safety_plan": {
    "plan_title": "personalized title for this safety plan",
    "immediate_actions": [
      {"action": "what to do", "priority": "immediate", "details": "how to do it"}
    ],
    "coping_strategies": ["strategy 1", "strategy 2"],
    "warning_signs": ["sign 1", "sign 2"]
  },
  "family_notification": {
    "notify_family": true/false,
    "reason": "why or why not to notify",
    "suggested_message": "message to send to family if notifying"
  }
}"""


async def orchestrate_crisis(user_input: str) -> dict:
    """Send user transcript to Gemini 1.5 Flash and get orchestrated response.
    
    This function makes a REAL API call to Google Gemini. No mock data.
    
    Args:
        user_input: The transcribed voice input from the user.
        
    Returns:
        dict: Parsed JSON response from Gemini with all 6 orchestrated steps.
        
    Raises:
        ValueError: If Gemini response cannot be parsed as valid JSON.
        Exception: If the Gemini API call fails.
    """
    settings = get_settings()
    
    # Configure Gemini API with real API key
    genai.configure(api_key=settings.GEMINI_API_KEY)
    
    # Initialize Gemini Flash model
    model = genai.GenerativeModel(
        model_name="gemini-flash-latest",
        generation_config=genai.GenerationConfig(
            temperature=0.7,
            top_p=0.95,
            max_output_tokens=4096,
            response_mime_type="application/json",
        ),
    )
    
    # Format the master prompt with user input
    formatted_prompt = MASTER_PROMPT.replace("{user_input}", user_input)
    
    logger.info("Sending orchestration request to Gemini 1.5 Flash API...")
    
    # Make the REAL Gemini API call
    response = await model.generate_content_async(formatted_prompt)
    
    logger.info("Received response from Gemini API")
    
    # Parse the JSON response
    response_text = response.text
    
    # Clean response text (remove markdown code blocks if present)
    if response_text.startswith("```"):
        lines = response_text.split("\n")
        response_text = "\n".join(lines[1:-1])
    
    try:
        result = json.loads(response_text)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Gemini response as JSON: {e}")
        logger.error(f"Raw response: {response_text}")
        raise ValueError(f"Gemini returned invalid JSON: {e}")
    
    # Validate required keys
    required_keys = [
        "intent_detection", "relapse_risk", "grounding_script",
        "caregiver_advice", "safety_plan", "family_notification"
    ]
    for key in required_keys:
        if key not in result:
            raise ValueError(f"Gemini response missing required key: {key}")
    
    return result
