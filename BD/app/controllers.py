from .exceptions import HTTPException, UnprocessableEntityException
from flask import Blueprint, request, jsonify
from .models import query_db, execute_db
from .services import auth_service

bp = Blueprint('main', __name__)

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
        top_to_liquid_distance_in_cm = data.get('top_to_liquid_distance_in_cm')
        tank_base_area = data.get('tank_base_area')
        volume = data.get('volume')

        if not top_to_liquid_distance_in_cm or not tank_base_area or not volume:
            return jsonify({"message": "It's not possible to create a tank without 'top_to_liquid_distance_in_cm', 'tank_base_area', or 'volume'!"}), 400

        tank_id = execute_db("INSERT INTO tanks (top_to_liquid_distance_in_cm, tank_base_area, volume) VALUES (?, ?, ?)", [top_to_liquid_distance_in_cm, tank_base_area, volume])
        created_tank = query_db("SELECT * FROM tanks WHERE id = ?", [tank_id], one=True)

        return jsonify(dict(created_tank)), 201


    @bp.route("/tanks/<int:id>", methods = ["PUT"])
    def update_tank(id):
        data = request.json
        top_to_liquid_distance_in_cm = data.get('top_to_liquid_distance_in_cm')
        tank_base_area = data.get('tank_base_area')
        volume = data.get('volume')

        if not top_to_liquid_distance_in_cm or not tank_base_area or not volume:
            return jsonify({"message": "It's not possible to update the tank without 'top_to_liquid_distance_in_cm', 'tank_base_area', or 'volume'!"}), 400

        execute_db("UPDATE tanks SET top_to_liquid_distance_in_cm = ?, tank_base_area = ?, volume = ? WHERE id = ?", [top_to_liquid_distance_in_cm, tank_base_area, volume, id])
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
    @bp.route("/samples", methods=["POST"])
    def create_sample():
        data = request.json
        tank_id = data.get('tank_id')
        top_to_liquid_distance_in_cm = data.get('top_to_liquid_distance_in_cm')
        tank_base_area = data.get('tank_base_area')
        volume = data.get('volume')
        
        if not tank_id or not top_to_liquid_distance_in_cm or not tank_base_area or not volume:
            return jsonify({"message": "Invalid Data!"}), 400
        
        sample_id = execute_db("INSERT INTO samples (tank_id, top_to_liquid_distance_in_cm, tank_base_area, volume) VALUES (?, ?, ?, ?)", [tank_id, top_to_liquid_distance_in_cm, tank_base_area, volume])
        created_sample = query_db("SELECT * FROM samples WHERE id = ?", [sample_id], one=True)

        return jsonify(dict(created_sample)), 201


    
    
    @bp.route("/samples/<int:id>", methods=["DELETE"])
    def delete_sample(id):
        sample = query_db("SELECT * FROM samples WHERE id = ?", [id], one=True)

        if not sample:
            return jsonify({"error": "Sample not found!"}), 404
        
        execute_db("DELETE FROM samples WHERE id = ?", [id])

        return jsonify({"message": "Sample data deleted successfully!"}), 200

class AuthController:
    @bp.route("/auth/login", methods=["POST"])
    def login():
        try:
            data = request.json
            email = data.get('email')
            password = data.get('password')
            
            if not email or not password:
                raise UnprocessableEntityException("Login needs 'email' and 'password'!")

            response_json = auth_service.login(email, password)

            return jsonify(dict(response_json)), 200
        except HTTPException as err:
            return err.get_response()

    @bp.route("/auth/create-user", methods=["POST"])
    def create_user():
        try:
            data = request.json
            email = data.get('email')
            password = data.get('password')
            name = data.get('name')

            if not email or not name or not password:
                raise UnprocessableEntityException("Required 'email', 'name' and 'password'!")

            created_user_id = auth_service.create_user(email, password, name)

            return jsonify(dict({"id": created_user_id})), 201
        except HTTPException as err:
            return err.get_response()
        
    @bp.route("/auth/me", methods=["GET"])
    def me():
        try:
            session_params = auth_service.get_session_from_req(request)
            user = auth_service.get_current_user(session_params["session_id"], session_params["user_id"])

            return jsonify(dict(user)), 201
        except HTTPException as err:
            return err.get_response()
