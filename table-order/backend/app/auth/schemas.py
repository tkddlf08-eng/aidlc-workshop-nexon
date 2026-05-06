"""Authentication request/response schemas."""

from pydantic import BaseModel, Field


class AdminLoginRequest(BaseModel):
    """Admin login request."""

    store_code: str = Field(..., min_length=1, max_length=50)
    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=1)


class TableLoginRequest(BaseModel):
    """Table tablet login request."""

    store_code: str = Field(..., min_length=1, max_length=50)
    table_number: int = Field(..., ge=1, le=99)
    password: str = Field(..., min_length=1)


class TokenResponse(BaseModel):
    """JWT token response."""

    access_token: str
    token_type: str = "bearer"


class AdminTokenResponse(TokenResponse):
    """Admin login response with user info."""

    admin_id: int
    store_id: int
    username: str


class TableTokenResponse(TokenResponse):
    """Table login response with table info."""

    table_id: int
    store_id: int
    table_number: int


class UserInfoResponse(BaseModel):
    """Current user info response."""

    sub: str
    store_id: int
    role: str
    table_id: int | None = None
    table_number: int | None = None


class PasswordChangeRequest(BaseModel):
    """Password change request."""

    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8)
