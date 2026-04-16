from django.db import models
from core.models import Transaccion, Cuenta

class AlertaFraude(models.Model):
    NIVELES_RIESGO = (
        ('BAJO', 'Bajo'),
        ('MEDIO', 'Medio'),
        ('ALTO', 'Alto'),
        ('CRITICO', 'Crítico'),
    )
    RESOLUCIONES = (
        ('PENDIENTE', 'Pendiente'),
        ('DESCARTADA', 'Descartada'),
        ('CONFIRMADA', 'Confirmada'),
    )

    transaccion = models.ForeignKey(Transaccion, on_delete=models.CASCADE, null=True, blank=True, related_name='alertas')
    cuenta_afectada = models.ForeignKey(Cuenta, on_delete=models.CASCADE, related_name='alertas')
    nivel_riesgo = models.CharField(max_length=10, choices=NIVELES_RIESGO, db_index=True)
    motivo = models.TextField()
    regla_disparada = models.CharField(max_length=100)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    revisada = models.BooleanField(default=False)
    resolucion = models.CharField(max_length=15, choices=RESOLUCIONES, default='PENDIENTE')

    def __str__(self):
        return f"Alerta {self.nivel_riesgo} - Cuenta {self.cuenta_afectada.numero_cuenta}"
