"""Database connection management."""

import os
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool
import structlog

from cortex.config import settings
from cortex.database.models import Base

logger = structlog.get_logger()

# Create async engine with Render PostgreSQL support
# Default to SQLite locally, but allow env var override
database_url = os.getenv("DATABASE_URL", getattr(settings, "database_url", "sqlite+aiosqlite:///./cortex.db"))

# Fix Render's "postgres://" schema (SQLAlchemy requires "postgresql+asyncpg://")
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql+asyncpg://", 1)
    logger.info("database_url_converted", original="postgres://", converted="postgresql+asyncpg://")

DATABASE_URL = database_url

# Configure engine based on database type
if "sqlite" in DATABASE_URL:
    # SQLite configuration with StaticPool for threading safety
    engine = create_async_engine(
        DATABASE_URL,
        echo=False,
        poolclass=StaticPool,
        connect_args={"check_same_thread": False}
    )
else:
    # PostgreSQL configuration for production
    engine = create_async_engine(
        DATABASE_URL,
        echo=False,
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True,
        pool_recycle=300
    )

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def init_db():
    """Initialize database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    logger.info("database_initialized", url=DATABASE_URL)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for getting database session.
    
    Usage in FastAPI:
        @app.get("/endpoint")
        async def endpoint(db: AsyncSession = Depends(get_db)):
            ...
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
