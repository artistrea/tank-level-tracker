from flask import jsonify


class HTTPException(Exception):
    def __init__(self, statusCode: int, message: str) -> None:
        super().__init__(message)

        self.statusCode = statusCode
        self.message = message

    def get_response(self):
        return jsonify({ "message": self.message }), self.statusCode


class UnauthorizedException(HTTPException):
    def __init__(self, message: str = "Unauthorized") -> None:
        super().__init__(401, message)

class ForbiddenException(HTTPException):
    def __init__(self, message: str = "Forbidden") -> None:
        super().__init__(403, message)

class SessionExpiredException(HTTPException):
    def __init__(self, message: str = "Session Expired") -> None:
        super().__init__(440, message)

class UnprocessableEntityException(HTTPException):
    def __init__(self, message: str = "Unprocessable Entity") -> None:
        super().__init__(422, message)

class InternalServerErrorException(HTTPException):
    def __init__(self) -> None:
        super().__init__(500, "Internal Server Error")
