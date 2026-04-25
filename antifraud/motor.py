from django.utils import timezone
from datetime import timedelta
from antifraud.models import AlertaFraude
from core.models import Transaccion

class MotorAntifraude:
    """
    Motor central de evaluación de riesgos para transacciones bancarias.
    Retorna un diccionario con el nivel de riesgo detectado y el motivo (si lo hay).
    """

    LIMITE_MONTO_ALTO = 500000  # Ejemplo: $500,000
    LIMITE_MONTO_CRITICO = 2000000 # Ejemplo: $2,000,000
    TIEMPO_VELOCIDAD_MINUTOS = 10
    LIMITE_TRANSACCIONES_RAFAGA = 3

    @staticmethod
    def evaluar_transferencia(cuenta_origen, monto, client_ip):
        monto = float(monto)
        riesgo = 'BAJO'
        motivo = []
        regla_disparada = None

        # 1. Regla de Monto Anómalo
        if monto >= MotorAntifraude.LIMITE_MONTO_CRITICO:
            riesgo = 'CRITICO'
            motivo.append(f"Monto excepcionalmente alto detectado (${monto}).")
            regla_disparada = "REGLA_MONTO_CRITICO"
        elif monto >= MotorAntifraude.LIMITE_MONTO_ALTO:
            riesgo = 'ALTO'
            motivo.append(f"Monto alto detectado (${monto}).")
            regla_disparada = "REGLA_MONTO_ALTO"

        # 1.5 Regla de Vaciado de Cuenta (Más del 95% del saldo)
        if cuenta_origen.saldo > 0 and monto >= float(cuenta_origen.saldo) * 0.95:
            if riesgo != 'CRITICO':
                riesgo = 'ALTO'
            motivo.append("Intento de transferencia por casi la totalidad de los fondos (Posible vaciado de cuenta).")
            if not regla_disparada:
                regla_disparada = "REGLA_VACIADO_CUENTA"

        # 2. Regla de Velocidad (Ráfaga de transacciones)
        hace_10_min = timezone.now() - timedelta(minutes=MotorAntifraude.TIEMPO_VELOCIDAD_MINUTOS)
        transferencias_recientes = Transaccion.objects.filter(
            cuenta_origen=cuenta_origen,
            fecha__gte=hace_10_min
        ).count()

        if transferencias_recientes >= MotorAntifraude.LIMITE_TRANSACCIONES_RAFAGA:
            riesgo = 'CRITICO'
            motivo.append(f"Ráfaga de {transferencias_recientes + 1} transacciones en menos de 10 minutos.")
            regla_disparada = "REGLA_VELOCIDAD_CUENTA"

        # 3. Regla de Reputación IP
        # Verificar si esta misma IP tuvo transacciones bloqueadas o asociadas a fraude recientemente
        alertas_ip = Transaccion.objects.filter(
            ip_origen=client_ip,
            alertas__nivel_riesgo__in=['ALTO', 'CRITICO'],
            fecha__gte=timezone.now() - timedelta(days=1)
        ).count()

        if alertas_ip > 0:
            riesgo = 'CRITICO'
            motivo.append("La dirección IP de origen tiene un historial reciente de transacciones fraudulentas.")
            regla_disparada = "REGLA_IP_RIESGO"

        if riesgo != 'BAJO':
            return {
                'es_fraude': True,
                'nivel_riesgo': riesgo,
                'motivo': " | ".join(motivo),
                'regla_disparada': regla_disparada
            }

        return {
            'es_fraude': False,
            'nivel_riesgo': 'BAJO',
            'motivo': 'Transacción normal',
            'regla_disparada': None
        }
