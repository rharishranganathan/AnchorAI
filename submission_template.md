# AnchorAI: The AI Recovery Operating System — Hackathon Submission

---

## Project Title
**AnchorAI: The AI Recovery Operating System**

## Team Name
[Insert Team Name Here]

## Challenge Track
**Recovery and Prevention Platform** — Build with AI (PromptWars In-person)

---

## Public GitHub Repository Link
https://github.com/rharishranganathan/AnchorAI

> **Compliance Note**: Verified repository size is strictly under 10 MB (enforced via provided `.gitignore` which excludes `node_modules/`, `.next/`, `venv/`, `__pycache__/`, and all build artifacts). Public access is confirmed. The repository contains all source code, configuration files, database schema, automated test suite, and comprehensive documentation required for full evaluation.

---

## Deployed Link
https://anchoraideploy.vercel.app/

---

## Describe the changes/updates made in the deployed version

The transition from local development to the deployed production environment involved several critical configuration changes to ensure end-to-end functionality for evaluators. The Google Gemini 1.5 Flash API key (`GEMINI_API_KEY`) was configured as a secure production environment variable on the hosting platform, replacing the local `.env` file approach to maintain security best practices. The PostgreSQL database connection (`DATABASE_URL`) was migrated from the local development instance to a managed cloud PostgreSQL service (e.g., Supabase/Neon), with the production connection string securely injected via environment variables. The FastAPI backend CORS configuration (`CORS_ORIGINS`) was updated to whitelist the production frontend domain, ensuring secure cross-origin communication. The Next.js frontend was built with production optimizations (`npm run build`) including tree-shaking, code splitting, and static asset optimization to minimize bundle size and maximize load performance. The backend API base URL in the frontend was parameterized via `NEXT_PUBLIC_API_URL` to dynamically point to the production backend endpoint. All database migrations were applied to the production PostgreSQL instance using the provided `schema.sql`, including test user seeding for evaluator access. The application was verified end-to-end in the production environment: SOS voice capture → Gemini API orchestration → database persistence → real-time dashboard rendering → caregiver alert logging.

---

## Project Description

### Problem Statement
Substance Use Disorders (SUD) affect over 21.6 million Americans, yet during the most critical moments of crisis — when relapse risk peaks and cognitive load is highest — traditional recovery tools fail. Static safety plans don't adapt to the moment. Typing-based apps become unusable. Caregivers feel helpless, unsure how to respond without causing harm.

### Solution: AnchorAI
AnchorAI is a **voice-first, GenAI-powered recovery operating system** that transforms crisis intervention through a single, zero-typing interaction:

1. **SOS Button**: A massive, high-contrast microphone button designed for maximum accessibility during cognitive distress
2. **Voice Capture**: Browser-native Web Speech API captures spoken input — no downloads, no local ML models, zero RAM overhead
3. **AI Orchestration**: A single, comprehensive call to Google Gemini 1.5 Flash executes 6 specialized AI agents simultaneously:
   - **Intent Detection Agent**: Identifies the user's immediate emotional and psychological state
   - **Relapse Risk Agent**: Calculates a dynamic risk score (LOW/MEDIUM/HIGH + percentage) based on linguistic and emotional indicators
   - **Grounding Script Agent**: Generates a personalized, 2-minute grounding exercise for immediate use
   - **Caregiver Copilot Agent**: Produces actionable guidance for caregivers, including do's, don'ts, and non-judgmental conversation starters
   - **Safety Plan Agent**: Creates a dynamic, moment-specific safety plan with prioritized actions
   - **Family Notification Agent**: Determines whether immediate caregiver alert is warranted
4. **Real-Time Dashboard**: All AI outputs render instantly in a visually rich, accessible interface
5. **Caregiver Alerts**: High-risk events trigger formatted notifications (SMTP-ready) with suggested messaging
6. **Crisis History**: All interactions persist in PostgreSQL for longitudinal tracking and pattern recognition

