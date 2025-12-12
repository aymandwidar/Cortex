"""Create a new API key for testing."""

import requests

master_key = "dev-master-key-change-in-production"

response = requests.post(
    "http://127.0.0.1:8080/admin/v1/generate_key",
    headers={
        "Authorization": f"Bearer {master_key}",
        "Content-Type": "application/json"
    },
    json={
        "name": "Playground Test Key",
        "user_id": "playground-user",
        "metadata": {"purpose": "testing"}
    }
)

if response.status_code == 200:
    data = response.json()
    print(f"✓ API Key created successfully!")
    print(f"Key: {data['key']}")
    print(f"\nSave this key for testing.")
else:
    print(f"✗ Failed: {response.text}")
