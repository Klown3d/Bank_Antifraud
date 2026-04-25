from rest_framework import serializers
from .models import AlertaFraude

class AlertaFraudeSerializer(serializers.ModelSerializer):
    cuenta_afectada_numero = serializers.CharField(source='cuenta_afectada.numero_cuenta', read_only=True)
    usuario_afectado = serializers.CharField(source='cuenta_afectada.usuario.username', read_only=True)
    monto_transaccion = serializers.DecimalField(source='transaccion.monto', max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = AlertaFraude
        fields = [
            'id', 'nivel_riesgo', 'motivo', 'regla_disparada', 'fecha_creacion',
            'revisada', 'resolucion', 'cuenta_afectada_numero', 'usuario_afectado',
            'monto_transaccion'
        ]