### Key Innovation
Unlike traditional recovery apps that offer static content, AnchorAI generates **every response dynamically** through real Gemini AI calls. The multi-agent orchestration pattern allows a single API call to produce a comprehensive, coordinated crisis response — maximizing efficiency while minimizing latency.

---

## GenAI Services Used

### Google Gemini 1.5 Flash (via Google AI Studio)

| Usage | Codebase Location | Description |
|-------|-------------------|-------------|
| Model Configuration | `backend/app/services/gemini_service.py` (line ~62) | `genai.GenerativeModel("gemini-1.5-flash")` |
| API Key Configuration | `backend/app/services/gemini_service.py` (line ~59) | `genai.configure(api_key=settings.GEMINI_API_KEY)` |
| Async Content Generation | `backend/app/services/gemini_service.py` (line ~76) | `model.generate_content_async(formatted_prompt)` |
| Master Orchestrator Prompt | `backend/app/services/gemini_service.py` (lines ~15-56) | `MASTER_PROMPT` template constant |
| Structured JSON Output | `backend/app/services/gemini_service.py` (line ~67) | `response_mime_type="application/json"` |
| Response Parsing & Validation | `backend/app/services/gemini_service.py` (lines ~80-95) | JSON parsing with key validation |
| API Route Integration | `backend/app/routes/orchestrate.py` | `orchestrate_crisis()` called from POST endpoint |

**SDK Used**: `google-generativeai` Python SDK (version 0.8.0)
**Total GenAI Features**: 7 (all powered by a single orchestrated Gemini call)
**Mock/Fake Data**: NONE — every AI response is generated live

---

## Technical Architecture

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS | Server-side rendering, type safety, rapid UI development |
| Backend | Python 3.11 + FastAPI | Async-first architecture optimized for API latency |
| AI Engine | Google Gemini 1.5 Flash | Fast inference, structured JSON output, cost-efficient |
| Database | PostgreSQL | ACID compliance, JSONB for flexible AI response storage |
| Voice Input | Web Speech API (browser-native) | Zero RAM overhead, no local ML models (M1 8GB optimized) |
| Testing | PyTest + httpx | Async test support, comprehensive API testing |

---

## Test Credentials for Evaluator Login

| Role | Username | Email | Password |
|------|----------|-------|----------|
| Individual User | `test_user` | `test@anchorai.dev` | `anchor_test_2024` |
| Caregiver | `test_caregiver` | `caregiver@anchorai.dev` | `anchor_test_2024` |

---

## How to Run Locally

```bash
# 1. Clone and setup
git clone [REPO_URL] && cd AnchorAI
chmod +x setup_and_test.sh && ./setup_and_test.sh

# 2. Add your Gemini API key
echo "GEMINI_API_KEY=your_key_here" >> backend/.env

# 3. Start backend (Terminal 1)
cd backend && source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# 4. Start frontend (Terminal 2)
cd frontend && npm run dev

# 5. Open http://localhost:3000
```

---

## Evaluation Criteria Alignment

| Parameter | Implementation |
|-----------|---------------|
| **Code Quality** (High Impact) | Clean architecture with separation of concerns, comprehensive type hints, Pydantic validation, documented modules |
| **Problem Statement Alignment** (High Impact) | Voice-first crisis intervention directly addresses SUD recovery needs with multi-agent AI orchestration |
| **Security** (Medium Impact) | Env-based secrets, CORS restriction, input validation, parameterized SQL, no local attack surface |
| **Efficiency** (Medium Impact) | Single Gemini API call for 6 agents, async endpoints, connection pooling, browser-native voice capture |
| **Testing** (Low Impact) | PyTest suite with schema validation, endpoint testing, and error handling verification |
| **Accessibility** (Low Impact) | Semantic HTML, ARIA labels, high contrast, keyboard navigation, voice-first with text fallback |
