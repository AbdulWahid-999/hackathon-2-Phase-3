class TodoException(Exception):
    """Base exception for todo application"""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class UserNotFoundException(TodoException):
    """Raised when user is not found"""
    def __init__(self, message: str = "User not found"):
        super().__init__(message, 404)

class TodoNotFoundException(TodoException):
    """Raised when todo is not found"""
    def __init__(self, message: str = "Todo not found"):
        super().__init__(message, 404)

class DuplicateEmailException(TodoException):
    """Raised when trying to create a user with duplicate email"""
    def __init__(self, message: str = "Email already registered"):
        super().__init__(message, 409)

class UnauthorizedException(TodoException):
    """Raised when user is not authorized"""
    def __init__(self, message: str = "Not authorized"):
        super().__init__(message, 401)

class InvalidCredentialsException(TodoException):
    """Raised when invalid credentials are provided"""
    def __init__(self, message: str = "Invalid credentials"):
        super().__init__(message, 401)