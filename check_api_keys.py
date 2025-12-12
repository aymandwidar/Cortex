#!/usr/bin/env python3
"""
Check API keys stored in the database
"""

import asyncio
import sys
import os

# Add the cortex directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from cortex.admin.provider_keys import provider_key_manager

async def check_stored_keys():
    """Check what API keys are stored in the database"""
    
    print("🔍 Checking API Keys in Database")
    print("="*40)
    
    providers = ["openrouter", "groq", "openai", "anthropic", "deepseek"]
    
    for provider in providers:
        try:
            api_key = await provider_key_manager.get_api_key(provider)
            if api_key:
                print(f"✅ {provider.upper()}: {api_key[:15]}...{api_key[-4:]}")
            else:
                print(f"❌ {provider.upper()}: No key found")
        except Exception as e:
            print(f"💥 {provider.upper()}: Error - {e}")

if __name__ == "__main__":
    asyncio.run(check_stored_keys())