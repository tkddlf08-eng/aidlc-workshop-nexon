"""Tests for admin login endpoint."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.models import Admin, Store
from app.core.security import hash_password


@pytest.mark.asyncio
async def test_admin_login_success(client: AsyncClient, db_session: AsyncSession):
    """Test successful admin login."""
    # Setup
    store = Store(name="Test Store", store_code="test-store")
    db_session.add(store)
    await db_session.flush()

    admin = Admin(
        store_id=store.id,
        username="testadmin",
        password_hash=hash_password("password123"),
    )
    db_session.add(admin)
    await db_session.commit()

    # Act
    response = await client.post("/api/auth/admin/login", json={
        "store_code": "test-store",
        "username": "testadmin",
        "password": "password123",
    })

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["username"] == "testadmin"


@pytest.mark.asyncio
async def test_admin_login_wrong_password(client: AsyncClient, db_session: AsyncSession):
    """Test login with wrong password."""
    store = Store(name="Test Store", store_code="test-store")
    db_session.add(store)
    await db_session.flush()

    admin = Admin(
        store_id=store.id,
        username="testadmin",
        password_hash=hash_password("password123"),
    )
    db_session.add(admin)
    await db_session.commit()

    response = await client.post("/api/auth/admin/login", json={
        "store_code": "test-store",
        "username": "testadmin",
        "password": "wrongpassword",
    })

    assert response.status_code == 401
