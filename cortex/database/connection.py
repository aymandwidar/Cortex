"""Database connection management."""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool
import structlog

from cortex.config import settings
from cortex.database.models import Base

logger = structlog.get_logger()

# Create async engine
# Use SQLite for development, can switch to PostgreSQL for production
DATABASE_URL = getattr(settings, "database_url", "sqlite+aiosqlite:///./cortex.db")

# For SQLite, use StaticPool to avoid threading issues
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    poolclass=StaticPool if "sqlite" in DATABASE_URL else None,
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
