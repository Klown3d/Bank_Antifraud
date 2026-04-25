import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User, Cuenta, Reserva, Inversion

def add_dummy_data():
    try:
        user = User.objects.get(username='klown3d')
        cuenta = Cuenta.objects.filter(usuario=user).first()
        if cuenta:
            if not Reserva.objects.filter(cuenta=cuenta).exists():
                Reserva.objects.create(
                    cuenta=cuenta,
                    nombre='Vacaciones 2026',
                    objetivo_monto=500000.00,
                    saldo_acumulado=150000.00
                )
                print("Reserva de Vacaciones creada.")
            
            if not Inversion.objects.filter(cuenta=cuenta).exists():
                Inversion.objects.create(
                    cuenta=cuenta,
                    tipo='FCI',
                    monto_invertido=250000.00,
                    rendimiento_diario_estimado=0.07 # 7%
                )
                print("Inversión en FCI creada.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    add_dummy_data()
