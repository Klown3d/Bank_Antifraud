from rest_framework import serializers
from .models import Cuenta, Transaccion, Reserva, Inversion

class ReservaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reserva
        fields = ['id', 'cuenta', 'nombre', 'objetivo_monto', 'saldo_acumulado', 'fecha_creacion']
        read_only_fields = ['id', 'cuenta', 'fecha_creacion']

class InversionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inversion
        fields = ['id', 'cuenta', 'tipo', 'monto_invertido', 'rendimiento_diario_estimado', 'fecha_inversion']
        read_only_fields = ['id', 'cuenta', 'rendimiento_diario_estimado', 'fecha_inversion']

class CuentaSerializer(serializers.ModelSerializer):
    nivel_confidencialidad = serializers.SerializerMethodField()
    reservas = ReservaSerializer(many=True, read_only=True)
    inversiones = InversionSerializer(many=True, read_only=True)

    class Meta:
        model = Cuenta
        fields = ['id', 'numero_cuenta', 'tipo_cuenta', 'saldo', 'estado', 'fecha_creacion', 'limite_transferencia_diaria', 'nivel_confidencialidad', 'reservas', 'inversiones']
        read_only_fields = ['id', 'numero_cuenta', 'saldo', 'fecha_creacion']

    def get_nivel_confidencialidad(self, obj):
        return obj.get_nivel_confidencialidad()

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

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    
    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'dni', 'telefono')
        
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            dni=validated_data.get('dni', ''),
            telefono=validated_data.get('telefono', '')
        )
        return user
