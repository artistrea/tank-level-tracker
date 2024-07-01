# python3 ./src/seed.py

import sys
import os
APP_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(os.path.dirname(APP_DIR))

from app.services.auth_service import AuthService
from app.models import DB, init_db

db = DB()
auth_service = AuthService(db)


tanks_parameters = [
    "name",
    "description",
    "maximum_volume",
    "volume_danger_zone",
    "volume_alert_zone",
    "tank_base_area",
    "latitude",
    "longitude"
]

samples_parameters = [ 
    "tank_id",
    "top_to_liquid_distance_in_cm",
    "timestamp"
]

def seed():
    auth_service.create_user("admin@gmail.com", "123456", "O Professor")
    auth_service.create_user("aluno@gmail.com", "123456", "O Aluno")

    new_tank = {
        "name": "Tanque 1",
        "description": "Tanque 1",
        "maximum_volume": 10.5,
        "volume_danger_zone": 2,
        "volume_alert_zone": 5,
        "tank_base_area": 2,
        "latitude": -47.862,
        "longitude": -15.7657
    }
    tank_id = db.execute_db(f"INSERT INTO tanks ({', '.join(tanks_parameters)}) VALUES ({', '.join(8*['?'])})", [new_tank.get(var) for var in tanks_parameters]) 
    new_samples = [
        {"tank_id": tank_id, "top_to_liquid_distance_in_cm": 0, "timestamp": "2024-06-01 09:00:00"},
        {"tank_id": tank_id, "top_to_liquid_distance_in_cm": 0, "timestamp": "2024-06-01 10:00:00"},
        {"tank_id": tank_id, "top_to_liquid_distance_in_cm": 100, "timestamp": "2024-06-01 11:00:00"},
        {"tank_id": tank_id, "top_to_liquid_distance_in_cm": 200, "timestamp": "2024-06-01 12:00:00"},
        {"tank_id": tank_id, "top_to_liquid_distance_in_cm": 300, "timestamp": "2024-06-01 13:00:00"},
        {"tank_id": tank_id, "top_to_liquid_distance_in_cm": 280, "timestamp": "2024-06-01 14:00:00"},
        {"tank_id": tank_id, "top_to_liquid_distance_in_cm": 260, "timestamp": "2024-06-01 15:00:00"},
        {"tank_id": tank_id, "top_to_liquid_distance_in_cm": 240, "timestamp": "2024-06-01 16:00:00"},
        {"tank_id": tank_id, "top_to_liquid_distance_in_cm": 220, "timestamp": "2024-06-01 17:00:00"},
        {"tank_id": tank_id, "top_to_liquid_distance_in_cm": 200, "timestamp": "2024-06-01 18:00:00"},
        {"tank_id": tank_id, "top_to_liquid_distance_in_cm": 180, "timestamp": "2024-06-01 19:00:00"},
        {"tank_id": tank_id, "top_to_liquid_distance_in_cm": 160, "timestamp": "2024-06-01 20:00:00"},
        {"tank_id": tank_id, "top_to_liquid_distance_in_cm": 140, "timestamp": "2024-06-01 21:00:00"},
        {"tank_id": tank_id, "top_to_liquid_distance_in_cm": 120, "timestamp": "2024-06-01 22:00:00"},
        {"tank_id": tank_id, "top_to_liquid_distance_in_cm": 100, "timestamp": "2024-06-01 23:00:00"},
        {"tank_id": tank_id, "top_to_liquid_distance_in_cm": 120, "timestamp": "2024-06-02 00:00:00"},
        {"tank_id": tank_id, "top_to_liquid_distance_in_cm": 140, "timestamp": "2024-06-02 01:00:00"},
        {"tank_id": tank_id, "top_to_liquid_distance_in_cm": 160, "timestamp": "2024-06-02 02:00:00"},
        {"tank_id": tank_id, "top_to_liquid_distance_in_cm": 180, "timestamp": "2024-06-02 03:00:00"},
        {"tank_id": tank_id, "top_to_liquid_distance_in_cm": 200, "timestamp": "2024-06-02 04:00:00"},
        {"tank_id": tank_id, "top_to_liquid_distance_in_cm": 220, "timestamp": "2024-06-02 05:00:00"},
        {"tank_id": tank_id, "top_to_liquid_distance_in_cm": 240, "timestamp": "2024-06-02 06:00:00"},
        {"tank_id": tank_id, "top_to_liquid_distance_in_cm": 260, "timestamp": "2024-06-02 07:00:00"},
        {"tank_id": tank_id, "top_to_liquid_distance_in_cm": 280, "timestamp": "2024-06-02 08:00:00"},
        {"tank_id": tank_id, "top_to_liquid_distance_in_cm": 300, "timestamp": "2024-06-02 09:00:00"},
        {"tank_id": tank_id, "top_to_liquid_distance_in_cm": 280, "timestamp": "2024-06-02 10:00:00"},
        {"tank_id": tank_id, "top_to_liquid_distance_in_cm": 260, "timestamp": "2024-06-02 11:00:00"},
        {"tank_id": tank_id, "top_to_liquid_distance_in_cm": 240, "timestamp": "2024-06-02 12:00:00"},
        {"tank_id": tank_id, "top_to_liquid_distance_in_cm": 220, "timestamp": "2024-06-02 13:00:00"},
        {"tank_id": tank_id, "top_to_liquid_distance_in_cm": 200, "timestamp": "2024-06-02 14:00:00"},
        {"tank_id": tank_id, "top_to_liquid_distance_in_cm": 180, "timestamp": "2024-06-02 15:00:00"},
        {"tank_id": tank_id, "top_to_liquid_distance_in_cm": 160, "timestamp": "2024-06-02 16:00:00"},
        {"tank_id": tank_id, "top_to_liquid_distance_in_cm": 140, "timestamp": "2024-06-02 17:00:00"},
        {"tank_id": tank_id, "top_to_liquid_distance_in_cm": 120, "timestamp": "2024-06-02 18:00:00"}
    ]
        
    for new_sample in new_samples:
        db.execute_db(f"INSERT INTO samples ({', '.join(samples_parameters)}) VALUES ({', '.join(3*['?'])})", [new_sample.get(var) for var in samples_parameters])

    new_tank = {
        "name": "Tanque 2",
        "description": "Tanque 2",
        "maximum_volume": 10.5,
        "volume_danger_zone": 2,
        "volume_alert_zone": 5,
        "tank_base_area": 2,
        "latitude": -47.868,
        "longitude": -15.765
    }
    tank_id = db.execute_db(f"INSERT INTO tanks ({', '.join(tanks_parameters)}) VALUES ({', '.join(8*['?'])})", [new_tank.get(var) for var in tanks_parameters]) 
    new_samples = [
        {
            "tank_id": tank_id,
            "top_to_liquid_distance_in_cm": 200,
            "timestamp": "2024-06-01 09:00:00"
        },
        {
            "tank_id": tank_id,
            "top_to_liquid_distance_in_cm": 200,
            "timestamp": "2024-06-01 10:00:00"
        },
        {
            "tank_id": tank_id,
            "top_to_liquid_distance_in_cm": 200,
            "timestamp": "2024-06-01 11:00:00"
        },
        {
            "tank_id": tank_id,
            "top_to_liquid_distance_in_cm": 200,
            "timestamp": "2024-06-01 12:00:00"
        },
        {
            "tank_id": tank_id,
            "top_to_liquid_distance_in_cm": 200,
            "timestamp": "2024-06-01 13:00:00"
        },
        {
            "tank_id": tank_id,
            "top_to_liquid_distance_in_cm": 200,
            "timestamp": "2024-06-01 14:00:00"
        },
        {
            "tank_id": tank_id,
            "top_to_liquid_distance_in_cm": 200,
            "timestamp": "2024-06-01 15:00:00"
        },
        {
            "tank_id": tank_id,
            "top_to_liquid_distance_in_cm": 200,
            "timestamp": "2024-06-01 16:00:00"
        },
        {
            "tank_id": tank_id,
            "top_to_liquid_distance_in_cm": 200,
            "timestamp": "2024-06-01 17:00:00"
        },
        {
            "tank_id": tank_id,
            "top_to_liquid_distance_in_cm": 200,
            "timestamp": "2024-06-01 18:00:00"
        },
        {
            "tank_id": tank_id,
            "top_to_liquid_distance_in_cm": 200,
            "timestamp": "2024-06-01 19:00:00"
        },
        {
            "tank_id": tank_id,
            "top_to_liquid_distance_in_cm": 200,
            "timestamp": "2024-06-01 20:00:00"
        },
        {
            "tank_id": tank_id,
            "top_to_liquid_distance_in_cm": 200,
            "timestamp": "2024-06-01 21:00:00"
        },
        {
            "tank_id": tank_id,
            "top_to_liquid_distance_in_cm": 200,
            "timestamp": "2024-06-01 22:00:00"
        },
        {
            "tank_id": tank_id,
            "top_to_liquid_distance_in_cm": 200,
            "timestamp": "2024-06-01 23:00:00"
        },
        {
            "tank_id": tank_id,
            "top_to_liquid_distance_in_cm": 200,
            "timestamp": "2024-06-02 09:00:00"
        },
        {
            "tank_id": tank_id,
            "top_to_liquid_distance_in_cm": 200,
            "timestamp": "2024-06-02 10:00:00"
        },
        {
            "tank_id": tank_id,
            "top_to_liquid_distance_in_cm": 200,
            "timestamp": "2024-06-02 11:00:00"
        },
        {
            "tank_id": tank_id,
            "top_to_liquid_distance_in_cm": 200,
            "timestamp": "2024-06-02 12:00:00"
        },
        {
            "tank_id": tank_id,
            "top_to_liquid_distance_in_cm": 200,
            "timestamp": "2024-06-02 13:00:00"
        },
        {
            "tank_id": tank_id,
            "top_to_liquid_distance_in_cm": 200,
            "timestamp": "2024-06-02 14:00:00"
        },
    ]

    for new_sample in new_samples:
        db.execute_db(f"INSERT INTO samples ({', '.join(samples_parameters)}) VALUES ({', '.join(3*['?'])})", [new_sample.get(var) for var in samples_parameters])





    new_tank = {
        "name": "Tanque 3",
        "description": "Tanque 3 description",
        "maximum_volume": 10.5,
        "volume_danger_zone": 2,
        "volume_alert_zone": 5,
        "tank_base_area": 2,
        "latitude": -47.862,
        "longitude": -15.7627
    }

    tank_id = db.execute_db(f"INSERT INTO tanks ({', '.join(tanks_parameters)}) VALUES ({', '.join(8*['?'])})", [new_tank.get(var) for var in tanks_parameters]) 
    new_samples = [
        {
            "tank_id": tank_id,
            "top_to_liquid_distance_in_cm": 199,
            "timestamp": "2024-06-02 11:00:00"
        },
        {
            "tank_id": tank_id,
            "top_to_liquid_distance_in_cm": 399,
            "timestamp": "2024-06-02 12:00:00"
        },
        {
            "tank_id": tank_id,
            "top_to_liquid_distance_in_cm": 500,
            "timestamp": "2024-06-02 13:00:00"
        },
        {
            "tank_id": tank_id,
            "top_to_liquid_distance_in_cm": 600,
            "timestamp": "2024-06-02 14:00:00"
        },
        {
            "tank_id": tank_id,
            "top_to_liquid_distance_in_cm": 600,
            "timestamp": "2024-06-02 15:00:00"
        },
        {
            "tank_id": tank_id,
            "top_to_liquid_distance_in_cm": 600,
            "timestamp": "2024-06-02 16:00:00"
        },
        {
            "tank_id": tank_id,
            "top_to_liquid_distance_in_cm": 600,
            "timestamp": "2024-06-02 15:00:00"
        },
        {
            "tank_id": tank_id,
            "top_to_liquid_distance_in_cm": 600,
            "timestamp": "2024-06-02 15:00:00"
        },
    ]

    for new_sample in new_samples:
        db.execute_db(f"INSERT INTO samples ({', '.join(samples_parameters)}) VALUES ({', '.join(3*['?'])})", [new_sample.get(var) for var in samples_parameters])



    print("seed executed!")


if __name__ == "__main__":
    init_db()
    seed()
