from flask import jsonify


class HTTPException(Exception):
    def __init__(self, statusCode: int, message: str) -> None:
        super().__init__(message)

        self.statusCode = statusCode
        self.message = message

    def get_response(self):
        return jsonify({ "message": self.message }), self.statusCode


class UnauthorizedException(HTTPException):
    def __init__(self, message: str) -> None:
        super().__init__(401, "Unauthorized" if message is None else message)

class ForbiddenException(HTTPException):
    def __init__(self, message: str) -> None:
        super().__init__(401, "Forbidden" if message is None else message)

class SessionExpiredException(HTTPException):
    def __init__(self, message: str) -> None:
        super().__init__(440, "Session Expired" if message is None else message)

class UnprocessableEntityException(HTTPException):
    def __init__(self, message: str) -> None:
        super().__init__(422, "Unprocessable Entity" if message is None else message)
