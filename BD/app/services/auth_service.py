import typing
import uuid
import bcrypt
from datetime import datetime
from ..models import DB
from ..exceptions import SessionExpiredException, UnauthorizedException, UnprocessableEntityException, ForbiddenException

class GetSessionFromReqReturnType(typing.TypedDict):
    session_id: str
    user_id: str

class AuthService:
    def __init__(self, db: DB) -> None:
        self.db = db

    def authorize_request(
                self,
                request,
                action: typing.Literal["read", "create", "update", "delete"],
                resource: typing.Literal["tank", "sample", "user"]
            ):
        session = self.get_session_from_req(request)

        cur_user = self.get_current_user(session["session_id"], session["user_id"])
        if cur_user:
            # could make more complex checks.
            # role based authorization, for example
            if cur_user["email"] == "admin@gmail.com":
                return

        raise ForbiddenException(f"You don't have permission to {action} {resource}!")


    def get_session_from_req(self, request) -> GetSessionFromReqReturnType:
        authorization_header = request.headers.get("authorization")
        if not authorization_header:
            raise UnauthorizedException("Request needs to be sent with authorization header!")

        if not authorization_header.startswith("Bearer "):
            raise ForbiddenException("Invalid authorization schema used!")

        auth_header_split = authorization_header.split(":")
        if len(auth_header_split) != 2:
            raise ForbiddenException("Invalid authorization header!")

        session_id_with_bearer, user_id = auth_header_split

        session_id = session_id_with_bearer[len("Bearer "):]

        return {
            "session_id": session_id,
            "user_id": user_id
        }

    def get_current_user(self, session_id: typing.Optional[str]=None, user_id: typing.Optional[str]=None):
        if not session_id or not user_id:
            raise Exception("É necessário que tenha sido chamado get_current_user com os parâmetros corretos antes de tentar chamar sem nenhum parâmetro")
        # print("session_id", f"'{session_id}'")
        # print("user_id", f"'{user_id}'1")
        current_session = self.db.query_db("SELECT * FROM sessions WHERE id = $1 AND user_id = $2", [session_id, user_id], one=True)

        if not current_session:
            raise UnauthorizedException("no session")

        if (datetime.strptime(current_session["expires_at"], '%Y-%m-%d %H:%M:%S').date() < datetime.now().date()):
            raise SessionExpiredException("a")

        current_user = self.db.query_db("SELECT * FROM users WHERE id = $1", [user_id], one=True)

        return current_user


    def login(self, email: str, password: str):
        user = self.db.query_db("SELECT * FROM users WHERE email = $1", [email], one=True)
        if not user:
            raise UnauthorizedException("Wrong credentials used!")

        credential = self.db.query_db("SELECT * FROM credentials WHERE id = $1", [user["credential_id"]], one=True)

        if not credential:
            raise UnauthorizedException("There are no credentials for this user! Contact an admin for help.")

        if not bcrypt.checkpw(password.encode('utf-8'), credential["hashed_password"]):
            raise UnauthorizedException("Wrong credentials used!")

        session_id =str(uuid.uuid4())
        self.db.execute_db("INSERT INTO sessions (id, user_id) VALUES ($1, $2)",
            [session_id, user["id"]]
        )

        session = self.db.query_db("SELECT * FROM sessions WHERE id = $1", [session_id], one=True)

        return session


    def create_user(self, email, password, name):
        already_user = self.db.query_db("SELECT id FROM users WHERE email = $1", [email], one=True)
        if already_user:
            raise UnprocessableEntityException("Email already registered!")

        if len(password) > 60:
            raise UnprocessableEntityException("Password can't have more than 60 characters in it!")

        salt = bcrypt.gensalt()
        credential_id = self.db.execute_db("INSERT INTO credentials (hashed_password) VALUES ($1)",
            [bcrypt.hashpw(password.encode('utf-8'), salt)]
        )

        user_id = self.db.execute_db("INSERT INTO users (email, name, credential_id) VALUES ($1, $2, $3)", [email, name, credential_id])

        return user_id

