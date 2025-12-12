#!/usr/bin/env python3
"""
Quick API Key Generation Guide for Cortex V2.5 Cloud-Native Deployment
"""

import webbrowser
import time

def main():
    print("🚀 Cortex V2.5: Cloud-Native API Key Setup")
    print("=" * 50)
    
    print("\n📋 Required API Keys for Render Deployment:")
    print("1. Google API Key (for cloud embeddings - FREE)")
    print("2. Groq API Key (for AI models - FREE)")
    print("3. OpenRouter API Key (for backup models - FREE)")
    
    print("\n🔑 Getting Google API Key (FREE):")
    print("1. Go to Google AI Studio")
    print("2. Create new project or select existing")
    print("3. Generate API key")
    print("4. Copy the key for GOOGLE_API_KEY environment variable")
    
    if input("\nOpen Google AI Studio? (y/n): ").lower() == 'y':
        webbrowser.open("https://aistudio.google.com/app/apikey")
        time.sleep(2)
    
    print("\n🔑 Getting Groq API Key (FREE):")
    print("1. Sign up at Groq Console")
    print("2. Go to API Keys section")
    print("3. Create new API key")
    print("4. Copy the key for GROQ_API_KEY environment variable")
    
    if input("\nOpen Groq Console? (y/n): ").lower() == 'y':
        webbrowser.open("https://console.groq.com/keys")
        time.sleep(2)
    
    print("\n🔑 Getting OpenRouter API Key (FREE):")
    print("1. Sign up at OpenRouter")
    print("2. Go to Keys section")
    print("3. Create new API key")
    print("4. Copy the key for OPENROUTER_API_KEY environment variable")
    
    if input("\nOpen OpenRouter? (y/n): ").lower() == 'y':
        webbrowser.open("https://openrouter.ai/keys")
        time.sleep(2)
    
    print("\n✅ Environment Variables for Render:")
    print("Copy these to Render Environment Variables section:")
    print("-" * 50)
    print("KIRIO_CORTEX_MASTER_KEY=ad222333")
    print("GOOGLE_API_KEY=your-google-api-key-here")
    print("GROQ_API_KEY=your-groq-api-key-here")
    print("OPENROUTER_API_KEY=your-openrouter-key-here")
    print("DATABASE_URL=sqlite+aiosqlite:///./cortex.db")
    print("QDRANT_URL=http://localhost:6333")
    print("QDRANT_COLLECTION=cortex_memory")
    print("-" * 50)
    
    print("\n🚀 Ready for Render Deployment!")
    print("Follow the RENDER_V2.5_DEPLOYMENT_GUIDE.md for complete instructions.")

if __name__ == "__main__":
    main()