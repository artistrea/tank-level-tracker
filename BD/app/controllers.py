from .exceptions import HTTPException, UnprocessableEntityException, InternalServerErrorException, NotFoundException
from flask import Blueprint, request, jsonify, make_response
from .models import DB
from .services.auth_service import AuthService
from schema import Schema, And, Use, SchemaError
from flask import g

db = DB(g)

auth_service = AuthService(db)

bp = Blueprint('main', __name__)

def http_error_handler(exception: HTTPException):
    return exception.get_response()

bp.register_error_handler(HTTPException, http_error_handler)

def internal_server_error_handler(error: Exception):
    print("#############################")
    print(error)
    print("#############################")

    return InternalServerErrorException().get_response()

bp.register_error_handler(Exception, internal_server_error_handler)

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
        auth_service.authorize_request(request, "read", "tank")
        tanks = db.query_db("""
            SELECT  t.*,
                    s.top_to_liquid_distance_in_cm as latest_sample_top_to_liquid_distance_in_cm,
                    s.timestamp as latest_sample_timestamp
            FROM tanks t left join (
                SELECT
                    *,
                    ROW_NUMBER() OVER (PARTITION BY tank_id ORDER BY timestamp) as row_number
                FROM samples
            ) s on s.tank_id = t.id AND s.row_number = 1;
                            """)

        return jsonify([dict(row) for row in tanks]), 200



    @bp.route("/tanks/<int:id>", methods = ["GET"])
    def getById(id):
        auth_service.authorize_request(request, "read", "tank")
        tank = db.query_db("SELECT * FROM tanks WHERE id = ?", [id], one=True)

        if tank:
            return jsonify(dict(tank)), 200
        
        raise NotFoundException()
    


    @bp.route("/tanks", methods = ["POST"])
    def create_tank():
        auth_service.authorize_request(request, "create", "tank")
        data = request.json

        if not check(create_tank_schema, data):
            return jsonify({"message": "It's not possible to create a tank without 'name', 'description', 'maximum_volume', 'volume_danger_zone', 'volume_alert_zone', 'tank_base_area', 'latitude', 'longitude'!"}), 400

        tank_id = db.execute_db(f"INSERT INTO tanks ({', '.join(tanks_parameters)}) VALUES ({', '.join(8*['?'])})", [data.get(var) for var in tanks_parameters]) 

        if tank_id is not None and tank_id > 255:
            db.execute_db("DELETE FROM tanks WHERE id = ?", [tank_id])
            raise UnprocessableEntityException("Tank ID must be less than or equal to 255.")

        created_tank = db.query_db("SELECT * FROM tanks WHERE id = ?", [tank_id], one=True)

        return jsonify(dict(created_tank)), 201



    @bp.route("/tanks/<int:id>", methods = ["PUT"])
    def update_tank(id):
        auth_service.authorize_request(request, "update", "tank")
        data = request.json

        if not check(create_tank_schema, data):
            raise UnprocessableEntityException("It's not possible to update the tank without 'name', 'description', 'maximum_volume', 'volume_danger_zone', 'volume_alert_zone', 'tank_base_area', 'latitude', 'longitude'!")

        tank = db.query_db("SELECT * FROM tanks WHERE id = ?", [id], one=True)

        if not tank:
            raise NotFoundException()

        question_marks = ','.join([f"{var} = ?" for var in tanks_parameters])
        db.execute_db(f"UPDATE tanks SET {question_marks} WHERE id = ?", [data.get(var) for var in tanks_parameters]+[id])
        updated_tank = db.query_db("SELECT * FROM tanks WHERE id = ?", [id], one=True)

        return jsonify(dict(updated_tank)), 200
    


    @bp.route("/tanks/<int:id>", methods = ["DELETE"])
    def delete_tank(id):
        auth_service.authorize_request(request, "delete", "tank")
        tank = db.query_db("SELECT * FROM tanks WHERE id = ?", [id], one=True)

        if not tank:
            raise NotFoundException()
        
        db.execute_db("DELETE FROM tanks WHERE id = ?", [id])

        return jsonify({"message": "Tank data deleted successfully!"}), 200



class SamplesController:

    @bp.route("/samples", methods = ["GET"])
    def get_all_samples():
        auth_service.authorize_request(request, "read", "sample")
        tanks = db.query_db(""" SELECT * FROM samples; """)

        return jsonify([dict(row) for row in tanks]), 200


    @bp.route("/samples", methods = ["POST"])
    def create_sample():
        auth_service.authorize_request(request, "create", "sample")
        data = request.json

        if not check(create_samples_schema, data):
            raise UnprocessableEntityException("Invalid Data!")

        sample_id = db.execute_db(f"INSERT INTO samples ({', '.join(samples_parameters)}) VALUES ({', '.join(2*['?'])})", [data.get(var) for var in samples_parameters])
        created_sample = db.query_db("SELECT * FROM samples WHERE id = ?", [sample_id], one=True)

        return jsonify(dict(created_sample)), 201



    @bp.route("/samples/<int:id>", methods = ["DELETE"])
    def delete_sample(id):
        auth_service.authorize_request(request, "delete", "sample")
        sample = db.query_db("SELECT * FROM samples WHERE id = ?", [id], one=True)

        if not sample:
            raise NotFoundException("Sample not found!")
        
        db.execute_db("DELETE FROM samples WHERE id = ?", [id])

        return jsonify({"message": "Sample data deleted successfully!"}), 200




class AuthController:
    @bp.route("/auth/login", methods=["POST"])
    def login():
        data = request.json
        email = str(data.get('email'))
        password = str(data.get('password'))
        
        if not email or not password:
            raise UnprocessableEntityException("Login needs 'email' and 'password'!")

        response_json = auth_service.login(email, password)

        return jsonify(dict(response_json)), 200

    @bp.route("/auth/create-user", methods=["POST"])
    def create_user():
        auth_service.authorize_request(request, "create", "user")
        data = request.json
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')

        if not email or not name or not password:
            raise UnprocessableEntityException("Required 'email', 'name' and 'password'!")

        created_user_id = auth_service.create_user(email, password, name)

        return jsonify(dict({"id": created_user_id})), 201
        
    @bp.route("/auth/me", methods=["GET"])
    def me():
        session_params = auth_service.get_session_from_req(request)
        user = auth_service.get_current_user(session_params["session_id"], session_params["user_id"])

        return jsonify(dict(user)), 201
