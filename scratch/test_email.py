import os
import sys
import django

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings

try:
    print(f"Using EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
    print(f"Using DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
    
    send_mail(
        'Test Subject',
        'Test Message',
        settings.DEFAULT_FROM_EMAIL,
        ['mrbluesky0011@gmail.com'], # Sending to self for test
        fail_silently=False,
    )
    print("Email sent successfully!")
except Exception as e:
    print(f"Failed to send email: {e}")
    import traceback
    traceback.print_exc()
