import os
import sys
import django

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

try:
    # Ensure user exists and is not verified
    u, _ = User.objects.get_or_create(username='test_resend_user', email='mrbluesky0011@gmail.com')
    u.is_email_verified = False
    u.set_password('Password123!')
    u.save()
    
    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(u)
    access_token = str(refresh.access_token)
    
    from django.test import Client
    client = Client()
    response = client.post('/api/core/resend-verification/', HTTP_AUTHORIZATION=f'Bearer {access_token}')
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
