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

                # --- MOTOR ANTIFRAUDE ---
                from antifraud.motor import MotorAntifraude
                from antifraud.models import AlertaFraude
                
                evaluacion = MotorAntifraude.evaluar_transferencia(cuenta_origen, monto, client_ip)
                if evaluacion['es_fraude']:
                    # Guardar el registro bloqueado para auditoría de seguridad
                    transaccion_bloqueada = Transaccion.objects.create(
                        cuenta_origen=cuenta_origen,
                        cuenta_destino=cuenta_destino,
                        monto=monto,
                        estado='BLOQUEADA', 
                        tipo='TRANSFERENCIA',
                        descripcion=descripcion + ' (BLOQUEADA POR FRAUDE)',
                        ip_origen=client_ip
                    )
                    
                    # Disparar alerta en la base de datos para los analistas de fraude
                    AlertaFraude.objects.create(
                        transaccion=transaccion_bloqueada,
                        cuenta_afectada=cuenta_origen,
                        nivel_riesgo=evaluacion['nivel_riesgo'],
                        motivo=evaluacion['motivo'],
                        regla_disparada=evaluacion['regla_disparada']
                    )
                    
                    raise ValueError(f"Transacción retenida por el Motor de Seguridad (Riesgo {evaluacion['nivel_riesgo']}).")
                # ------------------------

                # Ejecutar la transferencia (Si pasó los filtros)
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

from .models import Reserva, Inversion
from .serializers import ReservaSerializer, InversionSerializer

from rest_framework.decorators import action

