"""File storage abstraction (Local filesystem or S3)."""

import os
from abc import ABC, abstractmethod
from uuid import uuid4

import aiofiles
from fastapi import UploadFile

from app.core.config import settings


class StorageBackend(ABC):
    """Abstract storage interface."""

    @abstractmethod
    async def upload(self, file: UploadFile, store_id: int) -> str:
        """Upload file and return URL."""
        ...

    @abstractmethod
    async def delete(self, url: str) -> None:
        """Delete file by URL."""
        ...


class LocalStorage(StorageBackend):
    """Local filesystem storage for development."""

    def __init__(self, upload_dir: str = "uploads/menus"):
        self.upload_dir = upload_dir
        os.makedirs(upload_dir, exist_ok=True)

    async def upload(self, file: UploadFile, store_id: int) -> str:
        ext = file.filename.split(".")[-1].lower() if file.filename else "jpg"
        filename = f"{uuid4()}.{ext}"
        filepath = os.path.join(self.upload_dir, filename)

        async with aiofiles.open(filepath, "wb") as f:
            content = await file.read()
            await f.write(content)

        return f"/uploads/menus/{filename}"

    async def delete(self, url: str) -> None:
        # Convert URL path to filesystem path
        filepath = url.lstrip("/")
        if os.path.exists(filepath):
            os.remove(filepath)
