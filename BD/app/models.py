import sqlite3
from flask import g, current_app

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
        ''')
    print("Database initialized!")



def query_db(query, args=(), one=False):
    db = get_db()
    cursor = db.execute(query, args)
    result_value = cursor.fetchall()
    cursor.close()
    return (result_value[0] if result_value else None) if one else result_value

def execute_db(query, args=()):
    db = get_db()
    cursor = db.execute(query, args)
    db.commit()
    id = cursor.lastrowid
    cursor.close()
    return id
