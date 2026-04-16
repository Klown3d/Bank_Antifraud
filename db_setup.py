import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
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
    con.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    cur = con.cursor()
    cur.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{DB_NAME}'")
    exists = cur.fetchone()
    if not exists:
        print(f"Creating database {DB_NAME}...")
        cur.execute(f"CREATE DATABASE {DB_NAME}")
    else:
        print(f"Database {DB_NAME} already exists.")
    cur.close()
    con.close()
except Exception as e:
    print("Error connecting to postgres:", e)
