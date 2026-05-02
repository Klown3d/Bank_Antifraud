import requests
import json

url = "http://localhost:8000/api/core/register/"
payload = {
    "username": "newuser456",
    "email": "test456@example.com",
    "password": "TestPass123!",
    "dni": "1122334455",
    "telefono": "123456"
}
headers = {'Content-Type': 'application/json'}

try:
    response = requests.post(url, data=json.dumps(payload), headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
