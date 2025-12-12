#!/usr/bin/env python3
"""
Debug the Playground initialization issue
"""

import requests
import json

# Render backend URL
BASE_URL = "https://cortex-v25-cloud-native.onrender.com"
MASTER_KEY = "ad222333"

def test_health():
    """Test if backend is responding"""
    print("🔍 Testing backend health...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        print(f"Health Status: {response.status_code}")
        print(f"Response: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_admin_generate_key():
    """Test the admin generate key endpoint that Playground uses"""
    print("\n🔑 Testing admin generate key endpoint...")
    try:
        response = requests.post(
            f"{BASE_URL}/admin/v1/generate_key",
            headers={
                'Authorization': f'Bearer {MASTER_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'name': 'Playground Test Key',
                'user_id': 'playground-user',
                'metadata': {'purpose': 'playground-testing'}
            },
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API key created: {data.get('key', 'N/A')[:10]}...")
            return data.get('key')
        else:
            print(f"❌ Failed to create API key")
            return None
            
    except Exception as e:
        print(f"❌ Generate key failed: {e}")
        return None

def test_chat_with_api_key(api_key):
    """Test chat endpoint with the generated API key"""
    if not api_key:
        print("\n⚠️ No API key to test chat with")
        return
        
    print(f"\n💬 Testing chat with API key...")
    try:
        response = requests.post(
            f"{BASE_URL}/v1/chat/completions",
            headers={
                'Authorization': f'Bearer {api_key}',
                'Content-Type': 'application/json'
            },
            json={
                'model': 'auto',
                'messages': [
                    {'role': 'user', 'content': 'Hello! Test message'}
                ]
            },
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Chat working! Model: {data.get('model', 'unknown')}")
            print(f"Response: {data['choices'][0]['message']['content'][:100]}...")
        else:
            print(f"❌ Chat failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Chat test failed: {e}")

def test_admin_endpoints():
    """Test various admin endpoints"""
    print(f"\n🔧 Testing admin endpoints...")
    
    endpoints = [
        "/admin/v1/keys",
        "/admin/v1/models", 
        "/admin/v1/settings/providers"
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(
                f"{BASE_URL}{endpoint}",
                headers={'Authorization': f'Bearer {MASTER_KEY}'},
                timeout=10
            )
            print(f"{endpoint}: {response.status_code}")
            if response.status_code != 200:
                print(f"  Error: {response.text[:100]}")
        except Exception as e:
            print(f"{endpoint}: ERROR - {e}")

def main():
    print("🚀 Debugging Playground Initialization Issue")
    print("=" * 50)
    print(f"Backend URL: {BASE_URL}")
    print(f"Master Key: {MASTER_KEY}")
    print()
    
    # Test 1: Health check
    health_ok = test_health()
    
    # Test 2: Admin endpoints
    test_admin_endpoints()
    
    # Test 3: Generate API key (what Playground does)
    api_key = test_admin_generate_key()
    
    # Test 4: Chat with generated key
    test_chat_with_api_key(api_key)
    
    print("\n" + "=" * 50)
    if health_ok and api_key:
        print("✅ Backend seems to be working correctly")
        print("🤔 Issue might be in mobile app or CORS")
    else:
        print("❌ Backend has issues that need fixing")

if __name__ == "__main__":
    main()