class ReservaViewSet(viewsets.ModelViewSet):
    serializer_class = ReservaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Reserva.objects.filter(cuenta__usuario=self.request.user)

    def perform_create(self, serializer):
        # Default create to the first active account of the user
        cuenta = Cuenta.objects.filter(usuario=self.request.user, estado='ACTIVA').first()
        if not cuenta:
            raise ValueError('No tienes cuentas activas.')
        serializer.save(cuenta=cuenta)

    @action(detail=True, methods=['post'])
    def depositar(self, request, pk=None):
        from decimal import Decimal
        try:
            monto = Decimal(str(request.data.get('monto', 0)))
        except:
            return Response({"error": "Monto inválido."}, status=status.HTTP_400_BAD_REQUEST)
            
        if monto <= 0:
            return Response({"error": "El monto debe ser mayor a 0."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            with transaction.atomic():
                reserva = Reserva.objects.select_for_update().get(pk=pk, cuenta__usuario=request.user)
                cuenta = Cuenta.objects.select_for_update().get(pk=reserva.cuenta.id)
                
                if cuenta.saldo < monto:
                    return Response({"error": "Saldo insuficiente en tu caja de ahorro."}, status=status.HTTP_400_BAD_REQUEST)
                
                cuenta.saldo -= monto
                cuenta.save()
                
                reserva.saldo_acumulado += monto
                reserva.save()
                
            return Response({"mensaje": f"Depositaste ${monto} en tu reserva.", "nuevo_saldo_reserva": reserva.saldo_acumulado})
        except Reserva.DoesNotExist:
            return Response({"error": "Reserva no encontrada."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def retirar(self, request, pk=None):
        from decimal import Decimal
        try:
            monto = Decimal(str(request.data.get('monto', 0)))
        except:
            return Response({"error": "Monto inválido."}, status=status.HTTP_400_BAD_REQUEST)

        if monto <= 0:
            return Response({"error": "El monto debe ser mayor a 0."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            with transaction.atomic():
                reserva = Reserva.objects.select_for_update().get(pk=pk, cuenta__usuario=request.user)
                cuenta = Cuenta.objects.select_for_update().get(pk=reserva.cuenta.id)
                
                if reserva.saldo_acumulado < monto:
                    return Response({"error": "Saldo insuficiente en tu reserva."}, status=status.HTTP_400_BAD_REQUEST)
                
                reserva.saldo_acumulado -= monto
                reserva.save()
                
                cuenta.saldo += monto
                cuenta.save()
                
            return Response({"mensaje": f"Retiraste ${monto} de tu reserva.", "nuevo_saldo_reserva": reserva.saldo_acumulado})
        except Reserva.DoesNotExist:
            return Response({"error": "Reserva no encontrada."}, status=status.HTTP_404_NOT_FOUND)

class InversionViewSet(viewsets.ModelViewSet):
    serializer_class = InversionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Inversion.objects.filter(cuenta__usuario=self.request.user)

class ContactosView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        # Cuentas a las que les hemos transferido
        txs = Transaccion.objects.filter(cuenta_origen__usuario=request.user).select_related('cuenta_destino', 'cuenta_destino__usuario')
        contactos_dict = {}
        for tx in txs:
            cd = tx.cuenta_destino
            if cd and cd.numero_cuenta not in contactos_dict:
                contactos_dict[cd.numero_cuenta] = {
                    'numero_cuenta': cd.numero_cuenta,
                    'nombre': cd.usuario.username,
                    'nivel_confidencialidad': cd.get_nivel_confidencialidad()
                }
        return Response(list(contactos_dict.values()))

from django.core.mail import send_mail
from django.conf import settings
from .serializers import RegisterSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            verify_url = f"http://localhost:5173/verify-email/{user.verification_token}"
            try:
                send_mail(
                    'Verifica tu correo en BlueSky',
                    f'Bienvenido a BlueSky.\n\nHaz click en el siguiente enlace para verificar tu cuenta:\n{verify_url}',
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=False,
                )
            except Exception as e:
                print("Error sending email:", e)
            return Response({"mensaje": "Usuario creado. Revisa tu correo."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyEmailView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, token):
        print(f"DEBUG: Received token {token}")
        try:
            user = User.objects.get(verification_token=token)
            user.is_email_verified = True
            # No anulamos el token por si el usuario hace refresh
            user.save()
            return Response({"mensaje": "Correo verificado."})
        except User.DoesNotExist:
            return Response({"error": "Token inválido."}, status=status.HTTP_400_BAD_REQUEST)

class AbrirCuentaView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if not request.user.is_email_verified:
            return Response({"error": "Debe verificar su correo para abrir cuentas bancarias."}, status=status.HTTP_403_FORBIDDEN)
        
        if Cuenta.objects.filter(usuario=request.user).exists():
            return Response({"error": "Ya tienes una cuenta registrada en BlueSky."}, status=status.HTTP_400_BAD_REQUEST)
        
        cuenta = Cuenta.objects.create(usuario=request.user)
        return Response({"mensaje": "Cuenta abierta exitosamente.", "cbu": cuenta.numero_cuenta}, status=status.HTTP_201_CREATED)

class ProfileView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "username": user.username,
            "email": user.email,
            "dni": user.dni,
            "telefono": user.telefono,
            "is_email_verified": user.is_email_verified
        })

class ResendVerificationView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.is_email_verified:
            return Response({"error": "Su correo ya está verificado."}, status=status.HTTP_400_BAD_REQUEST)
        
        print(f"DEBUG: Resending for user {user.username} ({user.email})")
        import uuid
        user.verification_token = uuid.uuid4()
        print(f"DEBUG: New token generated: {user.verification_token}")
        user.save()
        print("DEBUG: User saved successfully")
        
        verify_url = f"http://localhost:5173/verify-email/{user.verification_token}"
        print(f"DEBUG: Verify URL: {verify_url}")
        try:
            send_mail(
                'Reenvío: Verifica tu correo en BlueSky',
                f'Has solicitado reenviar el correo de verificación.\n\nHaz click en el siguiente enlace:\n{verify_url}',
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
            return Response({"mensaje": "Correo reenviado."})
        except Exception as e:
            return Response({"error": f"Error al enviar correo: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
