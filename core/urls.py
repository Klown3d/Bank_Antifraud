from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CuentaViewSet, TransaccionViewSet, RealizarTransferenciaView

router = DefaultRouter()
router.register(r'cuentas', CuentaViewSet, basename='cuenta')
router.register(r'transacciones', TransaccionViewSet, basename='transaccion')

urlpatterns = [
    path('', include(router.urls)),
    path('transferir/', RealizarTransferenciaView.as_view(), name='realizar-transferencia'),
]
