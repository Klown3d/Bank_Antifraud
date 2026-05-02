from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CuentaViewSet, TransaccionViewSet, RealizarTransferenciaView, ReservaViewSet, InversionViewSet, ContactosView, RegisterView, VerifyEmailView, AbrirCuentaView, ProfileView, ResendVerificationView

router = DefaultRouter()
router.register(r'cuentas', CuentaViewSet, basename='cuenta')
router.register(r'transacciones', TransaccionViewSet, basename='transaccion')
router.register(r'reservas', ReservaViewSet, basename='reserva')
router.register(r'inversiones', InversionViewSet, basename='inversion')

urlpatterns = [
    path('cuentas/abrir/', AbrirCuentaView.as_view(), name='abrir-cuenta'),
    path('', include(router.urls)),
    path('transferir/', RealizarTransferenciaView.as_view(), name='realizar-transferencia'),
    path('contactos/', ContactosView.as_view(), name='contactos'),
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-email/<uuid:token>/', VerifyEmailView.as_view(), name='verify-email'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('resend-verification/', ResendVerificationView.as_view(), name='resend-verification'),
]
