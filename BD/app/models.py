import typing
import sqlite3
from flask import g

DB_NAME = 'tanks.db'

class DB:
    def __init__(self, thread_context=None) -> None:
        # isso foi feito pois
# sqlite3.ProgrammingError: SQLite objects created in a thread can only be used in that same thread. The object was created in thread id 139694118860608 and this is thread id 139694012626688.
        self.context = thread_context
        self.conn = None

    def get_connection(self):
        if self.context is None:
            if self.conn is None:
                self.conn = sqlite3.connect(DB_NAME)
                self.conn.row_factory = sqlite3.Row  # usar Row para poder acessar as colunas por nome ao inves de indice
            return self.conn

        if 'conn' not in self.context:
            self.context.conn = sqlite3.connect(DB_NAME)
            self.context.conn.row_factory = sqlite3.Row  # usar Row para poder acessar as colunas por nome ao inves de indice
        return self.context.conn

    def query_db(self, query, args=(), one=False):
        conn = self.get_connection()
        cursor = conn.execute(query, args)
        result_value = cursor.fetchall()
        cursor.close()
        return (result_value[0] if result_value else None) if one else result_value

    def execute_db(self, query, args=(), returning: typing.Literal["one", "many", False]=False):
        conn = self.get_connection()
        cursor = conn.execute(query, args)

        if returning == "one":
            result = cursor.fetchall()
            result = result[0] if result else None
        elif returning == "many":
            result = cursor.fetchall()
        else:
            result = cursor.lastrowid

        conn.commit()
        cursor.close()
        return result


def init_db():
    db = DB()
    conn = db.get_connection()
    with conn:
        conn.executescript('''
        CREATE TABLE IF NOT EXISTS tanks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            maximum_volume REAL NOT NULL,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            volume_danger_zone REAL NOT NULL,
            volume_alert_zone REAL NOT NULL,
            tank_base_area REAL NOT NULL,
            latitude REAL NOT NULL,
            longitude REAL NOT NULL
        );
                         
        CREATE TABLE IF NOT EXISTS samples (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tank_id INTEGER NOT NULL,
            top_to_liquid_distance_in_cm REAL NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
            FOREIGN KEY(tank_id) REFERENCES tanks(id)
        );
        -- separate credentials and user to prevent leaks
        CREATE TABLE IF NOT EXISTS credentials (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            hashed_password TEXT UNIQUE NOT NULL
        );
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            credential_id INTEGER NOT NULL,
            FOREIGN KEY(credential_id) REFERENCES credentials(id)
        );
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            expires_at DATETIME DEFAULT (datetime('now', '+1 days')),
            FOREIGN KEY(user_id) REFERENCES users(id)
        );
        ''')
    print("Database initialized!")


