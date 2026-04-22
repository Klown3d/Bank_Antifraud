import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from core.models import User, Cuenta
from django.contrib.auth.hashers import make_password

def create_user():
    username = 'klown3d'
    password = '0982'
    
    if User.objects.filter(username=username).exists():
        print(f"El usuario {username} ya existe.")
        user = User.objects.get(username=username)
    else:
        user = User.objects.create(
            username=username,
            dni='12345678',
            password=make_password(password),
            telefono='555-1234'
        )
        print(f"Usuario {username} creado exitosamente.")

    # Crear cuenta de origen
    if not Cuenta.objects.filter(usuario=user, tipo_cuenta='CAJA_AHORRO').exists():
        Cuenta.objects.create(
            usuario=user,
            tipo_cuenta='CAJA_AHORRO',
            saldo=1000000.00, # 1 millón inicial
            numero_cuenta='100000000001'
        )
        print("Cuenta de Ahorro creada con $1,000,000 inicial.")

    # Para poder hacer transferencias a alguien, creamos otro usuario de destino
    destino_user_name = "tienda_destino"
    if not User.objects.filter(username=destino_user_name).exists():
        destino_user = User.objects.create(
            username=destino_user_name,
            dni='99999999',
            password=make_password(password)
        )
        Cuenta.objects.create(
            usuario=destino_user,
            tipo_cuenta='CUENTA_CORRIENTE',
            saldo=0.00,
            numero_cuenta='200000000002'
        )
        print(f"Usuario destino {destino_user_name} creado para pruebas con su cuenta.")

if __name__ == '__main__':
    create_user()
