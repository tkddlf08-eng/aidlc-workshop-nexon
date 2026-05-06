"""Authentication API endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.schemas import (
    AdminLoginRequest,
    AdminTokenResponse,
    PasswordChangeRequest,
    TableLoginRequest,
    TableTokenResponse,
    UserInfoResponse,
)
from app.auth.service import AuthService
from app.core.database import get_db
from app.core.dependencies import UserInfo, get_current_admin, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/admin/login", response_model=AdminTokenResponse)
async def admin_login(
    request: AdminLoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """관리자 로그인."""
    service = AuthService(db)
    return await service.admin_login(request)


@router.post("/admin/logout")
async def admin_logout(
    user: UserInfo = Depends(get_current_admin),
):
    """관리자 로그아웃 (클라이언트에서 토큰 삭제)."""
    return {"message": "로그아웃 되었습니다"}


@router.post("/table/login", response_model=TableTokenResponse)
async def table_login(
    request: TableLoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """테이블 태블릿 로그인."""
    service = AuthService(db)
    return await service.table_login(request)


@router.get("/me", response_model=UserInfoResponse)
async def get_me(user: UserInfo = Depends(get_current_user)):
    """현재 인증 정보 확인."""
    return UserInfoResponse(
        sub=user.sub,
        store_id=user.store_id,
        role=user.role,
        table_id=user.table_id,
        table_number=user.table_number,
    )


@router.put("/admin/password")
async def change_password(
    request: PasswordChangeRequest,
    user: UserInfo = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """관리자 비밀번호 변경."""
    admin_id = int(user.sub.split(":")[1])
    service = AuthService(db)
    await service.change_password(admin_id, request)
    return {"message": "비밀번호가 변경되었습니다"}
