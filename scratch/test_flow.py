import os
import sys
import django

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

try:
    # Delete if exists
    User.objects.filter(username='testuser_flow').delete()
    
    # Create user
    u = User.objects.create_user(
        username='testuser_flow',
        email='testflow@example.com',
        password='Password123!',
        dni='123123123'
    )
    token = str(u.verification_token)
    print(f"Created user with token: {token}")
    
    # Test verification
    from django.test import Client
    client = Client()
    response = client.post(f'/api/core/verify-email/{token}/')
    print(f"Verification status: {response.status_code}")
    print(f"Verification response: {response.json()}")
    
    u.refresh_from_db()
    print(f"Is verified in DB: {u.is_email_verified}")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
