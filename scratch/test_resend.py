import requests
import json

# Login first to get JWT token
login_url = "http://localhost:8000/api/token/"
login_payload = {
    "username": "testuser_flow",
    "password": "Password123!"
}
login_response = requests.post(login_url, json=login_payload)
if login_response.status_code != 200:
    print(f"Login failed: {login_response.text}")
    exit()

access_token = login_response.json()['access']
headers = {
    'Authorization': f'Bearer {access_token}'
}

# Now call resend-verification
resend_url = "http://localhost:8000/api/core/resend-verification/"
try:
    response = requests.post(resend_url, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
