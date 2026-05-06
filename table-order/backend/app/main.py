"""FastAPI application entry point."""

from contextlib import asynccontextmanager
from uuid import uuid4

import structlog
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import settings
from app.core.exceptions import AppException
from app.core.logging import setup_logging


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown."""
    setup_logging()
    logger = structlog.get_logger()
    logger.info("application_starting", env=settings.app_env)
    yield
    logger.info("application_shutting_down")


app = FastAPI(
    title="Table Order API",
    description="테이블오더 서비스 Backend API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.app_debug else None,
    redoc_url="/redoc" if settings.app_debug else None,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files (local image serving)
if settings.storage_backend == "local":
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# Request ID middleware
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = str(uuid4())
    structlog.contextvars.bind_contextvars(request_id=request_id)
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    structlog.contextvars.unbind_contextvars("request_id")
    return response


# Exception handlers
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.code, "message": exc.message}},
    )


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={
            "error": {
                "code": "RATE_LIMIT_EXCEEDED",
                "message": "요청 횟수를 초과했습니다. 잠시 후 다시 시도해주세요",
            }
        },
    )


# Register routers
from app.auth.router import router as auth_router
from app.orders.router import router as orders_router
from app.menus.router import router as menus_router
from app.tables.router import router as tables_router

app.include_router(auth_router)
app.include_router(orders_router)
app.include_router(menus_router)
app.include_router(tables_router)


# Health check
@app.get("/health", tags=["Health"])
async def health_check():
    """Application health check endpoint."""
    return {"status": "healthy", "env": settings.app_env}
