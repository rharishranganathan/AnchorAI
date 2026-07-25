# 🔱 AnchorAI: The AI Recovery Operating System

> **Voice-first, GenAI-powered recovery and prevention platform for individuals navigating Substance Use Disorders (SUD) and their caregivers.**

[![Built with Gemini](https://img.shields.io/badge/Built%20with-Google%20Gemini%201.5-blue?style=for-the-badge&logo=google)](https://aistudio.google.com)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js-000000?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql)](https://postgresql.org)

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Core Feature: SOS Mode](#core-feature-sos-mode)
- [GenAI Usage Disclosure](#genai-usage-disclosure)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Local Setup Instructions](#local-setup-instructions)
- [Test Credentials](#test-credentials)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Accessibility](#accessibility)
- [Security](#security)
- [Deployment Notes](#deployment-notes)

---

## 🎯 Project Overview

**AnchorAI** is a multi-modal, GenAI-powered recovery platform that addresses the critical challenge of providing immediate, personalized support during substance use crises. When cognitive load is highest and typing is hardest, AnchorAI provides a **voice-first, zero-typing intervention** powered by Google Gemini 1.5.

### The Problem
- 21.6 million Americans aged 12+ need substance use treatment (SAMHSA, 2023)
- During a crisis, cognitive load makes traditional apps unusable
- Caregivers often feel helpless and unsure how to respond
- Static safety plans fail to account for the dynamic nature of crises

### Our Solution
A single SOS button that captures voice input and returns a comprehensive, AI-orchestrated crisis response in seconds — including grounding exercises, dynamic safety plans, risk assessment, and caregiver guidance.

---

## 🆘 Core Feature: SOS Mode (AI Recovery Orchestrator)

### How It Works

```
[User in Crisis] → [Press SOS Button] → [Speak/Type] → [Gemini AI Orchestration] → [Personalized Response]
```

1. **Voice Capture**: Browser-native `webkitSpeechRecognition` API — zero downloads, zero RAM overhead
2. **Text Fallback**: Standard textarea input for devices without microphone access
3. **AI Orchestration**: Single comprehensive Gemini 1.5 Flash API call that executes 6 specialized agents:

| Agent | Function | Output |
|-------|----------|--------|
| Intent Detection | Analyzes user's emotional/psychological state | State, tone, urgency level |
| Relapse Risk Score | Calculates dynamic relapse probability | LOW/MEDIUM/HIGH + percentage |
| SOS Grounding Script | Generates 2-minute grounding exercise | Step-by-step calming instructions |
| Caregiver Copilot | Advice for the caregiver | Do's, Don'ts, conversation starters |
| Safety Plan Planner | Dynamic, moment-specific safety plan | Immediate actions, coping strategies |
| Family Notification | Determines if caregiver alert is needed | Boolean trigger + suggested message |

4. **Real-Time Dashboard**: All results displayed instantly with risk visualization
5. **Caregiver Alert**: If risk is HIGH, a formatted alert is logged (SMTP-ready)
6. **Persistence**: All interactions saved to PostgreSQL for crisis history tracking

---

## 🤖 GenAI Usage Disclosure

### API Service Used
**Google Gemini 1.5 Flash** via the `google-generativeai` Python SDK (Google AI Studio)

### Exact Locations in Codebase

| Feature | File | Function | API Call |
|---------|------|----------|----------|
| **All 6 AI Agents** (Intent, Risk, Grounding, Caregiver, Safety, Notification) | `backend/app/services/gemini_service.py` | `orchestrate_crisis()` | `model.generate_content_async()` |
| **Prompt Engineering** | `backend/app/services/gemini_service.py` | `MASTER_PROMPT` constant | N/A (prompt template) |
| **API Configuration** | `backend/app/services/gemini_service.py` | `genai.configure()` | `genai.GenerativeModel()` |
| **Response Parsing** | `backend/app/services/gemini_service.py` | `orchestrate_crisis()` | JSON parsing of Gemini output |

### How It Works
- A **single API call** to Gemini 1.5 Flash processes the user's voice transcript
- The model is configured with `response_mime_type="application/json"` for structured output
- Temperature is set to `0.7` for a balance of empathy and consistency
- Maximum output tokens: `4096` to accommodate the comprehensive 6-agent response
- **Every response is generated live** — zero mock, cached, or simulated data

### API Key Configuration
The Gemini API key is loaded from the `GEMINI_API_KEY` environment variable (stored in `backend/.env`, never committed to version control).

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                    │
│  ┌─────────┐  ┌──────────┐  ┌────────────────────────┐ │
│  │SOS Button│  │Voice API │  │  Real-Time Dashboard   │ │
│  │(Mic Icon)│→ │(WebSpeech)│→ │(Risk|Script|Plan|Care)│ │
│  └─────────┘  └──────────┘  └────────────────────────┘ │
│       │            │                    ▲                │
│       └────────────┘                    │                │
│              POST /api/orchestrate      │ JSON Response  │
└──────────────────┬──────────────────────┘                │
                   │                                       │
┌──────────────────▼──────────────────────────────────────┐
│                  BACKEND (FastAPI)                        │
│  ┌──────────────┐  ┌───────────────┐  ┌──────────────┐ │
│  │ Orchestrate  │→ │ Gemini 1.5    │  │ Alert Service│ │
│  │ Router       │  │ Flash Service │  │ (Console Log)│ │
│  └──────┬───────┘  └───────────────┘  └──────────────┘ │
│         │                                                │
│  ┌──────▼───────┐                                       │
│  │  Database    │                                       │
│  │  Service     │                                       │
│  └──────┬───────┘                                       │
└─────────┼───────────────────────────────────────────────┘
          │
┌─────────▼───────────────────────────────────────────────┐
│              PostgreSQL Database                         │
│  ┌──────┐ ┌────────────┐ ┌────────────┐ ┌───────────┐ │
│  │users │ │crisis_logs │ │safety_plans│ │caregiver_ │ │
│  │      │ │            │ │            │ │alerts     │ │
│  └──────┘ └────────────┘ └────────────┘ └───────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js 14 + TypeScript + Tailwind CSS | SSR-ready, type-safe, rapid styling |
| Backend | Python 3.11+ + FastAPI | Async-first, high performance, auto-docs |
| AI Engine | Google Gemini 1.5 Flash | Fast inference, structured JSON output |
| Database | PostgreSQL | ACID-compliant, JSONB for flexible schemas |
| Voice | Web Speech API (browser-native) | Zero RAM, no local ML models |
| Testing | PyTest + httpx | Async test support, API testing |

---

## 🚀 Local Setup Instructions

### Prerequisites
- **Python** 3.11+
- **Node.js** 18+
- **PostgreSQL** 14+
- **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com)

### Quick Start (Automated)

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/AnchorAI.git
cd AnchorAI

# Make setup script executable
chmod +x setup_and_test.sh

# Run the automated setup
./setup_and_test.sh
```

### Manual Setup

#### 1. Database Setup
```bash
# Create PostgreSQL database
createdb anchorai_db
createuser anchorai_user -P  # Password: anchorai_pass

# Initialize schema
psql -d anchorai_db -f schema.sql

# Grant permissions
psql -d anchorai_db -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anchorai_user;"
psql -d anchorai_db -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anchorai_user;"
```

#### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Start the backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

#### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/health

---

## 🔑 Test Credentials

| Role | Username | Email | Password |
|------|----------|-------|----------|
| Individual (Test User) | `test_user` | `test@anchorai.dev` | `anchor_test_2024` |
| Caregiver | `test_caregiver` | `caregiver@anchorai.dev` | `anchor_test_2024` |

> **Note**: These credentials are pre-seeded in the database via `schema.sql`. The test user has a pre-configured emergency contact (Jane Caregiver) for testing the family notification feature.

---

## 📡 API Documentation

### POST `/api/orchestrate`
Processes a voice transcript through the Gemini AI Recovery Orchestrator.

**Request:**
```json
{
  "voice_transcript": "I'm feeling really overwhelmed right now, I keep thinking about using again",
  "user_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
}
```

**Response:**
```json
{
  "intent_detection": {
    "user_state": "Experiencing intense cravings with emotional overwhelm",
    "emotional_tone": "Anxious and distressed",
    "urgency_level": "high"
  },
  "relapse_risk": {
    "level": "HIGH",
    "percentage": 78,
    "contributing_factors": ["Active cravings", "Emotional distress", "Isolation indicators"]
  },
  "grounding_script": {
    "title": "5-4-3-2-1 Sensory Anchor",
    "duration_minutes": 2,
    "steps": ["Take a slow, deep breath...", "..."]
  },
  "caregiver_advice": {
    "summary": "User is experiencing high-risk cravings...",
    "dos": ["Listen without judgment", "..."],
    "donts": ["Don't express anger or disappointment", "..."],
    "conversation_starters": ["I'm here for you...", "..."]
  },
  "safety_plan": {
    "plan_title": "Immediate Craving Response Plan",
    "immediate_actions": [{"action": "...", "priority": "immediate", "details": "..."}],
    "coping_strategies": ["..."],
    "warning_signs": ["..."]
  },
  "family_notification": {
    "notify_family": true,
    "reason": "High relapse risk detected",
    "suggested_message": "..."
  },
  "crisis_log_id": "uuid-here",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### GET `/api/history/{user_id}`
Retrieves crisis history for a user.

### GET `/api/health`
Health check endpoint.

---

## 🧪 Testing

```bash
cd backend
source venv/bin/activate
pytest tests/ -v
```

### Test Coverage
| Test | Description |
|------|-------------|
| `test_health_endpoint` | Verifies API health check |
| `test_orchestrate_request_validation` | Validates input constraints |
| `test_empty_transcript_rejected` | Rejects empty input |
| `test_orchestrate_response_schema` | Validates Gemini response structure |
| `test_crisis_log_schema_validation` | Validates Pydantic models |
| `test_safety_plan_schema_validation` | Validates safety plan model |

---

## ♿ Accessibility

- **Semantic HTML**: Proper heading hierarchy (`<h1>` → `<h2>` → `<h3>`), `<main>`, `<nav>`, `<section>`, `<article>`
- **ARIA Labels**: All interactive elements have descriptive `aria-label` attributes
- **High Contrast**: Dark theme with WCAG AA+ contrast ratios
- **Keyboard Navigation**: Full tab navigation support
- **Screen Reader Support**: Live transcript region with `aria-live="polite"`
- **Voice-First Design**: Primary interaction requires no typing
- **Text Fallback**: Full text input alternative for voice-unavailable scenarios
- **Focus Management**: Clear focus indicators on all interactive elements

---

## 🔒 Security

- **API Keys**: Stored in `.env` files, never committed (`.gitignore` enforced)
- **Input Validation**: Pydantic models validate all inputs with length constraints
- **CORS**: Restricted to configured origins only
- **SQL Injection Prevention**: Parameterized queries via `asyncpg`
- **No Local ML Models**: All AI processing via secure Gemini API (no local attack surface)
- **Dependency Pinning**: All Python packages pinned to specific versions
- **Environment Isolation**: Separate dev/prod configurations via `APP_ENV`

---

## 🌐 Deployment Notes

### Production Environment Configuration
- Set `APP_ENV=production` in environment variables
- Configure `GEMINI_API_KEY` as a production secret
- Set `DATABASE_URL` to your production PostgreSQL instance
- Update `CORS_ORIGINS` to your frontend deployment URL
- Run Next.js build: `cd frontend && npm run build && npm start`
- Run FastAPI with production server: `uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2`

### Recommended Deployment Platforms
- **Frontend**: Vercel (optimized for Next.js)
- **Backend**: Google Cloud Run / Railway
- **Database**: Supabase / Neon (managed PostgreSQL)

---

## 📄 License

This project was built for the **PromptWars Build with AI Hackathon** by Google for Developers.

---

<p align="center">
  <strong>AnchorAI</strong> — Because recovery deserves intelligence. 🔱
</p>
