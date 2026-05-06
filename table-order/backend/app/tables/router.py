"""Table management API endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import UserInfo, get_current_admin
from app.tables.schemas import (
    CompleteSessionResponse,
    DashboardResponse,
    TableResponse,
    TableSetupRequest,
)
from app.tables.service import TableService

router = APIRouter(prefix="/api/tables", tags=["Tables"])


@router.get("", response_model=list[TableResponse])
async def get_tables(
    user: UserInfo = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """테이블 목록 조회."""
    service = TableService(db)
    return await service.get_tables(user.store_id)


@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(
    user: UserInfo = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """관리자 대시보드 데이터 조회."""
    service = TableService(db)
    return await service.get_dashboard(user.store_id)


@router.post("/setup", response_model=TableResponse)
async def setup_table(
    request: TableSetupRequest,
    user: UserInfo = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """테이블 초기 설정."""
    service = TableService(db)
    return await service.setup_table(
        store_id=user.store_id,
        table_number=request.table_number,
        password=request.password,
    )


@router.post("/{table_id}/complete", response_model=CompleteSessionResponse)
async def complete_table(
    table_id: int,
    user: UserInfo = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """테이블 이용 완료 처리."""
    service = TableService(db)
    return await service.complete_session(table_id, user.store_id)
