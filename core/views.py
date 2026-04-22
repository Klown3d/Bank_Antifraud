from rest_framework import viewsets, views, status, permissions
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from .models import Cuenta, Transaccion, LogAuditoria
from .serializers import CuentaSerializer, TransaccionSerializer, TransferenciaRequestSerializer

class CuentaViewSet(viewsets.ModelViewSet):
    serializer_class = CuentaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Cuenta.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

class TransaccionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TransaccionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Transaccion.objects.filter(cuenta_origen__usuario=self.request.user) | \
               Transaccion.objects.filter(cuenta_destino__usuario=self.request.user)


class RealizarTransferenciaView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = TransferenciaRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        cuenta_origen_id = data['cuenta_origen_id']
        cuenta_destino_numero = data['cuenta_destino_numero']
        monto = data['monto']
        descripcion = data.get('descripcion', '')
        
        client_ip = request.META.get('REMOTE_ADDR')

        # Transacción ACID
        try:
            with transaction.atomic():
              
                cuenta_origen = Cuenta.objects.select_for_update().get(id=cuenta_origen_id, usuario=request.user)
                
                if cuenta_origen.estado != 'ACTIVA':
                    raise ValueError('La cuenta de origen no está activa.')

                cuenta_destino = Cuenta.objects.select_for_update().get(numero_cuenta=cuenta_destino_numero)
                
                if cuenta_destino.estado != 'ACTIVA':
                    raise ValueError('La cuenta de destino no está activa.')
                
                if cuenta_origen.saldo < monto:
                    raise ValueError('Saldo insuficiente para realizar la transferencia.')

                if cuenta_origen.id == cuenta_destino.id:
                    raise ValueError('No puedes transferir a la misma cuenta.')

                # Ejecutar la transferencia
                cuenta_origen.saldo -= monto
                cuenta_origen.save()

                cuenta_destino.saldo += monto
                cuenta_destino.save()

                transaccion = Transaccion.objects.create(
                    cuenta_origen=cuenta_origen,
                    cuenta_destino=cuenta_destino,
                    monto=monto,
                    estado='COMPLETADA', 
                    tipo='TRANSFERENCIA',
                    descripcion=descripcion,
                    ip_origen=client_ip
                )

                # Auditoría
                LogAuditoria.objects.create(
                    usuario=request.user,
                    accion='TRANSFERENCIA_REALIZADA',
                    detalle={'transaccion_id': transaccion.id, 'monto': str(monto), 'origen': cuenta_origen.numero_cuenta, 'destino': cuenta_destino.numero_cuenta},
                    ip_address=client_ip,
                    exitoso=True
                )

            return Response({
                'mensaje': 'Transferencia completada exitosamente.',
                'transaccion_id': transaccion.id,
                'nuevo_saldo': cuenta_origen.saldo
            }, status=status.HTTP_201_CREATED)

        except Cuenta.DoesNotExist as e:
            return Response({'error': 'Cuenta de origen o destino no encontrada o no autorizada.'}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
           
            LogAuditoria.objects.create(
                usuario=request.user,
                accion='TRANSFERENCIA_FALLIDA',
                detalle={'error': str(e)},
                ip_address=client_ip,
                exitoso=False
            )
            return Response({'error': 'Ocurrió un error inesperado al procesar la transferencia.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
