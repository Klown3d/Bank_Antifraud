from rest_framework import serializers
from .models import Cuenta, Transaccion

class CuentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cuenta
        fields = ['id', 'numero_cuenta', 'tipo_cuenta', 'saldo', 'estado', 'fecha_creacion', 'limite_transferencia_diaria']
        read_only_fields = ['id', 'numero_cuenta', 'saldo', 'fecha_creacion']

class TransaccionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaccion
        fields = ['id', 'cuenta_origen', 'cuenta_destino', 'monto', 'fecha', 'estado', 'tipo', 'descripcion']
        read_only_fields = ['id', 'fecha', 'estado']

class TransferenciaRequestSerializer(serializers.Serializer):
    cuenta_origen_id = serializers.IntegerField()
    cuenta_destino_numero = serializers.CharField(max_length=20)
    monto = serializers.DecimalField(max_digits=12, decimal_places=2)
    descripcion = serializers.CharField(max_length=255, required=False, allow_blank=True)

    def validate_monto(self, value):
        if value <= 0:
            raise serializers.ValidationError("El monto debe ser mayor a 0.")
        return value
