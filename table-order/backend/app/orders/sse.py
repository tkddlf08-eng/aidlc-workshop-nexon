"""Server-Sent Events manager for real-time order notifications."""

import asyncio
import json
from collections.abc import AsyncGenerator

import structlog
from sse_starlette.sse import ServerSentEvent

logger = structlog.get_logger()


class SSEManager:
    """In-memory SSE connection manager with channel-based routing."""

    def __init__(self):
        self._admin_clients: dict[str, asyncio.Queue] = {}
        self._table_clients: dict[int, asyncio.Queue] = {}
        self._event_counter: int = 0

    @property
    def admin_count(self) -> int:
        return len(self._admin_clients)

    @property
    def table_count(self) -> int:
        return len(self._table_clients)

    async def subscribe_admin(self, client_id: str) -> AsyncGenerator:
        """Subscribe admin to all order events."""
        queue: asyncio.Queue = asyncio.Queue()
        self._admin_clients[client_id] = queue
        logger.info("sse_admin_connected", client_id=client_id)
        try:
            while True:
                event = await queue.get()
                yield event
        finally:
            del self._admin_clients[client_id]
            logger.info("sse_admin_disconnected", client_id=client_id)

    async def subscribe_table(self, table_id: int) -> AsyncGenerator:
        """Subscribe table to its own order status events."""
        queue: asyncio.Queue = asyncio.Queue()
        self._table_clients[table_id] = queue
        logger.info("sse_table_connected", table_id=table_id)
        try:
            while True:
                event = await queue.get()
                yield event
        finally:
            if table_id in self._table_clients:
                del self._table_clients[table_id]
            logger.info("sse_table_disconnected", table_id=table_id)

    async def broadcast_admin(self, event_type: str, data: dict) -> None:
        """Broadcast event to all admin clients."""
        self._event_counter += 1
        event = ServerSentEvent(
            data=json.dumps(data, default=str),
            event=event_type,
            id=str(self._event_counter),
        )
        for client_id, queue in list(self._admin_clients.items()):
            try:
                await queue.put(event)
            except Exception:
                logger.warning("sse_broadcast_failed", client_id=client_id)

    async def notify_table(self, table_id: int, event_type: str, data: dict) -> None:
        """Send event to a specific table client."""
        if table_id not in self._table_clients:
            return

        self._event_counter += 1
        event = ServerSentEvent(
            data=json.dumps(data, default=str),
            event=event_type,
            id=str(self._event_counter),
        )
        try:
            await self._table_clients[table_id].put(event)
        except Exception:
            logger.warning("sse_table_notify_failed", table_id=table_id)

    async def shutdown(self) -> None:
        """Clean up all connections on shutdown."""
        self._admin_clients.clear()
        self._table_clients.clear()
        logger.info("sse_manager_shutdown")


# Singleton instance
sse_manager = SSEManager()
