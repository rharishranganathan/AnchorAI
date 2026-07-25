"""PyTest configuration for AnchorAI backend tests.

Sets up environment variables needed for testing without requiring
a real .env file or Gemini API key.
"""

import os
import pytest

# Set test environment variables before any app imports
os.environ.setdefault("GEMINI_API_KEY", "test-api-key-for-testing")
os.environ.setdefault("DATABASE_URL", "postgresql://test:test@localhost:5432/test_db")
os.environ.setdefault("CORS_ORIGINS", "http://localhost:3000")
os.environ.setdefault("APP_ENV", "testing")
