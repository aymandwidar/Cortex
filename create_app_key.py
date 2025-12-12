"""Create an API key for your app."""

import requests

# Your master key
master_key = "dev-master-key-change-in-production"

# Create API key for your app
response = requests.post(
    "http://localhost:8080/admin/v1/generate_key",
    headers={
        "Authorization": f"Bearer {master_key}",
        "Content-Type": "application/json"
    },
    json={
        "name": "My App",
        "user_id": "my-app-user",
        "metadata": {
            "app": "mobile",
            "environment": "development"
        }
    }
)

if response.status_code == 200:
    data = response.json()
    api_key = data["key"]
    
    print("="*80)
    print("API KEY CREATED FOR YOUR APP!")
    print("="*80)
    print(f"\nAPI Key: {api_key}")
    print(f"\nKey ID: {data['key_id']}")
    print(f"User ID: {data['user_id']}")
    print(f"Created: {data['created_at']}")
    print("\n" + "="*80)
    print("SAVE THIS KEY - You won't see it again!")
    print("="*80)
    print("\nUse this key in your app to call Cortex API")
    
else:
    print(f"Failed: {response.text}")
