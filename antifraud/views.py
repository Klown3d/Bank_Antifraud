from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import AlertaFraude
from .serializers import AlertaFraudeSerializer

class AlertaFraudeViewSet(viewsets.ModelViewSet):
    """
    API para que los administradores revisen las Alertas de Fraude generadas por el Motor.
    """
    queryset = AlertaFraude.objects.all().order_by('-fecha_creacion')
    serializer_class = AlertaFraudeSerializer
    permission_classes = [permissions.IsAuthenticated] # En producción debería ser IsAdminUser
    
    @action(detail=True, methods=['post'])
    def resolver(self, request, pk=None):
        alerta = self.get_object()
        resolucion = request.data.get('resolucion')
        
        if resolucion not in ['CONFIRMADA', 'DESCARTADA']:
            return Response({"error": "Resolución inválida."}, status=status.HTTP_400_BAD_REQUEST)
            
        alerta.resolucion = resolucion
        alerta.revisada = True
        alerta.save()
        
        # Si se confirma, podríamos bloquear la cuenta permanentemente aquí.
        if resolucion == 'CONFIRMADA':
            cuenta = alerta.cuenta_afectada
            cuenta.estado = 'BLOQUEADA'
            cuenta.save()
            
        return Response({"status": "Alerta resuelta.", "nueva_resolucion": resolucion})
