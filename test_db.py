import psycopg2
import os
from dotenv import load_dotenv

load_dotenv('.env')

DB_NAME = os.getenv('DB_NAME', 'bank_db')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'postgres')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')

try:
    con = psycopg2.connect(dbname='postgres', user=DB_USER, password=DB_PASSWORD, host=DB_HOST, port=DB_PORT)
    print("Conexión exitosa a postgres")
except Exception as e:
    print(f"Error de conexión: {str(e).encode('utf-8', errors='ignore')}")
