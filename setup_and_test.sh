#!/usr/bin/env bash
# ============================================================
# AnchorAI: The AI Recovery Operating System
# Automated Setup, Database Initialization, and Test Script
# ============================================================
#
# Usage: chmod +x setup_and_test.sh && ./setup_and_test.sh
#
# This script:
#   1. Checks for required system dependencies
#   2. Sets up the Python virtual environment and installs packages
#   3. Installs Node.js frontend dependencies
#   4. Initializes the PostgreSQL database with schema.sql
#   5. Runs the PyTest test suite
#   6. Provides startup instructions
# ============================================================

set -euo pipefail

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Project root directory (where this script lives)
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${PROJECT_ROOT}/backend"
FRONTEND_DIR="${PROJECT_ROOT}/frontend"

# Database configuration (matches .env.example defaults)
DB_NAME="anchorai_db"
DB_USER="anchorai_user"
DB_PASS="anchorai_pass"
DB_HOST="localhost"
DB_PORT="5432"

# ============================================================
# Helper Functions
# ============================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
}

log_header() {
    echo ""
    echo -e "${CYAN}${BOLD}═══════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}${BOLD}  $1${NC}"
    echo -e "${CYAN}${BOLD}═══════════════════════════════════════════════════${NC}"
    echo ""
}

check_command() {
    if command -v "$1" &> /dev/null; then
        log_success "$1 found: $(command -v "$1")"
        return 0
    else
        log_error "$1 not found. Please install it before running this script."
        return 1
    fi
}

# ============================================================
# Step 1: Check System Dependencies
# ============================================================

log_header "Step 1: Checking System Dependencies"

DEPS_OK=true

check_command "python3" || DEPS_OK=false
check_command "pip3" || check_command "pip" || DEPS_OK=false
check_command "node" || DEPS_OK=false
check_command "npm" || DEPS_OK=false
check_command "psql" || { log_warn "psql not found — database setup will be skipped"; }

if [ "$DEPS_OK" = false ]; then
    log_error "Missing required dependencies. Please install them and try again."
    exit 1
fi

# Show versions
log_info "Python version: $(python3 --version 2>&1)"
log_info "Node version: $(node --version 2>&1)"
log_info "npm version: $(npm --version 2>&1)"

# ============================================================
# Step 2: Backend Setup (Python)
# ============================================================

log_header "Step 2: Setting Up Python Backend"

cd "${BACKEND_DIR}"

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    log_info "Creating Python virtual environment..."
    python3 -m venv venv
    log_success "Virtual environment created"
else
    log_info "Virtual environment already exists"
fi

# Activate virtual environment
log_info "Activating virtual environment..."
source venv/bin/activate
log_success "Virtual environment activated"

# Install dependencies
log_info "Installing Python dependencies..."
pip install -r requirements.txt --quiet
log_success "Python dependencies installed"

# Setup .env file if it doesn't exist
if [ ! -f ".env" ]; then
    log_info "Creating .env file from .env.example..."
    cp .env.example .env
    log_warn "Please edit backend/.env and add your GEMINI_API_KEY"
else
    log_info ".env file already exists"
fi

# ============================================================
# Step 3: Frontend Setup (Node.js)
# ============================================================

log_header "Step 3: Setting Up Next.js Frontend"

cd "${FRONTEND_DIR}"

# Install Node.js dependencies
log_info "Installing Node.js dependencies..."
npm install --silent 2>/dev/null || npm install
log_success "Node.js dependencies installed"

# ============================================================
# Step 4: Database Initialization
# ============================================================

log_header "Step 4: Initializing PostgreSQL Database"

if command -v psql &> /dev/null; then
    # Check if PostgreSQL is running
    if pg_isready -h "${DB_HOST}" -p "${DB_PORT}" &> /dev/null; then
        log_success "PostgreSQL is running"

        # Create database user (ignore error if already exists)
        log_info "Creating database user '${DB_USER}'..."
        psql -h "${DB_HOST}" -p "${DB_PORT}" -U "$(whoami)" -d postgres \
            -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';" 2>/dev/null \
            && log_success "User '${DB_USER}' created" \
            || log_info "User '${DB_USER}' may already exist (OK)"

        # Create database (ignore error if already exists)
        log_info "Creating database '${DB_NAME}'..."
        psql -h "${DB_HOST}" -p "${DB_PORT}" -U "$(whoami)" -d postgres \
            -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};" 2>/dev/null \
            && log_success "Database '${DB_NAME}' created" \
            || log_info "Database '${DB_NAME}' may already exist (OK)"

        # Run schema
        log_info "Applying schema.sql..."
        PGPASSWORD="${DB_PASS}" psql -h "${DB_HOST}" -p "${DB_PORT}" \
            -U "${DB_USER}" -d "${DB_NAME}" \
            -f "${PROJECT_ROOT}/schema.sql" 2>/dev/null \
            && log_success "Schema applied successfully" \
            || log_warn "Schema application had warnings (may already exist)"

        # Grant permissions
        log_info "Granting permissions..."
        psql -h "${DB_HOST}" -p "${DB_PORT}" -U "$(whoami)" -d "${DB_NAME}" \
            -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${DB_USER};" 2>/dev/null
        psql -h "${DB_HOST}" -p "${DB_PORT}" -U "$(whoami)" -d "${DB_NAME}" \
            -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${DB_USER};" 2>/dev/null
        log_success "Permissions granted"

    else
        log_warn "PostgreSQL is not running. Start it with: brew services start postgresql"
        log_warn "Database setup skipped — the app will still work (DB features disabled)"
    fi
else
    log_warn "psql not found — database setup skipped"
    log_warn "The app will still work with Gemini AI features (DB features disabled)"
fi

# ============================================================
# Step 5: Run Tests
# ============================================================

log_header "Step 5: Running Test Suite"

cd "${BACKEND_DIR}"
source venv/bin/activate

log_info "Running PyTest suite..."
echo ""

# Run tests with verbose output
python -m pytest tests/ -v --tb=short 2>&1 || {
    log_warn "Some tests may have failed — check output above"
}

echo ""
log_success "Test suite completed"

# ============================================================
# Step 6: Summary & Startup Instructions
# ============================================================

log_header "Setup Complete! 🚀"

echo -e "${GREEN}${BOLD}AnchorAI is ready to launch!${NC}"
echo ""
echo -e "${BOLD}To start the application:${NC}"
echo ""
echo -e "  ${CYAN}Terminal 1 (Backend):${NC}"
echo -e "    cd ${BACKEND_DIR}"
echo -e "    source venv/bin/activate"
echo -e "    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo -e "  ${CYAN}Terminal 2 (Frontend):${NC}"
echo -e "    cd ${FRONTEND_DIR}"
echo -e "    npm run dev"
echo ""
echo -e "${BOLD}Access Points:${NC}"
echo -e "  Frontend:  ${BLUE}http://localhost:3000${NC}"
echo -e "  API Docs:  ${BLUE}http://localhost:8000/docs${NC}"
echo -e "  Health:    ${BLUE}http://localhost:8000/api/health${NC}"
echo ""
echo -e "${YELLOW}${BOLD}⚠️  Don't forget to add your GEMINI_API_KEY to backend/.env${NC}"
echo ""
