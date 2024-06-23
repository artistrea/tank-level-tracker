from flask import Blueprint, request, jsonify
from .models import query_db, execute_db
from schema import Schema, And, Use, Optional, SchemaError

bp = Blueprint('main', __name__)


def check(conf_schema, conf):
    try:
        conf_schema.validate(conf)
        return True
    except SchemaError:
        return False


create_tank_schema = Schema({
    'name': And(Use(str)),
    'description': And(Use(str)),
    'maximum_volume': And(Use(float)),
    'volume_danger_zone': And(Use(float)),
    'volume_alert_zone': And(Use(float)),
    'tank_base_area': And(Use(float)),
    'latitude': And(Use(float)),
    'longitude': And(Use(float))
})

create_samples_schema = Schema({
    'tank_id': And(Use(int)),
    'top_to_liquid_distance_in_cm': And(Use(float))
})

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
    "top_to_liquid_distance_in_cm"
]


class TanksController:

    @bp.route("/tanks", methods = ["GET"])
    def getAll():
        tanks = query_db("SELECT * FROM tanks")

        return jsonify([dict(row) for row in tanks]), 200



    @bp.route("/tanks/<int:id>", methods = ["GET"])
    def getById(id):
        tank = query_db("SELECT * FROM tanks WHERE id = ?", [id], one=True)

        if tank:
            return jsonify(dict(tank)), 200
        
        return jsonify({"error": "Tank not found!"}), 404
    


    @bp.route("/tanks", methods = ["POST"])
    def create_tank():
        data = request.json

        if not check(create_tank_schema, data):
            return jsonify({"message": "It's not possible to create a tank without 'top_to_liquid_distance_in_cm', 'tank_base_area', or 'volume'!"}), 400

        tank_id = execute_db(f"INSERT INTO tanks ({", ".join(tanks_parameters)}) VALUES ({", ".join(8*["?"])})", [data.get(var) for var in tanks_parameters]) 
        created_tank = query_db("SELECT * FROM tanks WHERE id = ?", [tank_id], one=True)

        return jsonify(dict(created_tank)), 201



    @bp.route("/tanks/<int:id>", methods = ["PUT"])
    def update_tank(id):
        data = request.json

        if not check(create_tank_schema, data):
            return jsonify({"message": "It's not possible to update the tank without 'top_to_liquid_distance_in_cm', 'tank_base_area', or 'volume'!"}), 400

        tank = query_db("SELECT * FROM tanks WHERE id = ?", [id], one=True)

        if not tank:
            return jsonify({"error": "Tank not found!"}), 404

        execute_db(f"UPDATE tanks SET {','.join([f"{var} = ?" for var in tanks_parameters])} WHERE id = ?", [data.get(var) for var in tanks_parameters]+[id])
        updated_tank = query_db("SELECT * FROM tanks WHERE id = ?", [id], one=True)

        return jsonify(dict(updated_tank)), 200
    


    @bp.route("/tanks/<int:id>", methods = ["DELETE"])
    def delete_tank(id):
        tank = query_db("SELECT * FROM tanks WHERE id = ?", [id], one=True)

        if not tank:
            return jsonify({"error": "Tank not found!"}), 404
        
        execute_db("DELETE FROM tanks WHERE id = ?", [id])

        return jsonify({"message": "Tank data deleted successfully!"}), 200





class SamplesController:
    @bp.route("/samples", methods = ["POST"])
    def create_sample():
        data = request.json

        if not check(create_samples_schema, data):
            return jsonify({"message": "Invalid Data!"}), 400

        sample_id = execute_db(f"INSERT INTO samples ({", ".join(samples_parameters)}) VALUES ({", ".join(2*["?"])})", [data.get(var) for var in samples_parameters])
        created_sample = query_db("SELECT * FROM samples WHERE id = ?", [sample_id], one=True)

        return jsonify(dict(created_sample)), 201



    @bp.route("/samples/<int:id>", methods = ["DELETE"])
    def delete_sample(id):
        sample = query_db("SELECT * FROM samples WHERE id = ?", [id], one=True)

        if not sample:
            return jsonify({"error": "Sample not found!"}), 404
        
        execute_db("DELETE FROM samples WHERE id = ?", [id])

        return jsonify({"message": "Sample data deleted successfully!"}), 200
