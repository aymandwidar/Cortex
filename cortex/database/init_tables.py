"""Initialize database tables."""

import asyncio
from cortex.database.connection import engine, Base
from cortex.database.models import APIKey
from cortex.admin.settings import ProviderSetting


async def init_tables():
    """Create all database tables."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database tables created successfully")


if __name__ == "__main__":
    asyncio.run(init_tables())
