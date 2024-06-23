from flask import Flask
from flask import request

app = Flask(__name__)

@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"

class TanksController:
    # index
    @app.route("/tanks", methods=["GET"])
    def getAll():
        return [
            {
                "id": "dafaiasfadsgs-adsga",
                "name": "asfasd",
                "heightInCentimeters": 20,
            },
            {
                "id": "dafaiasfadsgs-adsga",
                "name": "asfasd",
                "heightInCentimeters": 20,
            }
        ]

    # get sem ser index
    @app.route("/tanks/<id>", methods=["GET"])
    def getById(id):

        return {
                "id": "dafaiasfadsgs-adsga",
                "tankId": "asfasd",
                "heightInCentimeters": 10,
            }

    # create
    @app.route("/tanks", methods=["POST"])
    def create():
        # name, height
        # request.body
        name = request.body["name"]
        height = request.body["height"]
        if (not height or not name):
            return {
                "message": "Não pode criar tanque sem 'name' ou 'height'"
            }

        created = TanksModel.insert(name, height)

        return created

    # update
    @app.route("/tanks/<id>", methods=["PUT"])
    def update(id):
        name = request.body["name"]
        height = request.body["height"]
        if (not height or not name):
            return {
                "message": "Não pode criar tanque sem 'name' ou 'height'"
            }

        updated = TanksModel.update(id, name, height)

    # delete
    @app.route("/tanks/<id>", methods=["PUT"])
    def update(id):
        updated = TanksModel.delete(id)

class SamplesController:
    # create
    @app.route("/samples", methods=["POST"])
    def create():
        encryptedData = request.body["encryptedData"]
        tankId = request.body["tankId"]

        created = TanksModel.insert()

        return created

class AuthenticationService:
    def getCurrentUser(session):
        return db.query("select * from session where id = $1", (session,))[0]

class TanksModel:
    def getAll():
        return db.query("SELECT * FROM public.samples")

    def insert(tankId: str, height: int):
        return db.query("""
            INSERT INTO public.samples (tankId, h) VALUES
                ($1, $2)
        """, ())

# nó -> gateway -> servidor (py)
# servidor (py) <-> front
