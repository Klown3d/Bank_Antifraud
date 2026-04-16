from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid
import random
import string

class User(AbstractUser):
    ESTADOS = (
        ('ACTIVO', 'Activo'),
        ('INACTIVO', 'Inactivo'),
    )
    
    dni = models.CharField(max_length=20, unique=True)
    telefono = models.CharField(max_length=20, blank=True, null=True)
    fecha_nacimiento = models.DateField(blank=True, null=True)
    direccion = models.CharField(max_length=255, blank=True, null=True)
    estado = models.CharField(max_length=15, choices=ESTADOS, default='ACTIVO')

    def __str__(self):
        return f"{self.username} - {self.dni}"

def generate_account_number():
    return ''.join(random.choices(string.digits, k=12))

class Cuenta(models.fields.Field):
    pass # Reemplazar después para no fallar el orden, se declara abajo

class Cuenta(models.Model):
    TIPOS_CUENTA = (
        ('CAJA_AHORRO', 'Caja de Ahorro'),
        ('CUENTA_CORRIENTE', 'Cuenta Corriente'),
    )
    ESTADOS_CUENTA = (
        ('ACTIVA', 'Activa'),
        ('BLOQUEADA', 'Bloqueada'),
        ('CERRADA', 'Cerrada'),
    )

    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cuentas')
    numero_cuenta = models.CharField(max_length=20, unique=True, default=generate_account_number, db_index=True)
    tipo_cuenta = models.CharField(max_length=20, choices=TIPOS_CUENTA, default='CAJA_AHORRO')
    saldo = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    estado = models.CharField(max_length=15, choices=ESTADOS_CUENTA, default='ACTIVA')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    limite_transferencia_diaria = models.DecimalField(max_digits=12, decimal_places=2, default=100000.00)

    def __str__(self):
        return f"Cuenta {self.numero_cuenta} - {self.usuario.username} (${self.saldo})"

class Transaccion(models.Model):
    ESTADOS_TRANSACCION = (
        ('PENDIENTE', 'Pendiente'),
        ('COMPLETADA', 'Completada'),
        ('RECHAZADA', 'Rechazada'),
        ('SOSPECHOSA', 'Sospechosa'),
    )
    TIPOS_TRANSACCION = (
        ('TRANSFERENCIA', 'Transferencia'),
        ('DEPOSITO', 'Depósito'),
        ('RETIRO', 'Retiro'),
    )

    cuenta_origen = models.ForeignKey(Cuenta, on_delete=models.SET_NULL, null=True, related_name='transacciones_origen')
    cuenta_destino = models.ForeignKey(Cuenta, on_delete=models.SET_NULL, null=True, related_name='transacciones_destino')
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    fecha = models.DateTimeField(auto_now_add=True, db_index=True)
    estado = models.CharField(max_length=15, choices=ESTADOS_TRANSACCION, default='PENDIENTE', db_index=True)
    tipo = models.CharField(max_length=15, choices=TIPOS_TRANSACCION)
    descripcion = models.TextField(blank=True, null=True)
    ip_origen = models.GenericIPAddressField(blank=True, null=True)

    class Meta:
        indexes = [
            models.Index(fields=['cuenta_origen', 'fecha']),
        ]

    def __str__(self):
        return f"{self.tipo} - {self.monto} - {self.estado}"

class LogAuditoria(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    accion = models.CharField(max_length=100)
    detalle = models.JSONField(default=dict)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    exitoso = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.timestamp} - {self.accion} - Exitoso: {self.exitoso}"


