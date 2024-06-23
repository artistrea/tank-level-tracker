import typing
import sqlite3
from flask import g

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect('tanks.db')
        g.db.row_factory = sqlite3.Row  # usar Row para poder acessar as colunas por nome ao inves de indice
    return g.db


def init_db():
    db = get_db()
    with db:
        db.executescript('''
        CREATE TABLE IF NOT EXISTS tanks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            top_to_liquid_distance_in_cm REAL NOT NULL,
            tank_base_area REAL NOT NULL,
            volume REAL NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
        );
        CREATE TABLE IF NOT EXISTS samples (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tank_id INTEGER NOT NULL,
            top_to_liquid_distance_in_cm REAL NOT NULL,
            tank_base_area REAL NOT NULL,
            volume REAL NOT NULL,
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



def query_db(query, args=(), one=False):
    db = get_db()
    cursor = db.execute(query, args)
    result_value = cursor.fetchall()
    cursor.close()
    return (result_value[0] if result_value else None) if one else result_value

def execute_db(query, args=(), returning: typing.Literal["one", "many", False]=False):
    db = get_db()
    cursor = db.execute(query, args)

    if returning == "one":
        result = cursor.fetchall()
        result = result[0] if result else None
    elif returning == "many":
        result = cursor.fetchall()
    else:
        result = cursor.lastrowid

    db.commit()
    cursor.close()
    return result
