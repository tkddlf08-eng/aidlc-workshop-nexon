"""Authentication business logic."""

from datetime import datetime, timedelta, timezone

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.repository import AuthRepository
from app.auth.schemas import (
    AdminLoginRequest,
    AdminTokenResponse,
    PasswordChangeRequest,
    TableLoginRequest,
    TableTokenResponse,
)
from app.core.config import settings
from app.core.exceptions import (
    AccountLockedError,
    AuthenticationError,
    ValidationError,
)
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.tables.repository import TableRepository

logger = structlog.get_logger()

MAX_ADMIN_ATTEMPTS = 5
ADMIN_LOCK_MINUTES = 15
MAX_TABLE_ATTEMPTS = 3
TABLE_LOCK_MINUTES = 5


class AuthService:
    """Authentication service handling login, token, and password logic."""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.auth_repo = AuthRepository(db)
        self.table_repo = TableRepository(db)

    async def admin_login(self, request: AdminLoginRequest) -> AdminTokenResponse:
        """Authenticate admin and return JWT token."""
        # 1. Find store
        store = await self.auth_repo.get_store_by_code(request.store_code)
        if not store:
            raise AuthenticationError("매장 정보 또는 계정 정보가 올바르지 않습니다")

        # 2. Find admin
        admin = await self.auth_repo.get_admin(store.id, request.username)
        if not admin:
            raise AuthenticationError("매장 정보 또는 계정 정보가 올바르지 않습니다")

        # 3. Check if account is locked
        if admin.locked_until and admin.locked_until > datetime.now(timezone.utc):
            remaining = int(
                (admin.locked_until - datetime.now(timezone.utc)).total_seconds() / 60
            )
            raise AccountLockedError(max(remaining, 1))

        # 4. Verify password
        if not verify_password(request.password, admin.password_hash):
            await self._handle_failed_admin_login(admin.id, admin.failed_login_attempts)
            raise AuthenticationError("매장 정보 또는 계정 정보가 올바르지 않습니다")

        # 5. Success - reset attempts and create token
        await self.auth_repo.reset_failed_attempts(admin.id)

        token = create_access_token(
            data={
                "sub": f"admin:{admin.id}",
                "store_id": store.id,
                "role": "admin",
            },
            expires_hours=settings.jwt_admin_expire_hours,
        )

        logger.info("admin_login_success", admin_id=admin.id, store_id=store.id)

        return AdminTokenResponse(
            access_token=token,
            admin_id=admin.id,
            store_id=store.id,
            username=admin.username,
        )

    async def table_login(self, request: TableLoginRequest) -> TableTokenResponse:
        """Authenticate table tablet and return JWT token."""
        # 1. Find store
        store = await self.auth_repo.get_store_by_code(request.store_code)
        if not store:
            raise AuthenticationError("매장 정보 또는 테이블 정보가 올바르지 않습니다")

        # 2. Find table
        table = await self.table_repo.get_by_store_and_number(
            store.id, request.table_number
        )
        if not table:
            raise AuthenticationError("매장 정보 또는 테이블 정보가 올바르지 않습니다")

        # 3. Check if table is locked
        if table.locked_until and table.locked_until > datetime.now(timezone.utc):
            remaining = int(
                (table.locked_until - datetime.now(timezone.utc)).total_seconds() / 60
            )
            raise AccountLockedError(max(remaining, 1))

        # 4. Verify password
        if not verify_password(request.password, table.password_hash):
            await self._handle_failed_table_login(
                table.id, table.failed_login_attempts
            )
            raise AuthenticationError("매장 정보 또는 테이블 정보가 올바르지 않습니다")

        # 5. Success - reset attempts and create token (no expiry for tables)
        await self.table_repo.reset_failed_attempts(table.id)

        token = create_access_token(
            data={
                "sub": f"table:{table.id}",
                "store_id": store.id,
                "table_id": table.id,
                "table_number": table.table_number,
                "role": "customer",
            },
            expires_hours=None,  # No expiry for table tokens
        )

        logger.info("table_login_success", table_id=table.id, store_id=store.id)

        return TableTokenResponse(
            access_token=token,
            table_id=table.id,
            store_id=store.id,
            table_number=table.table_number,
        )

    async def change_password(
        self, admin_id: int, request: PasswordChangeRequest
    ) -> None:
        """Change admin password."""
        admin = await self.auth_repo.get_admin_by_id(admin_id)
        if not admin:
            raise AuthenticationError("관리자를 찾을 수 없습니다")

        if not verify_password(request.current_password, admin.password_hash):
            raise ValidationError("현재 비밀번호가 일치하지 않습니다")

        if request.current_password == request.new_password:
            raise ValidationError("새 비밀번호는 현재 비밀번호와 달라야 합니다")

        new_hash = hash_password(request.new_password)
        await self.auth_repo.update_password(admin_id, new_hash)
        logger.info("password_changed", admin_id=admin_id)

    async def _handle_failed_admin_login(
        self, admin_id: int, current_attempts: int
    ) -> None:
        """Handle failed admin login attempt."""
        await self.auth_repo.increment_failed_attempts(admin_id)
        new_count = current_attempts + 1

        if new_count >= MAX_ADMIN_ATTEMPTS:
            lock_until = datetime.now(timezone.utc) + timedelta(
                minutes=ADMIN_LOCK_MINUTES
            )
            await self.auth_repo.lock_account(admin_id, lock_until)
            logger.warning("admin_account_locked", admin_id=admin_id)

    async def _handle_failed_table_login(
        self, table_id: int, current_attempts: int
    ) -> None:
        """Handle failed table login attempt."""
        await self.table_repo.increment_failed_attempts(table_id)
        new_count = current_attempts + 1

        if new_count >= MAX_TABLE_ATTEMPTS:
            lock_until = datetime.now(timezone.utc) + timedelta(
                minutes=TABLE_LOCK_MINUTES
            )
            await self.table_repo.lock_table(table_id, lock_until)
            logger.warning("table_account_locked", table_id=table_id)
