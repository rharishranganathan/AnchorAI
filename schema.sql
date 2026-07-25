-- ============================================================
-- AnchorAI: The AI Recovery Operating System
-- PostgreSQL Database Schema
-- ============================================================

-- Enable UUID extension for secure, non-sequential IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Users Table
-- Stores registered users (individuals and caregivers)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'individual' CHECK (role IN ('individual', 'caregiver', 'admin')),
    full_name VARCHAR(200),
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- Crisis Logs Table
-- Records every SOS interaction with Gemini AI analysis
-- ============================================================
CREATE TABLE IF NOT EXISTS crisis_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    voice_transcript TEXT NOT NULL,
    detected_intent TEXT,
    risk_level VARCHAR(10) CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    risk_percentage INTEGER CHECK (risk_percentage >= 0 AND risk_percentage <= 100),
    grounding_script TEXT,
    caregiver_advice TEXT,
    notify_family BOOLEAN DEFAULT FALSE,
    gemini_raw_response JSONB,
    session_duration_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- Safety Plans Table
-- Stores dynamically generated safety plans per crisis event
-- ============================================================
CREATE TABLE IF NOT EXISTS safety_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crisis_log_id UUID REFERENCES crisis_logs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_title VARCHAR(300),
    immediate_actions JSONB NOT NULL,
    coping_strategies JSONB,
    support_contacts JSONB,
    safe_environments JSONB,
    warning_signs JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- Caregiver Alerts Table
-- Logs family/caregiver notifications triggered by high-risk events
-- ============================================================
CREATE TABLE IF NOT EXISTS caregiver_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crisis_log_id UUID REFERENCES crisis_logs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    caregiver_name VARCHAR(200),
    caregiver_email VARCHAR(255),
    alert_level VARCHAR(20) NOT NULL CHECK (alert_level IN ('INFO', 'WARNING', 'CRITICAL')),
    alert_message TEXT NOT NULL,
    notification_method VARCHAR(20) DEFAULT 'console' CHECK (notification_method IN ('console', 'email', 'sms')),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================
-- Indexes for Query Performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_crisis_logs_user_id ON crisis_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_crisis_logs_created_at ON crisis_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crisis_logs_risk_level ON crisis_logs(risk_level);
CREATE INDEX IF NOT EXISTS idx_safety_plans_user_id ON safety_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_safety_plans_active ON safety_plans(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_caregiver_alerts_crisis ON caregiver_alerts(crisis_log_id);
CREATE INDEX IF NOT EXISTS idx_caregiver_alerts_unack ON caregiver_alerts(acknowledged) WHERE acknowledged = FALSE;

-- ============================================================
-- Insert default test user for evaluator access
-- Password: "anchor_test_2024" (bcrypt hashed)
-- ============================================================
INSERT INTO users (id, username, email, password_hash, role, full_name, emergency_contact_name, emergency_contact_phone, emergency_contact_email)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'test_user',
    'test@anchorai.dev',
    '$2b$12$LJ3m4ys3Lz0YDQ7NSxyNkuGhZ8JFpN6vKXBqXxLQm5RLzJTHNkrW6',
    'individual',
    'Test User',
    'Jane Caregiver',
    '+1-555-0199',
    'caregiver@anchorai.dev'
) ON CONFLICT (username) DO NOTHING;

INSERT INTO users (id, username, email, password_hash, role, full_name)
VALUES (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    'test_caregiver',
    'caregiver@anchorai.dev',
    '$2b$12$LJ3m4ys3Lz0YDQ7NSxyNkuGhZ8JFpN6vKXBqXxLQm5RLzJTHNkrW6',
    'caregiver',
    'Jane Caregiver'
) ON CONFLICT (username) DO NOTHING;
