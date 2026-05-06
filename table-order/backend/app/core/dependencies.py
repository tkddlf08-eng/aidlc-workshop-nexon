"""FastAPI dependency injection utilities."""

from fastapi import Depends, Query, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.exceptions import AuthenticationError, AuthorizationError
from app.core.security import decode_access_token

security_scheme = HTTPBearer(auto_error=False)


class PaginationParams:
    """Pagination query parameters."""

    def __init__(
        self,
        page: int = Query(1, ge=1, description="페이지 번호"),
        limit: int = Query(10, ge=1, le=50, description="페이지당 항목 수"),
    ):
        self.page = page
        self.limit = limit

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.limit


class UserInfo:
    """Authenticated user information from JWT."""

    def __init__(self, sub: str, store_id: int, role: str, **kwargs):
        self.sub = sub
        self.store_id = store_id
        self.role = role
        self.table_id = kwargs.get("table_id")
        self.table_number = kwargs.get("table_number")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
) -> UserInfo:
    """Get current authenticated user from JWT token."""
    if credentials is None:
        raise AuthenticationError("인증 토큰이 필요합니다")

    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise AuthenticationError("유효하지 않은 토큰입니다")

    return UserInfo(**payload)


async def get_current_admin(
    user: UserInfo = Depends(get_current_user),
) -> UserInfo:
    """Ensure current user is an admin."""
    if user.role != "admin":
        raise AuthorizationError("관리자 권한이 필요합니다")
    return user


async def get_current_table(
    user: UserInfo = Depends(get_current_user),
) -> UserInfo:
    """Ensure current user is a table (customer)."""
    if user.role != "customer":
        raise AuthorizationError("테이블 인증이 필요합니다")
    return user
