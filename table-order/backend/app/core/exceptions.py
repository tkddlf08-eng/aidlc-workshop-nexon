"""Custom application exceptions."""


class AppException(Exception):
    """Base application exception."""

    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class AuthenticationError(AppException):
    """Authentication failed."""

    def __init__(self, message: str = "인증에 실패했습니다"):
        super().__init__(code="AUTHENTICATION_ERROR", message=message, status_code=401)


class AuthorizationError(AppException):
    """Authorization failed."""

    def __init__(self, message: str = "접근 권한이 없습니다"):
        super().__init__(code="AUTHORIZATION_ERROR", message=message, status_code=403)


class NotFoundError(AppException):
    """Resource not found."""

    def __init__(self, resource: str = "리소스"):
        super().__init__(
            code="NOT_FOUND",
            message=f"{resource}을(를) 찾을 수 없습니다",
            status_code=404,
        )


class ConflictError(AppException):
    """State conflict."""

    def __init__(self, message: str):
        super().__init__(code="CONFLICT", message=message, status_code=409)


class ValidationError(AppException):
    """Validation failed."""

    def __init__(self, message: str):
        super().__init__(code="VALIDATION_ERROR", message=message, status_code=422)


class AccountLockedError(AppException):
    """Account is locked due to too many failed attempts."""

    def __init__(self, minutes_remaining: int):
        super().__init__(
            code="ACCOUNT_LOCKED",
            message=f"계정이 잠겼습니다. {minutes_remaining}분 후 다시 시도해주세요",
            status_code=403,
        )
