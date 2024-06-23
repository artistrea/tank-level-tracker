import uuid
import bcrypt
from datetime import datetime
from ..models import query_db, execute_db
from ..exceptions import SessionExpiredException, UnauthorizedException, UnprocessableEntityException, ForbiddenException
from flask import g

def get_session_from_req(request):
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

def get_current_user(session_id, user_id):
    if "current_user" in g:
        return g.current_user
    print("session_id", f"'{session_id}'")
    print("user_id", f"'{user_id}'")
    current_session = query_db("SELECT * FROM sessions WHERE id = $1 AND user_id = $2", [session_id, user_id], one=True)

    if not current_session:
        raise UnauthorizedException("no session")

    if (datetime.strptime(current_session.expires_at).date() < datetime.now().date()):
        raise SessionExpiredException("a")

    g.current_user = query_db("SELECT * FROM users WHERE user_id = $1", [user_id], one=True)

    return g.current_user


def login(email, password):
    user = query_db("SELECT * FROM users WHERE email = $1", [email], one=True)
    if not user:
        raise UnauthorizedException("Wrong credentials used!")

    credential = query_db("SELECT * FROM credentials WHERE id = $1", [user["credential_id"]], one=True)

    if not credential:
        raise UnauthorizedException("There are no credentials for this user! Contact an admin for help.")

    if not bcrypt.checkpw(password.encode('utf-8'), credential["hashed_password"]):
        raise UnauthorizedException("Wrong credentials used!")

    session = query_db("INSERT INTO sessions (id, user_id) VALUES ($1, $2) RETURNING *", [str(uuid.uuid4()), user["id"]], one=True)

    # era pra usar retry aqui na real
    if not session:
        raise UnauthorizedException("Tente outra veez")

    return session

def create_user(email, password, name):
    already_user = query_db("SELECT id FROM users WHERE email = $1", [email], one=True)
    if already_user:
        raise UnprocessableEntityException("Email already registered!")

    if len(password) > 60:
        raise UnprocessableEntityException("Password can't have more than 60 characters in it!")

    salt = bcrypt.gensalt()
    credential_id = execute_db("INSERT INTO credentials (hashed_password) VALUES ($1)",
        [bcrypt.hashpw(password.encode('utf-8'), salt)]
    )

    user_id = execute_db("INSERT INTO users (email, name, credential_id) VALUES ($1, $2, $3)", [email, name, credential_id])

    return user_id


