from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AlertaFraudeViewSet

router = DefaultRouter()
router.register(r'alertas', AlertaFraudeViewSet, basename='alerta-fraude')

urlpatterns = [
    path('', include(router.urls)),
]
