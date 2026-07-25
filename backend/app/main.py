import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import get_settings
from .routes import orchestrate, history
from .services.database_service import get_db_pool, close_db_pool

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler for FastAPI."""
    logger.info("API is starting up...")
    # Initialize DB pool
    await get_db_pool()
    yield
    # Cleanup DB pool
    await close_db_pool()
    logger.info("API shutdown complete.")

app = FastAPI(
    title="AnchorAI Recovery API",
    lifespan=lifespan
)

settings = get_settings()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.CORS_ORIGINS.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(orchestrate.router)
app.include_router(history.router)

@app.get("/")
async def root():
    return {"message": "Welcome to AnchorAI Recovery API"}
