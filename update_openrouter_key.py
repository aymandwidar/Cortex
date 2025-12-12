#!/usr/bin/env python3
"""
Update OpenRouter API key in the database
"""

import asyncio
import sys
import os

# Add the cortex directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from cortex.admin.settings import ProviderSetting, encrypt_api_key, decrypt_api_key
from cortex.database.connection import AsyncSessionLocal
from sqlalchemy import select

async def update_openrouter_key():
    """Update the OpenRouter API key in the database"""
    
    # The correct OpenRouter key
    correct_key = "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"
    
    print("🔧 Updating OpenRouter API Key in Database")
    print("="*50)
    
    try:
        async with AsyncSessionLocal() as db:
            # Check current key
            result = await db.execute(
                select(ProviderSetting).where(ProviderSetting.provider_name == "openrouter")
            )
            setting = result.scalar_one_or_none()
            
            if setting:
                current_key = decrypt_api_key(setting.api_key_encrypted)
                print(f"📋 Current Key: {current_key[:15]}...{current_key[-4:]}")
                
                # Update the key
                setting.api_key_encrypted = encrypt_api_key(correct_key)
                await db.commit()
                print(f"✅ Updated OpenRouter key: {correct_key[:15]}...{correct_key[-4:]}")
                
                # Verify the update
                updated_key = decrypt_api_key(setting.api_key_encrypted)
                if updated_key == correct_key:
                    print("✅ Key update verified successfully!")
                else:
                    print("❌ Key update verification failed!")
            else:
                # Create new setting
                encrypted_key = encrypt_api_key(correct_key)
                new_setting = ProviderSetting(
                    provider_name="openrouter",
                    api_key_encrypted=encrypted_key,
                    is_active=True
                )
                db.add(new_setting)
                await db.commit()
                print(f"✅ Created new OpenRouter setting: {correct_key[:15]}...{correct_key[-4:]}")
            
    except Exception as e:
        print(f"💥 Error updating key: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(update_openrouter_key())