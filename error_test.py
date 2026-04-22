import psycopg2
import os
from dotenv import load_dotenv

# Force postgres connection error messages to be in English to avoid UnicodeDecodeError
os.environ['LC_ALL'] = 'C'

load_dotenv('.env')

DB_NAME = os.getenv('DB_NAME', 'bank_db')
DB_USER = os.getenv('DB_USER', 'postgres')
DB_PASSWORD = os.getenv('DB_PASSWORD', '0982')
DB_HOST = os.getenv('DB_HOST', '127.0.0.1')
DB_PORT = os.getenv('DB_PORT', '5432')

try:
    con = psycopg2.connect(dbname='postgres', user=DB_USER, password=DB_PASSWORD, host=DB_HOST, port=DB_PORT)
    print("Conexión SUPER EXITOSA a postgres")
except psycopg2.OperationalError as e:
    # Attempt to grab the bytes and decode as cp1252 to see what it actually is saying
    try:
        raw_bytes = str(e).encode('utf-8')
        print(f"Error parseado UTF-8: {raw_bytes}")
    except Exception:
        pass
    print("Error general catchado")
except Exception as e:
    import traceback
    traceback.print_exc()
    try:
        # e.args[0] is the error message string which contains the badly decoded characters
        error_msg = str(e)
        print("Raw error:", repr(error_msg))
    except:
        pass
