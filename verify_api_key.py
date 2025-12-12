"""Verify the API key exists in database."""

import asyncio
from sqlalchemy import select
from cortex.database.connection import AsyncSessionLocal
from cortex.database.models import APIKey

async def verify():
    api_key_hash = "ctx_115d0eb0f8460b53ed6c6abf58e3c994f1ec68dee2a652e5ea6be45bc367382c"
    
    async with AsyncSessionLocal() as db:
        # Hash the key
        import hashlib
        key_hash = hashlib.sha256(api_key_hash.encode()).hexdigest()
        
        result = await db.execute(
            select(APIKey).where(APIKey.key_hash == key_hash)
        )
        api_key_obj = result.scalar_one_or_none()
        
        if api_key_obj:
            print(f"API Key found!")
            print(f"  Name: {api_key_obj.name}")
            print(f"  User ID: {api_key_obj.user_id}")
            print(f"  Is Active: {api_key_obj.is_active}")
            print(f"  Is Revoked: {api_key_obj.is_revoked}")
        else:
            print("API Key NOT found in database!")

if __name__ == "__main__":
    asyncio.run(verify())
