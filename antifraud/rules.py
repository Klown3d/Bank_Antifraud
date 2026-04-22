from datetime import timedelta
from django.utils import timezone
from core.models import Cuenta, Transaccion
from antifraud.models import AlertaFraude

def evaluate_transaction_risk(cuenta_origen, monto):
    """
    Evalúa el riesgo de una transacción basándose en reglas heurísticas.
    Retorna (score total, lista de reglas que se rompieron).
    """
    score = 0
    reglas_rotas = []
    ahora = timezone.now()

    # 1. Regla de Cuentas Nuevas (Menos de 24 hs de antigüedad)
    # Si la cuenta tiene menos de 24 horas e intenta mover fondos.
    if cuenta_origen.fecha_creacion and (ahora - cuenta_origen.fecha_creacion) < timedelta(hours=24):
        score += 30
        reglas_rotas.append('CUENTA_NUEVA_MENOS_24H')

    # 2. Regla de Frecuencia (Velocidad de Transferencias)
    # Más de 3 transferencias en los últimos 15 minutos
    hace_15_minutos = ahora - timedelta(minutes=15)
    tx_recientes = Transaccion.objects.filter(
        cuenta_origen=cuenta_origen, 
        fecha__gte=hace_15_minutos
    ).count()

    if tx_recientes >= 3:
        score += 50
        reglas_rotas.append(f'ALTA_FRECUENCIA_{tx_recientes}_TX_15M')

    # 3. Regla de Monto Altamente Inusual
    # Montos gigantes tienen un flag implícito
    if monto > 800000:
        score += 60
        reglas_rotas.append('MONTO_MUY_ALTO_MAYOR_800K')
    elif monto > 300000:
        score += 30
        reglas_rotas.append('MONTO_ELEVADO_MAYOR_300K')

    # 4. Horarios Inusuales (Opcional, e.g. Madrugada)
    hora_actual = ahora.hour
    if 2 <= hora_actual <= 5:
        score += 20
        reglas_rotas.append('HORARIO_MADRUGADA')

    return score, reglas_rotas
